import { api, toApiError } from "./api";
import type { User } from "@/src/types/api";

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<User>("profiles/me/");
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch user data.");
  }
}

export async function updateCurrentUser(formData: FormData): Promise<User> {
  try {
    const response = await api.patch<User>("profiles/me/", formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to update user data.");
  }
}
