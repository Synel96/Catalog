import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getResponse } from "msw";
import { FORM_HEADER, stashForm } from "./forms";
import { handlers } from "./handlers";

// The axios adapter for mock mode: instead of going over the network (or
// through a service worker), each request is answered right here by the
// mock handlers (src/mocks/handlers.ts). Nothing depends on the browser's
// service worker support, its first-load timing or private windows.

const isFormData = (value: unknown): value is FormData =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as FormData).append === "function" &&
  typeof (value as FormData).entries === "function";

const STEP_MS = import.meta.env.MODE === "test" ? 0 : 60;

// Nothing is really sent, but the upload indicator should behave as it does
// against the real backend: a few progress steps sized by the files.
async function reportUpload(config: InternalAxiosRequestConfig, form: FormData) {
  if (!config.onUploadProgress) return;
  let total = 0;
  for (const [, value] of form.entries()) {
    total += typeof value === "string" ? value.length : value.size;
  }
  for (const progress of [0.25, 0.6, 0.85, 1]) {
    await new Promise((resolve) => setTimeout(resolve, STEP_MS));
    const loaded = Math.round(total * progress);
    config.onUploadProgress({
      loaded,
      total,
      progress,
      bytes: loaded,
      lengthComputable: true,
      upload: true,
    });
  }
}

export const mockAdapter: AxiosAdapter = async (config) => {
  const origin = globalThis.location?.origin ?? "http://localhost";
  const url = new URL(axios.getUri(config), origin);
  const method = (config.method ?? "get").toUpperCase();

  const headers = new Headers();
  for (const [key, value] of Object.entries(AxiosHeaders.from(config.headers).toJSON())) {
    if (value != null) headers.set(key, String(value));
  }

  let body: string | undefined;
  if (isFormData(config.data)) {
    await reportUpload(config, config.data);
    headers.delete("content-type");
    headers.set(FORM_HEADER, stashForm(config.data));
  } else if (config.data != null && method !== "GET" && method !== "HEAD") {
    body = typeof config.data === "string" ? config.data : JSON.stringify(config.data);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
  }

  const mocked = await getResponse(handlers, new Request(url, { method, headers, body }));
  const response =
    mocked ??
    new Response(JSON.stringify({ detail: `No mock for ${method} ${url.pathname}` }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });

  const text = await response.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON: keep the text.
  }

  const result: AxiosResponse = {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers),
    config,
    request: {},
  };

  // Same contract as axios' own adapters (see axios/lib/core/settle.js).
  if (!config.validateStatus || config.validateStatus(result.status)) return result;
  throw new AxiosError(
    `Request failed with status code ${result.status}`,
    result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    result.request,
    result
  );
};
