import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/components/site";
import type { ApiError } from "@/src/types/api";

// Auth lives in HttpOnly cookies set by the backend, so every request must
// send credentials. No Content-Type default: axios picks JSON or multipart
// (with boundary) based on the body.
export const api = axios.create({
  baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
  withCredentials: true,
});

// Mock mode: the mock backend answers right in the page (src/mocks/adapter.ts).
// The literal env check lets builds without mocks drop the import entirely.
if (import.meta.env.VITE_API_MOCKS === "true") {
  api.defaults.adapter = async (config) =>
    (await import("@/src/mocks/adapter")).mockAdapter(config);
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const NO_REFRESH_PATHS = ["auth/login/", "auth/register/", "auth/refresh/", "auth/logout/"];

// Access tokens are short-lived (5 min), so on a 401 try the refresh cookie
// once and replay the request.
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const skip = !config || config._retried || NO_REFRESH_PATHS.includes(config.url ?? "");
  if (error.response?.status !== 401 || skip) throw error;

  config._retried = true;
  await api.post("auth/refresh/");
  return api(config);
});

// Normalizes any thrown value into `{ detail }` so the UI has one thing to show.
export function toApiError(error: unknown, fallback: string): ApiError {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === "object") {
      if ("detail" in data && typeof data.detail === "string") return { detail: data.detail };
      const first = Object.entries(data)[0];
      if (first) {
        const [field, messages] = first;
        const message = Array.isArray(messages) ? messages[0] : messages;
        if (typeof message === "string") return { detail: `${field}: ${message}` };
      }
    }
  }
  return { detail: fallback };
}

// Media fields are usually absolute URLs, but fall back to the API's origin
// for relative paths and to the backend's placeholder when empty.
export function mediaUrl(path: string | null | undefined, placeholder: string): string {
  const value = path || placeholder;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  // A relative API_URL (mock mode) means media is served by the site itself.
  if (API_URL.startsWith("/")) return value;
  return new URL(value, API_URL).toString();
}
