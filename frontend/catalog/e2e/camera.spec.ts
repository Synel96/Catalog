import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { goToStreetWithMirci, postCard } from "./helpers";

// Chromium's fake camera (a test pattern) with the permission granted.
test.use({
  permissions: ["camera"],
  launchOptions: {
    executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  },
});

test.beforeEach(async ({ page }) => goToStreetWithMirci(page));

test("posts a photo taken with the camera", async ({ page, isMobile }) => {
  await page.getByLabel("Post as Mirci").fill("Fresh from the camera");

  if (isMobile) {
    // Phones hand over to their own camera app through a capture input.
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Take a photo" }).click();
    await (await chooser).setFiles(fileURLToPath(new URL("./cat.png", import.meta.url)));
  } else {
    await page.getByRole("button", { name: "Take a photo" }).click();
    const dialog = page.getByRole("dialog", { name: "Take a photo" });
    await expect(dialog.getByLabel("Camera preview")).toBeVisible();
    const shutter = dialog.getByRole("button", { name: "Take the photo" });
    await expect(shutter).toBeEnabled();
    await shutter.click();
    await expect(dialog.getByRole("img", { name: "The photo you took" })).toBeVisible();
    await dialog.getByRole("button", { name: "Use this photo" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText(/^photo-\d+\.jpg$/)).toBeVisible();
  }

  await page.getByRole("button", { name: /^Post$/ }).click();
  const card = postCard(page, "Fresh from the camera");
  await expect(card.locator("img[loading=lazy]")).toBeVisible();
});
