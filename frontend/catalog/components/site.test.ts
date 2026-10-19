import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSite(env: Record<string, string>) {
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  vi.resetModules();
  return import("./site");
}

describe("feedSocketUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("uses the API's origin, outside the /api prefix", async () => {
    const site = await loadSite({
      VITE_API_MOCKS: "false",
      VITE_API_URL: "http://localhost:8000/api",
    });
    expect(site.feedSocketUrl()).toBe("ws://localhost:8000/ws/feed/");
  });

  it("switches to wss for an https API", async () => {
    const site = await loadSite({
      VITE_API_MOCKS: "false",
      VITE_API_URL: "https://api.catalog.dev/api",
    });
    expect(site.feedSocketUrl()).toBe("wss://api.catalog.dev/ws/feed/");
  });

  it("uses the page's own origin in mock mode", async () => {
    vi.stubGlobal("window", { location: { origin: "https://catalog.vercel.app" } });
    const site = await loadSite({ VITE_API_MOCKS: "true" });
    expect(site.API_URL).toBe("/api/");
    expect(site.feedSocketUrl()).toBe("wss://catalog.vercel.app/ws/feed/");
  });
});
