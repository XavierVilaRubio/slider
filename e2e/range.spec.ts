import { expect, test } from "@playwright/test";

test.describe("Range slider flows", () => {
  test("allows adjusting continuous range from inputs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Exercise 1" }).click();
    await page.waitForURL("**/exercise1");

    const minInput = page.getByRole("spinbutton", { name: "Minimum value" });
    const maxInput = page.getByRole("spinbutton", { name: "Maximum value" });
    const lowerThumb = page.getByRole("slider", { name: "Lower bound" });
    const upperThumb = page.getByRole("slider", { name: "Upper bound" });
    const track = page.locator(".track").first();

    await expect(minInput).toHaveValue("1");
    await expect(maxInput).toHaveValue("100");

    const trackBox = await track.boundingBox();
    const lowerBox = await lowerThumb.boundingBox();
    if (!trackBox || !lowerBox) {
      throw new Error("Failed to measure slider geometry");
    }

    const lowerCenterX = lowerBox.x + lowerBox.width / 2;
    const lowerCenterY = lowerBox.y + lowerBox.height / 2;
    const targetX = trackBox.x + trackBox.width * 0.6;

    await page.mouse.move(lowerCenterX, lowerCenterY);
    await page.mouse.down();
    await page.mouse.move(targetX, lowerCenterY, { steps: 8 });
    await page.mouse.up();

    await expect(lowerThumb).toHaveAttribute("aria-valuenow", /60(\.\d+)?/);
    await expect
      .poll(async () => Number(await minInput.inputValue()))
      .toBeGreaterThan(40);
    await expect
      .poll(async () => Number(await minInput.inputValue()))
      .toBeLessThan(80);

    await minInput.fill("15");
    await minInput.press("Enter");
    await expect(minInput).toHaveValue("15");
    await expect(lowerThumb).toHaveAttribute("aria-valuenow", "15");

    await maxInput.fill("70");
    await maxInput.press("Enter");
    await expect(maxInput).toHaveValue("70");
    await expect(upperThumb).toHaveAttribute("aria-valuenow", "70");

    await lowerThumb.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(lowerThumb).toHaveAttribute("aria-valuenow", "15.2");
  });

  test("snaps to fixed values when navigating the fixed range", async ({
    page,
  }) => {
    await page.goto("/exercise2");
    await page.waitForURL("**/exercise2");

    const lowerThumb = page.getByRole("slider", { name: "Lower bound" });
    const upperThumb = page.getByRole("slider", { name: "Upper bound" });
    const minInput = page.getByRole("spinbutton", { name: "Minimum value" });
    const maxInput = page.getByRole("spinbutton", { name: "Maximum value" });
    const track = page.locator(".track").first();

    await expect(minInput).toBeDisabled();
    await expect(maxInput).toBeDisabled();

    await expect(lowerThumb).toHaveAttribute("aria-valuenow", "1.99");
    await expect(upperThumb).toHaveAttribute("aria-valuenow", "70.99");

    await lowerThumb.focus();
    await page.keyboard.press("ArrowRight");
    await expect(lowerThumb).toHaveAttribute("aria-valuenow", "5.99");

    const trackBox = await track.boundingBox();
    const upperBox = await upperThumb.boundingBox();
    if (!trackBox || !upperBox) {
      throw new Error("Failed to measure slider geometry");
    }

    const upperCenterX = upperBox.x + upperBox.width / 2;
    const upperCenterY = upperBox.y + upperBox.height / 2;
    const targetX = trackBox.x + trackBox.width * 0.75;

    await page.mouse.move(upperCenterX, upperCenterY);
    await page.mouse.down();
    await page.mouse.move(targetX, upperCenterY, { steps: 8 });
    await page.mouse.up();

    await expect(upperThumb).toHaveAttribute("aria-valuenow", "50.99");

    await upperThumb.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(upperThumb).toHaveAttribute("aria-valuenow", "30.99");
  });
});
