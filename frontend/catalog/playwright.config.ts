import { defineConfig, devices } from "@playwright/test";

// End-to-end tests against a production build in mock mode, so no backend
// is needed. `npm run test:e2e`; the build + preview server starts itself.
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

// The first-visit tutorials would cover every page; e2e/tutorial.spec.ts
// starts without this to test them.
export const TUTORIALS_SEEN = {
  cookies: [],
  origins: [
    {
      origin: BASE_URL,
      localStorage: ["welcome", "mySlave", "street"].map((id) => ({
        name: `catalog:tutorial:${id}`,
        value: "seen",
      })),
    },
  ],
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    storageState: TUTORIALS_SEEN,
    trace: "retain-on-failure",
    // Lets a preinstalled Chromium be used instead of `playwright install`.
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : undefined,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npx vike build && npx vike preview",
    url: BASE_URL,
    env: { VITE_API_MOCKS: "true" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
