# 02 — Adapting the toolkit to your site

## 1. Point it at your URL

```bash
cp .env.example .env     # optional, or export variables
export BASE_URL=https://staging.example.com
npx playwright test --project=chromium --project=api --project=security
```

When `BASE_URL` is set, the demo app is **not** started.

## 2. Tell it which pages matter

```bash
export SMOKE_PATHS=/,/pricing,/blog,/login
export A11Y_PATHS=/,/pricing,/login
export VISUAL_PATHS=/,/pricing
export LHCI_PATHS=/,/pricing
```

## 3. Adjust page objects

Page objects in `tests/e2e/pages/` hide selectors from tests. Prefer accessible locators:

```ts
page.getByRole("button", { name: /sign in/i })  // ✅ resilient, doubles as an a11y check
page.getByLabel("Email")                        // ✅
page.locator(".btn-primary-2")                  // ❌ breaks on any CSS refactor
```

If your contact form uses different labels, edit `ContactPage.ts` — the tests stay unchanged.
No form? `export CONTACT_PATH=` skips form tests.

## 4. API contracts

Replace the JSON Schemas in `schemas/` with your API's shapes (or generate them from OpenAPI) and
adapt `tests/api/*.spec.ts`. `expectSchema("<$id>", body)` validates with Ajv in strict mode and prints every violation.

## 5. Authentication

For logged-in areas, add a Playwright *setup project* that signs in once and saves `storageState`:

```ts
// tests/auth.setup.ts
import { test as setup } from "@playwright/test";
setup("login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.context().storageState({ path: "reports/.auth.json" });
});
```

Then add `{ name: "setup", testMatch: /auth\.setup\.ts/ }` and `dependencies: ["setup"], use: { storageState: "reports/.auth.json" }` to the projects. Keep credentials in CI secrets — never in the repo.

## 6. Tune budgets and SLOs

- Lighthouse thresholds: `lighthouserc.cjs` → `assert.assertions`
- k6 thresholds: `k6/lib/config.js` → `thresholds`
- Visual tolerance: `playwright.config.ts` → `expect.toHaveScreenshot.maxDiffPixelRatio`

## 7. Be a good citizen

Only load-test and ZAP-scan systems **you own or have written permission to test**. Start with `SCALE=0.1` and low `VUS`.
