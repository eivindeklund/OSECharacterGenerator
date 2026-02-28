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

## 3. Token Test

After editing `tokens.css`, `App.css`, or `PackOptions.css`, run the automated token test to confirm no rules are violated:

```bash
npm run test
```

The relevant file is `src/css/tokens.test.ts`.  Fix any failures before proceeding.

---

## 4. Visual Regression Tests

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

## 5. Capturing / Updating Baselines

**After every intentional visual change** — including new tests — you must regenerate the baseline screenshots:

```bash
npm run test:visual-update
```

This writes PNG files to `e2e/visual.spec.js-snapshots/`.  **Commit these files to git** together with the code change — they are the ground truth for all future runs.

> **Do not run `test:visual-update` to silence a failing test.**  If `npm run test:visual` fails on an existing test, investigate the diff first (see §6).  Only run the update command once you have confirmed the visual change is intentional and correct.

---

## 6. Verifying Visual Changes

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

## 7. Full End-of-Change Checklist

1. `npm run check-types` — no TypeScript errors.
2. `npm run test` — unit tests (including `tokens.test.ts`) pass.
3. If a new interactive UI state was added, a new test exists in `e2e/visual.spec.js`.
4. `npm run test:visual-update` — baselines regenerated.
5. `npm run test:visual` — comparison run is green.
6. Baseline PNG(s) committed to git alongside the code change.
7. Component checklist from §2 above is fully ticked.
