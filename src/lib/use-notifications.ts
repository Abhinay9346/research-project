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
  read?: boolean; // mapped field
  date?: string;  // mapped field
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data?.success) {
        const data = response.data.data.map((n: any) => ({
          ...n,
          read: n.is_read === 1 || n.is_read === true,
          date: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
        }));
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      if (response.data?.success) {
        setNotifications((prev) => 
          prev.map((n) => n.id === id ? { ...n, is_read: true, read: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // We can iterate and mark all as read or add a bulk endpoint, 
    // but the backend only has /notifications/:id/read. 
    // We will do it locally and dispatch the promises, but no backend bulk endpoint exists right now.
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      api.put(`/notifications/${n.id}/read`).catch(() => {});
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.data?.success) {
        setNotifications((prev) => {
           const updated = prev.filter((n) => n.id !== id);
           setUnreadCount(updated.filter(n => !n.read).length);
           return updated;
        });
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  }, []);

  // For compatibility with any optimistic local add
  const addNotification = useCallback((_n: any) => {
    // Do nothing or call fetch
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
    addNotification
  };
}
