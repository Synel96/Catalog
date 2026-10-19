import { expect, type Page } from "@playwright/test";

// Every test gets a fresh browser context, so the mock backend starts from
// its seed (sessionStorage) each time. Any username/password logs in.
export async function login(page: Page, username = "tester") {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill("whiskers");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/my-slave$/);
}

export async function goToStreetWithMirci(page: Page) {
  await login(page);
  await page.getByRole("button", { name: "Go to the Street with Mirci" }).click();
  await expect(page).toHaveURL(/\/street$/);
  await expect(page.getByText("Monday again. I refuse.")).toBeVisible();
}

export const postCard = (page: Page, text: string) =>
  page.locator("[data-slot=card]", { hasText: text });
