import { expect, test } from "@playwright/test";
import { login, postCard } from "./helpers";

test("gives an overlord a title that shows under its name", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Edit Mirci" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Overlord" });
  // Seeded: Mirci is the Lord of the Sofa.
  await expect(dialog.getByLabel("Title")).toHaveValue("sofa_lord");
  await dialog.getByLabel("Title").selectOption({ label: "Gravity Tester" });
  await dialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Gravity Tester")).toBeVisible();

  await page.getByRole("link", { name: "Go to the Street with Mirci" }).click();
  await expect(page).toHaveURL(/\/street$/);
  // Other overlords' titles too: Garfield is a Tuna Connoisseur.
  await expect(postCard(page, "Monday again. I refuse.")).toContainText("Tuna Connoisseur");
  await expect(postCard(page, "Caught a sunbeam today.")).toContainText("Gravity Tester");
});

test("titles are translated", async ({ page }) => {
  await login(page);
  await page.goto("/hu/my-slave");
  await expect(page.getByText("A kanapé ura")).toBeVisible();
});
