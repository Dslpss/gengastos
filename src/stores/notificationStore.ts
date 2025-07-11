import { create } from "zustand";

export type NotificationType =
  | "budget_exceeded"
  | "low_balance"
  | "unusual_transaction"
  | "upcoming_bill";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  data?: any;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
      return {
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
