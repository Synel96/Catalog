import { expect, test } from "@playwright/test";

// Fresh storage: nothing has been seen yet.
test.use({ storageState: { cookies: [], origins: [] } });

test("walks through the first-visit tutorials and remembers them", async ({ page }) => {
  await page.goto("/");
  // The navigation drawer is a dialog too; the tutorial has a step counter.
  const dialog = page.getByRole("dialog").filter({ hasText: /\d \/ \d/ });
  await expect(dialog.getByRole("heading", { name: /Welcome to the Catalog test/ })).toBeVisible();
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog).toContainText("Please don't use your real email address or password");
  await dialog.getByRole("button", { name: "Got it!" }).click();
  await expect(dialog).toHaveCount(0);

  // Seen once: a reload doesn't bring it back.
  await page.reload();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(dialog).toHaveCount(0);

  await page.getByLabel("Username").fill("tester");
  await page.getByLabel("Password").fill("whiskers");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/my-slave$/);

  await expect(dialog.getByRole("heading", { name: "You are the Slave" })).toBeVisible();
  // Closing early counts as seen too.
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  // The help button opens it again from the first step.
  await page.getByRole("button", { name: "How does it work?" }).click();
  await expect(dialog.getByRole("heading", { name: "You are the Slave" })).toBeVisible();
  await dialog.getByRole("button", { name: "Next" }).click();
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByRole("heading", { name: "Off to the Street" })).toBeVisible();
  await dialog.getByRole("button", { name: "Got it!" }).click();

  await page.getByRole("link", { name: "Go to the Street with Mirci" }).click();
  await expect(page).toHaveURL(/\/street$/);
  await expect(dialog.getByRole("heading", { name: "This is the Street" })).toBeVisible();
  for (let i = 0; i < 3; i++) await dialog.getByRole("button", { name: "Next" }).click();
  await dialog.getByRole("button", { name: "Got it!" }).click();
  await expect(page.getByText("Monday again. I refuse.")).toBeVisible();
});

test("shows the tutorials in Hungarian too", async ({ page }) => {
  await page.goto("/hu/");
  await expect(page.getByRole("heading", { name: /Üdv a Catalog tesztjén/ })).toBeVisible();
});
