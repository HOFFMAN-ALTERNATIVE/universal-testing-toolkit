// Lighthouse CI — performance / SEO / accessibility / best-practice budgets.
// Target: LHCI_URLS (comma-separated) or BASE_URL + LHCI_PATHS, defaults to the demo app.
const base = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const urls = process.env.LHCI_URLS
  ? process.env.LHCI_URLS.split(",")
  : (process.env.LHCI_PATHS || "/,/about,/contact").split(",").map((p) => base + p);

module.exports = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: Number(process.env.LHCI_RUNS || 3),
      startServerCommand: process.env.BASE_URL ? undefined : "node demo-app/server.mjs",
      startServerReadyPattern: "listening",
      settings: {
        preset: process.env.LHCI_PRESET === "mobile" ? undefined : "desktop",
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 150000 }],
        "resource-summary:total:size": ["warn", { maxNumericValue: 500000 }],
      },
    },
    upload: { target: "filesystem", outputDir: "reports/lighthouse" },
  },
};
