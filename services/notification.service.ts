// services/notification.service.ts
import axios from 'axios';
import { GroupedNotifications, NotificationCounts } from '../types/notification';

class NotificationService {
  /**
   * Fetches all notifications for the current user
   */
  async getNotifications(): Promise<GroupedNotifications> {
    try {
      const response = await axios.get('/api/notifications', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        message: [],
        comment: [],
        like: [],
        activity_join: []
      };
    }
  }

  /**
   * Fetches unread notification counts
   */
  async getUnreadCounts(): Promise<NotificationCounts> {
    try {
      const response = await axios.get('/api/notifications/unread-count', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return {
        message: 0,
        comment: 0,
        like: 0,
        activity_join: 0,
        total: 0
      };
    }
  }

  /**
   * Marks a notification as read
   * @param id - Optional notification ID. If not provided, all notifications will be marked as read.
   * @param all - If true, mark all notifications as read
   */
  async markAsRead(id?: string, all: boolean = false): Promise<boolean> {
    try {
      await axios.put('/api/notifications/mark-read', {
        id,
        all
      }, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Creates a notification via the server
   * @param userId - The triggerer user ID
   * @param activityId - The activity ID
   * @param actionType - The action type (like, comment, etc.)
   */
  async createNotification(userId: string, activityId: string, actionType: string): Promise<boolean> {
    try {
      // This would typically be done via socket.io
      // But we provide this as a backup method
      await axios.post('/api/notifications/create', {
        userId,
        activityId,
        actionType
      }, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  /**
   * Clears all notifications for the current user
   */
  async clearAll(): Promise<boolean> {
    try {
      await axios.delete('/api/notifications/clear', { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();
export default notificationService;