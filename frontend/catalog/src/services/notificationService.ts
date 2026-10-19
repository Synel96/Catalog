import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { Notification } from "@/src/types/api";

// Notifications of one overlord (the one out on the Street).
export async function getNotifications(overlordId: number): Promise<Notification[]> {
  try {
    const response = await api.get<Notification[]>("feed/notifications/", {
      params: { overlord: overlordId },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.loadNotifications"));
  }
}

export async function markNotificationRead(id: number): Promise<void> {
  try {
    await api.patch(`feed/notifications/${id}/`, { is_read: true });
  } catch (error) {
    throw toApiError(error, i18n.t("errors.updateNotification"));
  }
}

export async function markAllNotificationsRead(overlordId: number): Promise<void> {
  try {
    await api.post("feed/notifications/mark-all-read/", undefined, {
      params: { overlord: overlordId },
    });
  } catch (error) {
    throw toApiError(error, i18n.t("errors.updateNotifications"));
  }
}
