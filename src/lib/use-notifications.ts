import { useState, useEffect, useCallback } from 'react';
import type { Notification } from './types';

const STORAGE_KEY = 'rsms_notifications';

const defaultNotifications: Notification[] = [
  { id: 'n1', type: 'log', title: 'Weekly Log Pending Review', message: 'A new weekly log has been submitted and awaits your review.', date: new Date().toISOString().split('T')[0], read: false },
  { id: 'n2', type: 'meeting', title: 'Committee Meeting Reminder', message: 'A committee meeting is scheduled soon. Check the Committee page for details.', date: new Date().toISOString().split('T')[0], read: false },
  { id: 'n3', type: 'publication', title: 'Publication Verification', message: 'A publication has been verified by the research office.', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], read: true },
  { id: 'n4', type: 'deadline', title: 'Thesis Submission Deadline', message: 'A thesis submission deadline is approaching within 30 days.', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], read: true },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(defaultNotifications);
      }
    } else {
      setNotifications(defaultNotifications);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'date' | 'read'>) => {
    setNotifications((prev) => {
      const newNotif: Notification = {
        ...n,
        id: `n${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        read: false,
      };
      const updated = [newNotif, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAsRead, markAllAsRead, addNotification };
}
