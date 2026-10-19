import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("logs in and shows the slave profile with their overlords", async ({ page }) => {
  await login(page, "mirci_fan");
  await expect(page.getByText("Login successful!")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Slave" })).toBeVisible();
  await expect(page.getByText("mirci_fan", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My Overlords" })).toBeVisible();
  await expect(page.getByText("Mirci", { exact: true })).toBeVisible();
});

test("sends visitors without a session from My Slave to login", async ({ page }) => {
  await page.goto("/my-slave");
  await expect(page).toHaveURL(/\/login$/);
});

test("logs out", async ({ page, isMobile }) => {
  await login(page);
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Logout" }).click();
  } else {
    // getByLabel: the closed mobile drawer (inert, off-screen) also has a
    // "Logout" button in the DOM.
    await page.getByLabel("Logout").click();
  }
  await expect(page).toHaveURL(/\/login$/);
});

test("Mews announces the mock test version", async ({ page }) => {
  await page.goto("/mews");
  await expect(page.getByRole("heading", { name: /Catalog testing has begun/ })).toBeVisible();
  await expect(page.getByText(/never leave your browser/)).toBeVisible();
});

test("the demo banner says the backend is mocked", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("Demo mode");
});
