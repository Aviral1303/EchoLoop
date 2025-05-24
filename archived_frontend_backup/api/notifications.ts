import apiClient from '@/lib/api-client';

// Types
export interface Notification {
  id: string;
  type: 'email_summary' | 'reminder' | 'action_item' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    emailId?: string;
    actionItemId?: string;
    url?: string;
  };
}

/**
 * Fetch user's notifications
 */
export const fetchNotifications = async (params?: { 
  page?: number; 
  limit?: number;
  unreadOnly?: boolean;
}): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[]>('/notifications', { params });
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.put(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.put('/notifications/read-all');
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
}; 