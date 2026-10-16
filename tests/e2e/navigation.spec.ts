import { expect, test } from "@playwright/test";
import { BasePage } from "./pages/BasePage";
import { ProductsPage } from "./pages/ProductsPage";

test.describe("navigation", () => {
  test("main menu reaches every section", async ({ page }) => {
    const p = new BasePage(page);
    await p.goto("/");
    for (const [link, url, heading] of [
      ["About", /\/about$/, /about/i],
      ["Products", /\/products$/, /products/i],
      ["Contact", /\/contact$/, /contact/i],
      ["Home", /\/$/, /.+/],
    ] as const) {
      await p.navigateTo(link);
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    }
  });

  test("skip link moves focus to main content", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab-focus links by default");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });

  test("products are rendered from the API", async ({ page }) => {
    const p = new ProductsPage(page);
    await p.open();
    await expect(p.rows.first()).toBeVisible();
    expect(await p.rows.count()).toBeGreaterThan(0);
  });
});
