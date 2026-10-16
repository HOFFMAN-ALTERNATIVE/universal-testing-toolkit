import { expect, test } from "@playwright/test";
import { toolkit } from "../../toolkit.config";

test.describe("link checker @smoke", () => {
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile, "crawl once, on desktop Chromium");

  test("no broken internal links", async ({ page, request, baseURL }) => {
    test.setTimeout(120_000);
    const origin = new URL(baseURL!).origin;
    const queue = ["/"];
    const seen = new Set<string>();
    const broken: string[] = [];
    const external = new Set<string>();

    while (queue.length && seen.size < toolkit.crawlLimit) {
      const path = queue.shift()!;
      if (seen.has(path)) continue;
      seen.add(path);
      const res = await page.goto(path);
      if (!res || res.status() >= 400) { broken.push(`${path} -> ${res?.status()}`); continue; }
      if (!(res.headers()["content-type"] ?? "").includes("text/html")) continue;
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const href of hrefs) {
        const u = new URL(href);
        if (!/^https?:$/.test(u.protocol)) continue;
        if (u.origin === origin) {
          const p = u.pathname + u.search;
          if (!seen.has(p)) queue.push(p);
        } else external.add(u.href);
      }
    }

    if (toolkit.checkExternalLinks) {
      for (const href of external) {
        const r = await request.head(href, { timeout: 10_000, failOnStatusCode: false }).catch(() => null);
        if (!r || r.status() >= 400) broken.push(`${href} -> ${r?.status() ?? "error"}`);
      }
    }

    test.info().annotations.push({ type: "crawled", description: String(seen.size) });
    expect(broken, `broken links:\n${broken.join("\n")}`).toEqual([]);
  });
});
