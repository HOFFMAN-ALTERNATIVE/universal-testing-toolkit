# 07 — Performance & SEO (Lighthouse CI)

`npm run test:lighthouse` runs [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) 3× per URL
(median is asserted) with the desktop preset (`LHCI_PRESET=mobile` for mobile throttling).

## Budgets (`lighthouserc.cjs`)

| Assertion | Budget | Why |
|---|---|---|
| Performance score | ≥ 0.90 | overall speed |
| Accessibility score | ≥ 0.95 | complements axe |
| Best practices | ≥ 0.90 | HTTPS, console errors, deprecated APIs |
| SEO | ≥ 0.90 | meta, crawlability, link text |
| LCP | ≤ 2.5 s | Core Web Vital "good" threshold |
| CLS | ≤ 0.1 | Core Web Vital "good" threshold |
| TBT | ≤ 200 ms | lab proxy for INP |
| JS transfer size | ≤ 150 KB | keeps bundles honest |

## Reading the report

HTML reports are written to `reports/lighthouse/` (CI artifact `lighthouse-report`). Start with **Opportunities**
(estimated savings) and **Diagnostics**; the filmstrip shows what the user sees while loading.

Lab results vary ±5 points between runs — that's why we take 3 runs and why budgets have headroom.
