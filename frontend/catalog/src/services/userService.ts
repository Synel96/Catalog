import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { User } from "@/src/types/api";

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<User>("profiles/me/");
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.fetchUserData"));
  }
}

export async function updateCurrentUser(formData: FormData): Promise<User> {
  try {
    const response = await api.patch<User>("profiles/me/", formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.updateUserData"));
  }
}
