# 0003. Keep Lighthouse CI despite unpatched transitive advisories

Status: accepted
Date: 2026-10-17

## Context
`npm audit` reported 17 advisories (11 high), all transitive through `@lhci/cli`
0.15.1, the latest release. Lighthouse budgets are a core feature of the toolkit.

## Options
1. Drop Lighthouse CI and call `lighthouse` directly: still pulls in puppeteer-core and
   the same `extract-zip` chain.
2. Replace with a hosted service (PageSpeed Insights API): needs a key and a public URL,
   so it cannot test staging or the demo app.
3. Keep `@lhci/cli`, override the transitive packages that have compatible fixes, and
   accept the rest with a written rationale.

## Decision
Option 3. npm `overrides` pin `tmp` 0.2.7, `basic-ftp` 6.2.3 and `uuid` 11.1.1, which
removes 8 advisories; a local `lhci autorun` against the demo app still passes. The
remaining 9 come from `extract-zip` (no fixed release) and `sprintf-js` (no fixed
release).

## Consequences
- `extract-zip` is only reached when puppeteer downloads a browser. The toolkit sets
  `CHROME_PATH` to Playwright's Chromium, so that code path does not run.
- `sprintf-js` is reached through `argparse` CLI parsing of our own fixed arguments.
- CI gates on `npm audit --audit-level=critical`, so any new critical fails the build.
- Revisit when `@lhci/cli` ships a release on current puppeteer.
