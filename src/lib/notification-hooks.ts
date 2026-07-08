import { useState, useEffect, useCallback } from 'react';
import api from './api';

export interface Notification {
  id: string;
  recipient_user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: string | null;
  record_id: string | null;
  is_read: boolean | number;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data?.success) {
        const data = response.data.data;
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data?.success) {
        setNotifications((prev) => 
          prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.data?.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
