import { api, toApiError } from "./api";
import type { LoginCredentials, RegisterPayload } from "@/src/types/api";

export async function registerUser(payload: RegisterPayload): Promise<unknown> {
  try {
    const response = await api.post("auth/register/", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Registration failed.");
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<unknown> {
  try {
    const response = await api.post("auth/login/", credentials);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Login failed.");
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("auth/logout/");
  } catch (error) {
    throw toApiError(error, "Logout failed.");
  }
}
