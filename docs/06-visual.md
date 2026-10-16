# 06 — Visual regression

`tests/visual/visual.spec.ts` takes full-page screenshots of `VISUAL_PATHS` and compares them pixel-by-pixel
with committed baselines in `tests/visual/__screenshots__/visual/`.

## Determinism matters

Screenshots differ across OS, fonts and GPU. This repo therefore records **and** compares baselines inside the
same container image (`mcr.microsoft.com/playwright:v1.64.1-noble`):

- CI job `visual` compares
- workflow **update-visual-baselines** (Actions → Run workflow) re-records and commits them

Other stabilisers already configured: animations disabled, `document.fonts.ready` awaited, network idle,
`maxDiffPixelRatio: 0.01`.

## Reading a failure

The HTML report shows **expected / actual / diff** side by side with a slider. If the change is intended,
re-run the update workflow; otherwise it's a bug.

## Tips

- Mask dynamic regions: `toHaveScreenshot({ mask: [page.locator(".clock")] })`
- Snapshot components, not just pages: `await expect(page.locator("header")).toHaveScreenshot()`
