import { api, toApiError } from "./api";
import type { Notification } from "@/src/types/api";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await api.get<Notification[]>("feed/notifications/");
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load notifications.");
  }
}

export async function markNotificationRead(id: number): Promise<void> {
  try {
    await api.patch(`feed/notifications/${id}/`, { is_read: true });
  } catch (error) {
    throw toApiError(error, "Failed to update notification.");
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await api.post("feed/notifications/mark-all-read/");
  } catch (error) {
    throw toApiError(error, "Failed to update notifications.");
  }
}
