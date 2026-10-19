import { expect, test } from "@playwright/test";
import { goToStreetWithMirci, postCard } from "./helpers";

const bell = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /^Notifications/ });

test.beforeEach(async ({ page }) => goToStreetWithMirci(page));

test("comments, and the post's owner fires back", async ({ page }) => {
  const card = postCard(page, "Monday again. I refuse.");
  await card.getByRole("button", { name: "3 comments" }).click();
  await expect(card.getByText("Too late, already cute here.")).toBeVisible();

  await card.getByLabel("Comment as Mirci").fill("Mondays fear ME.");
  await card.getByRole("button", { name: "Send comment" }).click();
  await expect(card.getByText("Mondays fear ME.")).toBeVisible();
  await expect(card.getByText(/^@Mirci /)).toBeVisible({ timeout: 10_000 });
});

test("a new post draws comments, a reaction and notifications", async ({ page }) => {
  await expect(bell(page)).toHaveAccessibleName("Notifications (3 unread)");

  await page.getByLabel("Post as Mirci").fill("Testing the live chatter!");
  await page.getByRole("button", { name: /^Post$/ }).click();
  const card = postCard(page, "Testing the live chatter!");
  await expect(card.getByRole("button", { name: "2 comments" })).toBeVisible({ timeout: 12_000 });
  await expect(card.getByRole("button", { name: "Purrfect (1)" })).toBeVisible();

  // The bell polls; a tab focus change triggers a refetch right away.
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(bell(page)).toHaveAccessibleName("Notifications (6 unread)");

  await bell(page).click();
  await page.getByRole("button", { name: /Mark all read/ }).click();
  await expect(bell(page)).toHaveAccessibleName("Notifications");
});

test("opening a notification follows its link", async ({ page }) => {
  await bell(page).click();
  await page.getByRole("button", { name: /Crookshanks started whiskering Mirci/ }).click();
  await expect(page).toHaveURL(/\/overlord\?id=5$/);
  await expect(page.getByRole("heading", { name: "Crookshanks" })).toBeVisible();
});

test("the bell is on the Street only and rings for the cat out there", async ({ page }) => {
  await expect(bell(page)).toHaveAccessibleName("Notifications (3 unread)");

  await page.getByRole("link", { name: "Go Home" }).click();
  await expect(page).toHaveURL(/\/my-slave$/);
  await expect(bell(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Next overlord" }).click();
  await page.getByRole("link", { name: "Go to the Street with Cirmi" }).click();
  await expect(page).toHaveURL(/\/street$/);
  await expect(bell(page)).toHaveAccessibleName("Notifications (1 unread)");
  await bell(page).click();
  await expect(page.getByText("For Cirmi")).toBeVisible();
  await expect(page.getByRole("button", { name: /Duchess commented/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Crookshanks started whiskering Mirci/ })
  ).toHaveCount(0);
});
