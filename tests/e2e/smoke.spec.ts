import { expect, test } from "@playwright/test";
import { toolkit } from "../../toolkit.config";
import { BasePage } from "./pages/BasePage";

test.describe("smoke @smoke", () => {
  for (const path of toolkit.smokePaths) {
    test(`loads ${path}`, async ({ page }) => {
      const p = new BasePage(page);
      const res = await p.goto(path);
      expect(res.status(), `HTTP status for ${path}`).toBeLessThan(400);
      await expect(page).toHaveTitle(/\S/);
      await expect(p.main).toBeVisible();
      await page.waitForLoadState("networkidle");
      await p.expectNoConsoleErrors();
    });
  }

  test("has essential SEO meta", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20,}/);
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("unknown route returns 404 page", async ({ page }) => {
    const res = await page.goto(`/__does-not-exist-${Date.now()}`);
    expect(res?.status()).toBe(404);
  });
});
