import type { AppNotification } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const notificationsApi = {
  list: () => request<AppNotification[]>('/api/notifications'),
  unreadCount: () => request<{ count: number }>('/api/notifications/unread-count'),
  markRead: (id: string) =>
    request<AppNotification>(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request<null>('/api/notifications/read-all', { method: 'POST' }),
};
