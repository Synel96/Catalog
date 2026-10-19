import { create } from "zustand";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/src/services/notificationService";
import type { Notification } from "@/src/types/api";

type NotificationsState = {
  // Whose notifications these are: the overlord out on the Street.
  overlordId: number | null;
  notifications: Notification[];
  loaded: boolean;
  fetch: (overlordId: number) => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  clear: () => void;
};

// Marking read updates the list right away; the server catches up.
export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  overlordId: null,
  notifications: [],
  loaded: false,

  fetch: async (overlordId) => {
    // Another cat: don't show the previous one's list while loading.
    if (get().overlordId !== overlordId) set({ overlordId, notifications: [], loaded: false });
    try {
      const notifications = await getNotifications(overlordId);
      // Ignore a late answer for a cat that has gone home since.
      if (get().overlordId === overlordId) set({ notifications, loaded: true });
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
    const { overlordId } = get();
    if (overlordId === null) return;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    }));
    await markAllNotificationsRead(overlordId).catch((error) => console.error(error));
  },

  clear: () => set({ overlordId: null, notifications: [], loaded: false }),
}));
