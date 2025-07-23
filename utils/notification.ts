
  // utils/notification.ts
  import { Notification, NotificationType } from '../types/notification';
  
  /**
   * Gets the action URL for a notification based on its type and metadata
   */
  export function getNotificationActionUrl(
    notification: Notification
  ): string {
    // If there's an explicit action URL, use it
    if (notification.action_url) {
      return notification.action_url;
    }
    
    // Otherwise, determine based on notification type
    switch (notification.notification_type as NotificationType) {
      case 'message':
        return '/messages';
      case 'comment':
      case 'like':
        if (notification.activity_id) {
          return `/${notification.activity_type === 'event' ? 'event' : 'posts'}/${notification.activity_id}`;
        }
        return '/activities';
      case 'join_request_voting':
        return '/requests';
      case 'join_request_accepted':
        return '/messages';
      default:
        return '/';
    }
  }
  
  /**
   * Generates meaningful text for a notification
   */
  export function getNotificationText(
    notification: Notification, 
    userMap: Record<string, { name: string; profile_picture?: string }>
  ): string {
    const triggererName = userMap[notification.triggerer_id]?.name || 'Someone';
    
    switch (notification.notification_type as NotificationType) {
      case 'message':
        return `${triggererName} sent a message`;
      case 'comment':
        return `${triggererName} commented on the activity`;
      case 'like':
        return `${triggererName} liked the activity`;
      case 'join_request_voting':
        return `${triggererName} requested to join`;
      case 'join_request_accepted':
        return 'You got accepted into group';
      default:
        return notification.notification_type;
    }
  }
  
  /**
   * Formats a notification timestamp for display
   */
  export function formatNotificationTime(timestamp: Date | string | undefined): string {
    if (!timestamp) return '';
    
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  }