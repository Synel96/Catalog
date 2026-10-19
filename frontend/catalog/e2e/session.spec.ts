import { expect, test } from "@playwright/test";

test.describe("a new tab after an old session", () => {
  test("doesn't keep a street overlord the fresh mock database doesn't have", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // What an earlier tab leaves in localStorage: logged in, out on the
    // Street with an overlord (id 100) that a fresh mock database lacks.
    await page.goto("/login");
    await page.evaluate(() => {
      const user = { id: 1, username: "old", overlords: [{ id: 100, name: "Pamacs" }] };
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 })
      );
      localStorage.setItem(
        "street-storage",
        JSON.stringify({ state: { selectedOverlord: { id: 100, name: "Pamacs" } }, version: 0 })
      );
    });

    await page.goto("/my-slave"); // session gone → back to login
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Pamacs")).toHaveCount(0);

    await page.getByLabel("Username").fill("t");
    await page.getByLabel("Password").fill("x");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/my-slave$/);
    await expect(page.getByText(/On the Street with/)).toHaveCount(0);

    await page.getByRole("button", { name: "Go to the Street with Mirci" }).click();
    await expect(page).toHaveURL(/\/street$/);
    await expect(page.getByLabel("Post as Mirci")).toBeVisible();
    await context.close();
  });
});
