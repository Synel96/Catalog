import { create } from "zustand";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/src/services/notificationService";
import type { Notification } from "@/src/types/api";

type NotificationsState = {
  notifications: Notification[];
  loaded: boolean;
  fetch: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  clear: () => void;
};

// Marking read updates the list right away; the server catches up.
export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  loaded: false,

  fetch: async () => {
    try {
      set({ notifications: await getNotifications(), loaded: true });
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    }));
    await markNotificationRead(id).catch((error) => console.error(error));
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    }));
    await markAllNotificationsRead().catch((error) => console.error(error));
  },

  clear: () => set({ notifications: [], loaded: false }),
}));
