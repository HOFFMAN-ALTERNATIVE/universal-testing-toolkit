import { defineConfig, devices } from "@playwright/test";

/**
 * Universal config: point BASE_URL at any site. When BASE_URL is not set,
 * the bundled demo app is started automatically.
 */
const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const useDemo = !process.env.BASE_URL;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "tests",
  outputDir: "reports/test-results",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/playwright", open: "never" }],
    ["junit", { outputFile: "reports/junit.xml" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  projects: [
    { name: "chromium", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testDir: "tests/e2e", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testDir: "tests/e2e", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", testDir: "tests/e2e", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", testDir: "tests/e2e", use: { ...devices["iPhone 14"] } },
    { name: "api", testDir: "tests/api" },
    { name: "security", testDir: "tests/security" },
    { name: "visual", testDir: "tests/visual", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: useDemo
    ? { command: "node demo-app/server.mjs", url: `${BASE_URL}/api/health`, reuseExistingServer: !CI, timeout: 30_000 }
    : undefined,
});
