import client from './client';

export interface Notification {
  id: number;
  type: 'system' | 'like' | 'comment' | 'follow';
  title: string;
  content: string;
  target_id?: number;
  target_type?: 'recipe' | 'restaurant' | 'user';
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export const getNotifications = async (page: number = 1, type?: string): Promise<Notification[]> => {
  const response = await client.get('/notifications', { params: { page, type } });
  return response.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await client.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id: number): Promise<void> => {
  await client.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await client.post('/notifications/read-all');
};
