import { expect, test } from "@playwright/test";
import { toolkit } from "../../toolkit.config";

const slug = (p: string) => (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/[^\w-]+/g, "_"));

test.describe("visual regression @visual", () => {
  for (const path of toolkit.visualPaths) {
    test(`matches baseline: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${slug(path)}.png`, { fullPage: true });
    });
  }
});
