# Old School Essentials Character Generator
A character generator for the 1981 B/X Edition of Dungeons and Dragons. 
## About

This is a character generator for the 1981 Basic/Expert edition Dungeons and Dragons. It is designed for used with [Old School Essentials](https://necroticgnome.com/). The character generator guides you through creating a character from start to finish. It enforces all of the game rules so that you can create a character quickly and get back to playing. Once your character is created, you can export your character to an official character sheet with all the data values filled in for you.

## Recent changes
- Carcass crawler classes added by ptaranat

## Additional Features

- One click generation

## Available Scripts

In the project directory, you can run:

### `npm run dev` - dev server

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build` - production build

Builds the app for production to the `diff` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run test` - unit tests (vitest)

### `npm run test:ui` - unit test debugging UI

Run the debugging UI for vitest (our unit test framework).
[Documentation](https://vitest.dev/guide/ui.html)

### `npm run test:e2e` - end to end test (playwright)

We've set up playwright to test on chrome, firefox and webkit.

* [Playwright general documentation](https://playwright.dev)
* [How to debug playwright tests](https://playwright.dev/docs/running-tests#debugging-tests).  You likely want to start by running the test in UI mode through `npm run test:e2e-ui`


### `npm run test:e2e-ui` - end to end test debugging UI.

Run the debugging UI for playwright (our end to end test framework).
[Documentation](https://playwright.dev/docs/test-ui-mode)

### `npm run test:all` - run all available tests (currently unittests and e2e tests)

### `npm run check-types` - check typescript types (without compiling output)

### `npm find-duplicate-code` - run duplicate code finders

Run jscpd and jsinspect-plus to find duplicate code, ignoring appropriate files.

These find duplicate code in slightly different ways, and thus can complement
each other.

## Development Commands

```bash
npm run dev            # Vite dev server → http://localhost:3000
npm run build          # Production build to /dist
npm run check-types    # TypeScript type-check (no emit)
npm run test           # Vitest unit tests (single run)
npm run test:ui        # Vitest interactive UI
npm run test:e2e       # Playwright e2e (Chrome + Firefox + WebKit)
npm run test:css       # Playwright CSS tests
npm run test:all       # Vitest + Playwright combined
npm run test:e2e-ui    # Playwright interactive UI
npm run test:visual          # Visual regression: compare against baselines
npm run test:visual-update   # Visual regression: re-capture baselines
npm run test:e2e-report      # Open HTML report (shows screenshot diffs)
npm run find-duplicate-code  # jscpd duplicate detection (excludes test files)
```

---

## Repository Map

```
src/
  App.tsx                     # Root: initialises DiceBox, renders CharacterGenerator
  types.ts                    # ALL shared TypeScript interfaces
  main.tsx                    # React DOM entry point
  pages/                      # One file per wizard screen + its *.test.tsx
  hooks/
    useCharacterManager.ts    # SINGLE source of truth for ALL wizard state
  data/                       # Static game-rule data (classes, equipment, spells…)
  constants/constants.tsx     # Global constants, default states, armour type maps
  utilities/                  # Pure-function helpers + service objects
  css/                        # Global stylesheets (skeleton, normalize, App)
  img/                        # Static image assets
e2e/                          # Playwright end-to-end specs
reference/OSE.SRD.Wiki/       # Markdown copy of OSE SRD — game reference only, not code
temp/                         # Scribus .sla files for character sheet design — not code
public/assets/dice-box/       # Web-worker assets required by @3d-dice/dice-box
```

---

## Visual Regression Tests

Golden-image screenshot tests live in `e2e/visual.spec.js` and run exclusively under the `visual` Playwright project (Chromium, 1280×800). They are excluded from the normal `test:e2e` run so they do not add noise to functional CI.

### Workflow

```bash
# First time, or after an intentional visual change — capture new baselines:
npm run test:visual-update

# On every subsequent run — compare against baselines:
npm run test:visual

# After a failure, open the HTML report to inspect diffs:
npm run test:e2e-report
```

### Viewing diffs

When `test:visual` fails, Playwright writes files to a subdirectory of `test-results/` named after the project, a truncated/hashed form of the test title, and the project name again — e.g. `test-results/visual-Visual-regression-—-<hash>-<slug>-visual/`. Inside each folder:

| File | Contents |
|---|---|
| `<snapshot-name>-expected.png` | The stored baseline |
| `<snapshot-name>-actual.png` | What the browser rendered this run |
| `<snapshot-name>-diff.png` | Pixels that differ, highlighted in magenta |
| `error-context.md` | Playwright error message and stack trace for the failure |

`npm run test:e2e-report` opens a browser with the HTML report, which includes a side-by-side diff slider for each failing screenshot.

Example file names from real tests:

```text
test-results
test-results/.last-run.json
test-results/visual-Visual-regression-—-43d49-n-—-after-rolling-all-stats-visual
test-results/visual-Visual-regression-—-43d49-n-—-after-rolling-all-stats-visual/ability-rolled-actual.png
test-results/visual-Visual-regression-—-43d49-n-—-after-rolling-all-stats-visual/ability-rolled-diff.png
test-results/visual-Visual-regression-—-43d49-n-—-after-rolling-all-stats-visual/ability-rolled-expected.png
test-results/visual-Visual-regression-—-43d49-n-—-after-rolling-all-stats-visual/error-context.md
test-results/visual-Visual-regression-—-a70d1-y-screen-—-Fighter-selected-visual
test-results/visual-Visual-regression-—-a70d1-y-screen-—-Fighter-selected-visual/ability-fighter-selected-expected.png
test-results/visual-Visual-regression-—-a70d1-y-screen-—-Fighter-selected-visual/ability-fighter-selected-diff.png
test-results/visual-Visual-regression-—-a70d1-y-screen-—-Fighter-selected-visual/error-context.md
test-results/visual-Visual-regression-—-a70d1-y-screen-—-Fighter-selected-visual/ability-fighter-selected-actual.png
```


### Baseline files

Baselines are stored in `e2e/visual.spec.js-snapshots/` as `<name>-visual-<platform>.png`. **Commit these files to git** — they are the ground truth that all future runs compare against. When a design change is intentional, run `test:visual-update` and commit the updated images together with the code change.

### How screenshots are kept stable

- **Deterministic dice rolls** — `Math.random` is replaced at page-init time with a seeded LCG so every roll produces the same values on every run.
- **Animations disabled** — a `<style>` tag is injected that sets `animation-duration` and `transition-duration` to `0s`, preventing mid-animation frames.
- **Fixed viewport** — the `visual` project uses 1280×800 so layout never reflows between runs.
- **1 % pixel tolerance** — `maxDiffPixelRatio: 0.01` absorbs sub-pixel rendering noise without hiding real regressions.
