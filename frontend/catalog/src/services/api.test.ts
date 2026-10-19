import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toApiError } from "./api";

function axiosError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, undefined, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  });
}

describe("toApiError", () => {
  it("passes DRF's `detail` through", () => {
    expect(toApiError(axiosError(401, { detail: "Not logged in." }), "x")).toEqual({
      detail: "Not logged in.",
    });
  });

  it("turns the first field error into `field: message`", () => {
    const error = axiosError(400, { username: ["A user with that username already exists."] });
    expect(toApiError(error, "x").detail).toBe(
      "username: A user with that username already exists."
    );
  });

  it("falls back for network errors and anything unexpected", () => {
    expect(toApiError(new Error("boom"), "Login failed.")).toEqual({ detail: "Login failed." });
    expect(toApiError(axiosError(500, "<html>"), "Oops.")).toEqual({ detail: "Oops." });
  });
});

describe("mediaUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load(mocks: "true" | "false") {
    vi.stubEnv("VITE_API_MOCKS", mocks);
    vi.stubEnv("VITE_API_URL", "https://api.catalog.dev/api");
    vi.resetModules();
    return (await import("./api")).mediaUrl;
  }

  it("keeps absolute, data and blob URLs as they are", async () => {
    const mediaUrl = await load("false");
    for (const url of ["https://cdn.x/a.png", "data:image/png;base64,AA", "blob:https://x/1"]) {
      expect(mediaUrl(url, "/p.png")).toBe(url);
    }
  });

  it("resolves relative media against the API's origin", async () => {
    const mediaUrl = await load("false");
    expect(mediaUrl("/media/a.png", "/p.png")).toBe("https://api.catalog.dev/media/a.png");
    expect(mediaUrl(null, "/media/placeholders/p.png")).toBe(
      "https://api.catalog.dev/media/placeholders/p.png"
    );
  });

  it("serves media from the site itself in mock mode", async () => {
    const mediaUrl = await load("true");
    expect(mediaUrl(null, "/media/placeholders/p.png")).toBe("/media/placeholders/p.png");
  });
});
