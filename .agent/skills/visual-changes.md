# Skill: Visual Changes

OSE Character Generator — guidance for any change that touches the UI, CSS, or component structure.

---

## 1. Before You Start

Read **[`docs/html-css-style.md`](../../docs/html-css-style.md)** in full before writing or editing any CSS or HTML/JSX.  Key rules to internalise:

- No inline `style={{}}` except for runtime-computed values (§7).
- All colours/spacing via `var(--token-name)` — no bare hex (§3).
- BEM-lite class naming: `block`, `block-element`, `block--modifier` (§4).
- New CSS < ~30 lines → correct section of `App.css`; larger self-contained feature → dedicated `FeatureName.css` (§2).
- No `!important` except to override a third-party sheet (§8).
- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<fieldset>`+`<legend>` for radio groups (§6).

---

## 2. Implementing the Change

### CSS custom properties

When adding a colour or spacing constant used in more than one place:

1. Define a new token in `src/css/tokens.css` with a `/* Usage: … */` comment immediately above it (required format — see the meta-comment at the top of that file).
2. Reference it with `var(--token-name)` in the rule.
3. If a value is genuinely one-off, annotate the line with `/* one-off: <reason> */`.

The automated test in `src/css/tokens.test.ts` enforces these rules for `App.css` and `PackOptions.css`.  If you add a new CSS file, add it to those tests too.

### Checklist (from §12 of the style guide)

- [ ] No inline `style={{}}` except for runtime-computed values
- [ ] All class names follow BEM-lite (`block`, `block-element`, `block--modifier`)
- [ ] No bare hex/rgb values — only `var(--token)` or `/* one-off: … */`
- [ ] No `!important`
- [ ] Buttons use `<button>`, navigation links use `<a>`
- [ ] Radio/checkbox groups wrapped in `<fieldset>` with `<legend>`
- [ ] New CSS placed in the correct `App.css` section (or a named feature file)
- [ ] New token declared on `html {}` in `tokens.css`, not on a descendant selector

---

## 3. Quixote CSS Tests

Quixote is a CSS unit-testing library.  CSS tests live in `e2e/css.spec.js` and helpers in `e2e/css-helpers.js`.  They run via:

```bash
npm run test:css
```

### Why Quixote tests exist

LLM agents (and humans) frequently introduce layout defects that look correct in code but are wrong in the browser: a button whose `width` is too narrow for its label, a container that collapses to zero height, text that overflows its box, or a flex child that shrinks away.  Quixote catches these by measuring what the browser *actually* renders — not just what the CSS *declares*.

> **Motivating example:** An agent added a button with descriptive text but gave it a fixed pixel width that was far too narrow.  The CSS was valid and the component test passed.  A Quixote test asserting that the button is at least as wide as its text content would have caught this immediately.

### When to add a Quixote test

Add a test to `e2e/css.spec.js` whenever you:

- **Add any new interactive element** (button, link, input, select) — assert that its rendered width and height are large enough for its content and are not zero or suspiciously small.
- **Add a new CSS class that defines layout behaviour** (`display`, `flex-*`, `grid-*`, `position`).
- **Add or modify a state modifier class** (e.g. `.active`, `--selected`) that changes a computed style.
- **Change the value of a design token** in `tokens.css` that is consumed by a component class.
- **Add a new CSS file** — also export it as a constant from `e2e/css-helpers.js`.

For new interactive elements the minimum useful assertions are:

1. `width` > 0 and `height` > 0 (element is visible).
2. The rendered `width` is ≥ the width of its text content (button is not clipped).
3. `overflow` is `visible` or `auto`, not `hidden` in a way that would clip the label.

You do **not** need a Quixote test for:

- Spacing / margin tweaks with no layout-mode change, provided a related element already has size assertions.
- Thematic colour changes to tokens that are not asserted by any existing test.
- Logic-only changes with no CSS effect.

### Two testing styles

**Isolated fixture tests** — Quixote creates a sandboxed `<iframe>` and injects the app CSS as inline text.  HTML snippets are added, and computed styles are read from the Quixote frame.  No app state and no app navigation are required; these tests run fast and reproduce identically on every machine.

**Live rendered style tests** — navigate to the running app and read computed styles on the real DOM using `getComputedStyle`.  Use these to verify that the full pipeline is intact (Vite build, tokens cascade, component rendering).

### How to write an isolated fixture test

```js
import { test, expect } from '@playwright/test';
import { injectQuixote, getIsolatedStyles, tokensCSS, appCSS } from './css-helpers.js';

test.describe('Isolated CSS rules — MyFeature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectQuixote(page);
  });

  test('my-element has expected layout', async ({ page }) => {
    const styles = await getIsolatedStyles(
      page,
      tokensCSS + '\n' + appCSS,
      '<div class="my-element"></div>',
      '.my-element',
      ['display', 'cursor'],
    );
    expect(styles['display']).toBe('flex');
    expect(styles['cursor']).toBe('pointer');
  });
});
```

For elements whose CSS rule requires a parent context (e.g. `.container > .child`), provide the full ancestor chain in the `html` snippet and use the child's selector or ID:

```js
'<div class="container"><div class="child" id="target"></div></div>'
// selector: '#target'
```

#### Asserting that a button is wide enough for its text

Use `getBoundingClientRect()` inside `page.evaluate()` to compare the button's rendered width against the width of the text it contains.  This directly catches the "button too narrow for its label" class of defect:

```js
test('my-action button is wide enough for its label', async ({ page }) => {
  await page.goto('/');
  await injectQuixote(page);

  const result = await page.evaluate(async ({ css }) => {
    const frame = await new Promise((resolve, reject) =>
      window.quixote.createFrame({ css, width: 800, height: 600 }, (err, f) =>
        err ? reject(err) : resolve(f),
      ),
    );
    frame.add('<button class="button--my-action">Save Character</button>');
    const btn = frame.document().querySelector('.button--my-action');
    const btnRect = btn.getBoundingClientRect();
    // Measure text width in a throwaway span with no constrained width
    const span = frame.document().createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'nowrap';
    span.textContent = btn.textContent;
    frame.document().body.appendChild(span);
    const textWidth = span.getBoundingClientRect().width;
    frame.remove();
    return { btnWidth: btnRect.width, textWidth };
  }, { css: tokensCSS + '\n' + appCSS });

  expect(result.btnWidth).toBeGreaterThan(0);
  expect(result.btnWidth).toBeGreaterThanOrEqual(result.textWidth);
});
```

> **Note:** `frame.document()` accesses the Quixote iframe's `contentDocument` — use it when you need raw DOM APIs that Quixote's own element wrapper doesn't expose.  When you only need computed styles, prefer `getIsolatedStyles()` from `css-helpers.js`.

### How to write a live rendered style test

```js
import { test, expect } from '@playwright/test';
import { tokenValue, computedProp } from './css-helpers.js';

test.describe('Live rendered styles', () => {
  test('--my-new-token resolves to the expected value', async ({ page }) => {
    await page.goto('/');
    const value = await tokenValue(page, '--my-new-token');
    expect(value).toBe('#hexvalue');
  });
});
```

`computedProp(page, selector, property)` reads any computed CSS property from a live element (useful when you need to check something other than a token value):

```js
const display = await computedProp(page, '.my-selector', 'display');
expect(display).toBe('grid');
```

### Adding a new CSS file

1. Add a `readFileSync` constant in `e2e/css-helpers.js` following the existing pattern.
2. Export it (`export const myNewCSS = ...`).
3. Add representative isolated tests to `e2e/css.spec.js`.

---

## 4. Stylelint CSS Checks

After editing any CSS file, run the automated stylelint check:

```bash
npm run lint:css
```

This checks `src/css/App.css`, `src/css/PackOptions.css`, and `src/css/tokens.css` against the project's `.stylelintrc.json` config. `normalize.css` and `skeleton.css` are excluded (third-party).

### Rules enforced

| Rule | Level | What it catches |
|---|---|---|
| `selector-class-pattern` | error | Class names must follow BEM-lite: `block`, `block-element`, `block--modifier` (compound modifiers like `block--mod1--mod2` are allowed) |
| `no-duplicate-selectors` | error | The same selector appearing in more than one rule block |
| `declaration-block-no-duplicate-properties` | error | The same property declared twice within a single rule |
| `property-no-deprecated` | error | Deprecated properties e.g. `grid-gap` (use `gap`) |
| `declaration-property-value-no-unknown` | error | Invalid values e.g. `display: flexbox` instead of `display: flex` |
| `declaration-no-important` | warning | `!important` usage (avoid except to override third-party sheets) |
| `no-descending-specificity` | warning | Specificity ordering that could cause confusing cascade behaviour |

### What is intentionally NOT enforced

The following standard-config rules are disabled because they conflict with the project's existing, working code style:

- `color-function-notation` — existing code uses `rgba()` / `rgb()` legacy syntax
- `alpha-value-notation` — existing code uses decimal notation (`0.95`) not percentage
- `length-zero-no-unit` — existing code uses `0rem`, `0px` etc.
- Formatting rules (`comment-empty-line-before`, `rule-empty-line-before`, etc.)

Do not re-enable these without first updating all existing CSS to conform.

### BEM-lite pattern enforced

`^[a-z][a-z0-9]*(-[a-z0-9]+)*(--[a-z0-9]+(-[a-z0-9]+)*)*$`

Examples of **valid** names: `button`, `filter-chip`, `filter-chip--active`, `button--ability--increase`, `saving-throw--death--value`

Examples of **invalid** names: `Button`, `filterChip`, `filter_chip`, `BUTTON`

---

## 5. Token Test
After editing `tokens.css`, `App.css`, or `PackOptions.css`, run the automated token test to confirm no rules are violated:

```bash
npm run test
```

The relevant file is `src/css/tokens.test.ts`.  Fix any failures before proceeding.

---

## 6. Visual Regression Tests

### When to add a new visual test

Add a screenshot assertion to `e2e/visual.spec.js` whenever you:

- Introduce a new wizard screen or a distinct new UI state on an existing screen.
- Add a modal, overlay, or collapsible panel that has a stable open/closed state.
- Change an existing component's layout in a way that affects multiple screens.
- Add filter chips, tabs, or other navigation elements that change visual state.

You do **not** need a new test for purely logic-only changes that have no visible effect.

### How to write a visual test

Use the existing helpers already declared at the top of `e2e/visual.spec.js`:

```js
// Stabilise Math.random and disable CSS animations before page.goto()
await setupDeterministicPage(page);

// Take a full-page screenshot and compare against the stored baseline
await snap(page, 'my-feature-name');
```

`snap()` calls `expect(page).toHaveScreenshot(…)` with `fullPage: true` and a 1 % pixel tolerance (`maxDiffPixelRatio: 0.01`).

Place new tests in the most appropriate `test.describe` block, or create a new one if the feature is a new screen:

```js
test.describe('Visual regression — my new screen', () => {
  test.beforeEach(async ({ page }) => {
    await setupDeterministicPage(page);
  });

  test('My feature — initial state', async ({ page }) => {
    // … navigate and interact …
    await snap(page, 'my-feature-initial');
  });
});
```

### Keeping tests deterministic

- Dice rolls are already stabilised by the seeded `Math.random` replacement in `setupDeterministicPage`.
- CSS animations are suppressed by the injected `<style>` tag.
- The `visual` Playwright project runs at a fixed 1280×800 viewport (see `playwright.config.js`).
- Avoid `page.waitForTimeout()`; use `expect(locator).toBeVisible()` waits so tests self-stabilise.

---

## 7. Capturing / Updating Baselines

**After every intentional visual change** — including new tests — you must regenerate the baseline screenshots:

```bash
npm run test:visual-update
```

This writes PNG files to `e2e/visual.spec.js-snapshots/`.  **Commit these files to git** together with the code change — they are the ground truth for all future runs.

> **Do not run `test:visual-update` to silence a failing test.**  If `npm run test:visual` fails on an existing test, investigate the diff first (see §7).  Only run the update command once you have confirmed the visual change is intentional and correct.

---

## 8. Verifying Visual Changes

After updating baselines, do a final sanity-check comparison run:

```bash
npm run test:visual
```

If the run fails, open the HTML report to inspect pixel diffs:

```bash
npm run test:e2e-report
```

Each failing test produces three files in `test-results/`:

| File | Contents |
|---|---|
| `<name>-expected.png` | The stored baseline |
| `<name>-actual.png` | What the browser rendered this run |
| `<name>-diff.png` | Differing pixels highlighted in magenta |

The HTML report includes a side-by-side slider for each diff.

If you find it hard to interpret the differences, you can ask the user to do it for you.

---

## 9. Full End-of-Change Checklist

1. `npm run check-types` — no TypeScript errors.
2. `npm run lint:css` — no stylelint errors (warnings about `no-descending-specificity` are pre-existing and acceptable; new warnings should be investigated).
3. `npm run test` — unit tests (including `tokens.test.ts`) pass.
4. If a new CSS rule affects layout or a token value changed, add or update a test in `e2e/css.spec.js` and confirm `npm run test:css` is green.
5. If a new interactive UI state was added, a new test exists in `e2e/visual.spec.js`.
6. `npm run test:visual-update` — baselines regenerated.
7. `npm run test:visual` — comparison run is green.
8. Baseline PNG(s) committed to git alongside the code change.
9. Component checklist from §2 above is fully ticked.
