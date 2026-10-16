/**
 * Site-specific knobs. Override with environment variables so the same
 * suite can be pointed at any target without code changes.
 */
const list = (v: string | undefined, d: string[]) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : d);

export const toolkit = {
  /** Pages that must load with 2xx and no console errors. */
  smokePaths: list(process.env.SMOKE_PATHS, ["/", "/about", "/products", "/contact"]),
  /** Pages scanned with axe-core. */
  a11yPaths: list(process.env.A11Y_PATHS, ["/", "/about", "/products", "/contact"]),
  /** Pages captured for visual regression. */
  visualPaths: list(process.env.VISUAL_PATHS, ["/", "/about", "/contact"]),
  /** WCAG tags enforced by axe. */
  a11yTags: list(process.env.A11Y_TAGS, ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]),
  /** Max pages the link checker will crawl. */
  crawlLimit: Number(process.env.CRAWL_LIMIT ?? 50),
  /** Also verify external links (slower, flaky on CI). */
  checkExternalLinks: process.env.CHECK_EXTERNAL_LINKS === "1",
  /** API base path (relative to BASE_URL). */
  apiBase: process.env.API_BASE ?? "/api",
  /** Contact form path; set to "" to skip form tests on targets without one. */
  contactPath: process.env.CONTACT_PATH ?? "/contact",
} as const;
