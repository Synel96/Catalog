import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { Notification } from "@/src/types/api";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await api.get<Notification[]>("feed/notifications/");
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

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await api.post("feed/notifications/mark-all-read/");
  } catch (error) {
    throw toApiError(error, i18n.t("errors.updateNotifications"));
  }
}
