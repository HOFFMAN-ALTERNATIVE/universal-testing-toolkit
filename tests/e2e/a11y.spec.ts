import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { toolkit } from "../../toolkit.config";

test.describe("accessibility @a11y", () => {
  for (const path of toolkit.a11yPaths) {
    test(`axe: ${path}`, async ({ page }, testInfo) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags([...toolkit.a11yTags]).analyze();
      await testInfo.attach("axe-results.json", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
      const summary = results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)\n  ${v.helpUrl}`);
      expect(results.violations, summary.join("\n")).toEqual([]);
    });
  }
});
