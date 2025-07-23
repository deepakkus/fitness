// lib/notification-utils.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface NotificationOptions {
  activityId: string | number;
  actionType: 'like' | 'comment' | 'message' | 'activity_join' | 'join_request_accepted';
  actorId: bigint | string | number;        // User who performed the action
  activityCreatorId?: bigint | string | number; // Activity creator (optional)
  excludeIds?: Array<bigint | string | number>; // Additional IDs to exclude
  includeIds?: Array<bigint | string | number>; // Specific IDs to include
  title?: string;                          // Activity title
  isEvent?: boolean;                       // Whether it's an event or post
  messagePreview?: string;                 // For message notifications
  priority?: number;                       // Priority level (1-3)
  customActionUrl?: string;                // Override default action URL
  customMetadata?: Record<string, any>;    // Additional custom metadata
}

interface NotificationRecipient {
  user_id: bigint;
}

/**
 * Creates or updates notifications for activity actions
 * 
 * @param options Configuration options for notification creation
 * @returns An array of created or updated notification IDs
 */
export async function createOrUpdateNotifications(options: NotificationOptions): Promise<string[]> {
  const {
    activityId,
    actionType,
    actorId,
    activityCreatorId,
    excludeIds = [],
    includeIds,
    title = "",
    isEvent = false,
    messagePreview,
    priority = 1,
    customActionUrl,
    customMetadata = {}
  } = options;

  // Convert IDs to strings for consistent comparison
  const actorIdStr = actorId.toString();
  const activityCreatorIdStr = activityCreatorId?.toString();
  const excludeIdsStr = excludeIds.map(id => id.toString());
  
  // Add actor and creator to exclude list if they're defined
  if (actorIdStr && !excludeIdsStr.includes(actorIdStr)) {
    excludeIdsStr.push(actorIdStr);
  }
  if (activityCreatorIdStr && !excludeIdsStr.includes(activityCreatorIdStr)) {
    excludeIdsStr.push(activityCreatorIdStr);
  }
  
  try {
    // Get activity details if not provided
    let activityDetails = { title, is_event: isEvent };
    if (!title || isEvent === undefined) {
      const activity = await prisma.activities.findUnique({
        where: { id: BigInt(activityId) },
        select: { 
          title: true,
          is_event: true 
        }
      });
      if (activity) {
        activityDetails = { 
          title: activity.title || title, 
          is_event: activity.is_event !== undefined ? activity.is_event : isEvent 
        };
      }
    }

    // Determine recipients based on strategy
    let recipients: NotificationRecipient[] = [];
    
    if (includeIds && includeIds.length > 0) {
      // If specific includes are provided, use them
      recipients = includeIds.map(id => ({ user_id: BigInt(id) }));
    } else {
      // Otherwise, get all activity members excluding specified IDs
      recipients = await prisma.activity_members.findMany({
        where: { 
          activity_id: BigInt(activityId),
          user_id: {
            notIn: excludeIdsStr.map(id => BigInt(id))
          }
        },
        select: { user_id: true }
      });
    }
    
    // console.log(`[Notification] Creating ${actionType} notifications for ${recipients.length} recipients`);
    
    const notificationIds: string[] = [];
    
    // Determine default action URL based on action type
    let defaultActionUrl = '';
    if (actionType === 'message') {
      defaultActionUrl = '/messages';
    } else if (actionType === 'join_request_accepted') {
      defaultActionUrl = activityDetails.is_event ? `/event/${activityId}` : `/posts/${activityId}`;
    } else if (actionType === 'activity_join') {
      defaultActionUrl = '/requests';
    } else {
      defaultActionUrl = activityDetails.is_event ? `/event/${activityId}` : `/posts/${activityId}`;
    }
    
    const actionUrl = customActionUrl || defaultActionUrl;
    
    // Process each recipient
    for (const recipient of recipients) {
      const recipientId = recipient.user_id;
      const notification_key = `${actionType}_${activityId}_${recipientId}_${Date.now()}`;
      const aggregationKey = `activity_${activityId}_${actionType}`;
      
      // Create base metadata
      const baseMetadata = {
        title: activityDetails.title || "",
        activityId: activityId.toString(),
        activityType: activityDetails.is_event ? 'event' : 'post',
        actionType: actionType,
        ...customMetadata
      };
      
      // Add message preview for message notifications
      if (actionType === 'message' && messagePreview) {
        baseMetadata['messagePreview'] = messagePreview;
      }
      
      // Check for existing notifications to update (aggregate)
      if (['like', 'comment'].includes(actionType)) {
        // Create a time window for aggregation (last 24 hours)
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);
        
        const existingNotification = await prisma.notifications.findFirst({
          where: {
            recipient_id: recipientId,
            notification_type: actionType,
            aggregation_key: aggregationKey,
            deleted_at: null,
            read_at: null, // Only aggregate unread
            created_at: { gte: cutoffTime },
          },
          orderBy: {
            created_at: 'desc'
          }
        });
        
        if (existingNotification) {
          // Parse existing metadata
          let metadata = {};
          try {
            metadata = JSON.parse(existingNotification.metadata?.toString() || '{}');
          } catch (e) {
            console.error(`Error parsing metadata: ${e}`);
            metadata = {};
          }
          
          // Update count and triggerers
          const count = (metadata.count || 1) + 1;
          let triggerers = metadata.triggerers || [];
          
          if (!triggerers.includes(actorIdStr)) {
            triggerers.unshift(actorIdStr);
            if (triggerers.length > 5) {
              triggerers = triggerers.slice(0, 5);
            }
          }
          
          // Update the notification
          await prisma.notifications.update({
            where: { id: existingNotification.id },
            data: {
              metadata: JSON.stringify({
                ...baseMetadata,
                count: count,
                triggerers: triggerers,
                lastUpdate: new Date().toISOString()
              }),
              updated_at: new Date()
            }
          });
          
          notificationIds.push(existingNotification.id.toString());
          continue; // Skip to next recipient
        }
      }
      
      // If no existing notification was updated, create a new one
      const newNotification = await prisma.notifications.create({
        data: {
          recipient_id: recipientId,
          recipient_type: "user",
          triggerer_id: BigInt(actorId),
          triggerer_type: "user",
          notification_type: actionType,
          notification_key: notification_key,
          metadata: JSON.stringify({
            ...baseMetadata,
            count: 1,
            triggerers: [actorIdStr]
          }),
          action_url: actionUrl,
          priority: priority,
          aggregation_key: aggregationKey,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      
      notificationIds.push(newNotification.id.toString());
    }
    
    return notificationIds;
  } catch (error) {
    console.error(`[Notification] Error creating/updating notifications:`, error);
    throw error;
  }
}