import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { goToStreetWithMirci, postCard } from "./helpers";

test.beforeEach(async ({ page }) => goToStreetWithMirci(page));

test("shows posts from Mirci, Cirmi and the overlords they whisker", async ({ page }) => {
  for (const name of ["Garfield", "Crookshanks", "Luna", "Mirci", "Cirmi"]) {
    await expect(page.getByRole("link", { name, exact: true }).first()).toBeVisible();
  }
  // Snowball isn't whiskered by either, so their naps stay off the Street.
  await expect(page.getByText("Nap report: excellent.")).toHaveCount(0);
});

test("posts with an image, edits and deletes the post", async ({ page }) => {
  await page.getByLabel("Post as Mirci").fill("Hello from the e2e Street!");
  await page
    .getByLabel("Attach image")
    .setInputFiles(fileURLToPath(new URL("./cat.png", import.meta.url)));
  await page.getByRole("button", { name: /^Post$/ }).click();

  const card = postCard(page, "Hello from the e2e Street!");
  await expect(card.locator("img[loading=lazy]")).toBeVisible();

  await card.getByRole("button", { name: "Edit post" }).click();
  await page.getByLabel("Post content").fill("Edited meow");
  await page.getByRole("button", { name: "Save Changes" }).click();
  const edited = postCard(page, "Edited meow");
  await expect(edited).toBeVisible();

  await edited.getByRole("button", { name: "Delete post" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Edited meow")).toHaveCount(0);
});

test("reacts and takes the reaction back", async ({ page }) => {
  const card = postCard(page, "Monday again. I refuse.");
  await card.getByRole("button", { name: "Purrfect", exact: true }).click();
  await expect(card.getByRole("button", { name: "Purrfect (1)" })).toBeVisible();
  await card.getByRole("button", { name: "Purrfect (1)" }).click();
  await expect(card.getByRole("button", { name: "Purrfect", exact: true })).toBeVisible();
});

test("searches an overlord and whiskers them", async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole("button", { name: "Open search" }).click();
  await page.getByRole("combobox").fill("snow");
  await page.getByRole("option", { name: /Snowball/ }).click();
  await expect(page).toHaveURL(/\/overlord\?id=4$/);
  await expect(page.getByRole("heading", { name: "Snowball" })).toBeVisible();

  const whiskeredBy = page.locator("dt:has-text('Whiskered by') + dd");
  await expect(whiskeredBy).toHaveText("1");
  await page.getByRole("button", { name: "Whisker" }).click();
  await expect(whiskeredBy).toHaveText("2");
  await page.getByRole("button", { name: "Unwhisker" }).click();
  await expect(whiskeredBy).toHaveText("1");
});

test("goes home and leaves street mode", async ({ page }) => {
  await page.getByRole("button", { name: /Go Home/ }).click();
  await expect(page).toHaveURL(/\/my-slave$/);
  await expect(page.getByRole("combobox")).toHaveCount(0);
});

test("fits the phone screen without sideways scrolling", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout check");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const bar = page.getByRole("group", { name: "Reactions" }).first();
  expect(await bar.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
});
