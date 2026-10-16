# 05 — Accessibility (axe-core)

`tests/e2e/a11y.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) on every `A11Y_PATHS` page in every browser project,
enforcing the tags in `A11Y_TAGS` (default **WCAG 2.0/2.1 A + AA**).

Automated scanning finds roughly 30–50% of real accessibility issues — missing labels, contrast, landmarks, ARIA misuse.
It does not replace keyboard and screen-reader testing, but it stops regressions cold.

## Reading a violation

```
[serious] color-contrast: Elements must meet minimum color contrast ratio thresholds (3 nodes)
  https://dequeuniversity.com/rules/axe/4.10/color-contrast
```

- **impact**: `minor` → `critical`
- **id/help**: the rule and what it means
- **nodes**: how many elements fail; the full JSON (with CSS selectors and fix hints) is attached to the test in the HTML report as `axe-results.json`.

## Adapting

- Exclude third-party widgets: `new AxeBuilder({ page }).exclude("#chat-widget")`
- Temporarily disable a rule while you fix it: `.disableRules(["color-contrast"])` — track it as debt.
- Stricter: add `best-practice` or `wcag22aa` to `A11Y_TAGS`.
