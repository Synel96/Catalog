import i18n from "@/src/i18n";
import { api, toApiError } from "./api";
import type { LoginCredentials, RegisterPayload } from "@/src/types/api";

export async function registerUser(payload: RegisterPayload): Promise<unknown> {
  try {
    const response = await api.post("auth/register/", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.registrationFailed"));
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<unknown> {
  try {
    const response = await api.post("auth/login/", credentials);
    return response.data;
  } catch (error) {
    throw toApiError(error, i18n.t("errors.loginFailed"));
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("auth/logout/");
  } catch (error) {
    throw toApiError(error, i18n.t("errors.logoutFailed"));
  }
}
