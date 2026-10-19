import { expect, test } from "@playwright/test";

test("is installable: manifest with working icons", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: "Catalog", display: "standalone", start_url: "/" });
  for (const icon of manifest.icons as { src: string; purpose: string }[]) {
    const response = await request.get(icon.src);
    expect(response.status(), icon.src).toBe(200);
  }
  expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);
});

test("works offline once the service worker is in", async ({ page, context }) => {
  await page.goto("/");
  const active = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL;
  });
  expect(active).toMatch(/\/sw\.js$/);

  // The offline pages (both languages) and their code are precached.
  const precached = await page.evaluate(async () => {
    const pages = await caches.open("catalog-pages-v1");
    return Promise.all(["/offline", "/hu/offline"].map(async (p) => !!(await pages.match(p))));
  });
  expect(precached).toEqual([true, true]);

  // A page never visited, with no network: the offline page answers.
  // (Playwright's offline mode only reaches the worker for the first
  // navigation after it's switched on, so that's the one checked.)
  await context.setOffline(true);
  const response = await page.goto("/never-visited");
  expect(response?.fromServiceWorker()).toBe(true);
  expect(await response?.text()).toContain("No internet");
  await expect(page.getByRole("heading", { name: "No internet" })).toBeVisible();
  await context.setOffline(false);
});

test("the home page offers the app for download", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("region", { name: "Get the app" });
  await expect(card).toContainText("For the best experience");
  // Headless Chromium never offers its install prompt: the button explains
  // how to install instead.
  await card.getByRole("button", { name: "Download the app" }).click();
  await expect(page.getByRole("dialog", { name: "Install Catalog" })).toBeVisible();
});
