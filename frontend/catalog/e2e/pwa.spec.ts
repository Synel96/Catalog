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

// Chrome's install prompt, faked: the page gets it like the real one.
async function offerInstall(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    event.prompt = async () => {
      (window as unknown as { prompted: boolean }).prompted = true;
    };
    event.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(event);
  });
}

test("the home page offers the app for download", async ({ page, isMobile }) => {
  await page.goto("/");
  const card = page.getByRole("region", { name: "Get the app" });
  await expect(card).toContainText("For the best experience");

  // No install prompt from the browser (yet): the steps for the platform.
  await card.getByRole("button", { name: "Download the app" }).click();
  const help = page.getByRole("dialog", { name: "Install Catalog" });
  await expect(help).toContainText(isMobile ? "menu at the top right of Chrome" : "browser's menu");

  // The prompt arriving while the steps are open: install from there.
  await offerInstall(page);
  await help.getByRole("button", { name: "Install now" }).click();
  await expect(page.getByText("Catalog is installed")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { prompted: boolean }).prompted)).toBe(
    true
  );
  await expect(card).toHaveCount(0);
});

test("the download button installs right away when the browser allows it", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("region", { name: "Get the app" });
  await expect(card).toBeVisible();
  await offerInstall(page);
  await card.getByRole("button", { name: "Download the app" }).click();
  await expect(page.getByText("Catalog is installed")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Install Catalog" })).toHaveCount(0);
});
