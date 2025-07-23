// types/notification.ts
export interface Notification {
    id: string;
    row_id: string;
    recipient_id: string;
    recipient_type: string;
    triggerer_id: string;
    triggerer_type: string;
    notification_type: string;
    media_thumbnail: string;
    notification_timestamp: Date;
    read_at: Date | null;
    title: string;
    meaningful_text: string;
    activity_id?: string;
    activity_type?: 'event' | 'post';
    action_url?: string;
    metadata?: Record<string, any>;
  }
  
  export interface GroupedNotifications {
    message: Notification[];
    comment: Notification[];
    like: Notification[];
    activity_join: Notification[];
  }
  
  export interface NotificationCounts {
    message: number;
    comment: number;
    like: number;
    activity_join: number;
    total: number;
    lastViewed?: number;
  }
  
  export type NotificationType = 
    | 'message'
    | 'comment'
    | 'like'
    | 'join_request_voting'
    | 'join_request_accepted';
  