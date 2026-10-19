import { expect, test } from "@playwright/test";

const switcher = (page: import("@playwright/test").Page) =>
  page.getByRole("group", { name: /Language|Nyelv/ }).first();

test("English by default; switching to Hungarian stays on the same page", async ({
  page,
  isMobile,
}) => {
  await page.goto("/register");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Have a mice day!" })).toBeVisible();

  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await switcher(page).getByRole("button", { name: "Magyar" }).click();

  await expect(page).toHaveURL(/\/hu\/register$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await expect(page.getByRole("heading", { name: "Egérkellemes napot!" })).toBeVisible();
  await expect(page.getByLabel("Szolganév")).toBeVisible();
  await expect(page).toHaveTitle("Regisztráció");
});

test("Hungarian sticks while logging in and going to the Street", async ({ page }) => {
  await page.goto("/hu/login");
  await page.getByLabel("Felhasználónév").fill("cicamama");
  await page.getByLabel("Jelszó").fill("x");
  await page.getByRole("button", { name: "Belépés" }).click();

  await expect(page).toHaveURL(/\/hu\/my-slave$/);
  await expect(page.getByText("Sikeres belépés!")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nagyuraim" })).toBeVisible();

  await page.getByRole("link", { name: "Irány az utca: Mirci" }).click();
  await expect(page).toHaveURL(/\/hu\/street$/);
  await expect(page.getByRole("heading", { name: "Utca" })).toBeVisible();
  await expect(page.getByLabel("Posztolás mint Mirci")).toBeVisible();
  await expect(page.getByRole("button", { name: "3 komment" }).first()).toBeVisible();
  // Dates follow the language too.
  await expect(page.getByText(/\d{4}\. \p{L}+ \d{1,2}\./u).first()).toBeVisible();
});

test("a notification link keeps the language", async ({ page, isMobile }) => {
  test.skip(isMobile, "the bell is hidden on phones while on the Street");
  await page.goto("/hu/login");
  await page.getByLabel("Felhasználónév").fill("cicamama");
  await page.getByLabel("Jelszó").fill("x");
  await page.getByRole("button", { name: "Belépés" }).click();
  await page.getByRole("link", { name: "Irány az utca: Mirci" }).click();

  await page.getByRole("button", { name: /^Értesítések/ }).click();
  await page.getByRole("button", { name: /Crookshanks started whiskering Mirci/ }).click();
  await expect(page).toHaveURL(/\/hu\/overlord\?id=5$/);
  await expect(page.getByRole("button", { name: "Bajuszolom" })).toBeVisible();
});

test("Hungarian pages are prerendered in Hungarian, with hreflang alternates", async ({
  request,
}) => {
  const html = await (await request.get("/hu/mews")).text();
  expect(html).toContain('<html lang="hu"');
  expect(html).toContain("Rendkívüli nyávhír");
  expect(html).toMatch(/<title>Nyávhírek<\/title>/);
  expect(html).toMatch(/hreflang="en" href="http:\/\/localhost:5173\/mews"/i);
  expect(html).toMatch(/hreflang="hu" href="http:\/\/localhost:5173\/hu\/mews"/i);
  expect(html).toContain('<link rel="canonical" href="http://localhost:5173/hu/mews"');

  const english = await (await request.get("/mews")).text();
  expect(english).toContain('<html lang="en"');
  expect(english).toContain("Breaking Mews");
});
