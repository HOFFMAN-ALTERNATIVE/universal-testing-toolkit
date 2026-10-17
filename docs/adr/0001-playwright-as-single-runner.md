# 0001. Playwright as the runner for E2E, API and HTTP security checks

Status: accepted
Date: 2026-10-17

## Context
The toolkit covers browser flows, API contracts and HTTP-level security checks. Using a
separate tool for each (Cypress, Postman/Newman, a custom header script) means three
configs, three report formats and three ways to retry and debug.

## Options
1. Best tool per layer: Cypress for E2E, Newman for API, a shell script for headers.
2. Playwright for all three: `page` for browsers, `request` for HTTP, one config and
   one HTML report with traces.

## Decision
Option 2. One runner keeps `BASE_URL`, retries, tracing and reporting identical across
layers, and Playwright covers WebKit and mobile emulation, which Cypress does not.

## Consequences
- API and security tests reuse fixtures and run in the same CI matrix.
- Specialised tools stay where Playwright is weak: k6 for load, Lighthouse for
  performance budgets, ZAP for scanning.
- API tests are code, not a Postman collection; non-developers cannot edit them in a GUI.
