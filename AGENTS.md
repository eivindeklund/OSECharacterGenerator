# AGENTS.md — OSE Character Generator

A React/TypeScript single-page application that guides users through step-by-step creation of Old School Essentials (B/X D&D 1981) characters, enforcing all game rules, and exporting a filled-in PDF character sheet.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| UI framework | React | ^18.0.0 |
| Language | TypeScript | ^5.9.3 |
| Build tool | Vite | ^2.9.18 |
| Routing | react-router-dom (HashRouter) | ^7 |
| Unit tests | Vitest | ^4.0.18 |
| E2E tests | Playwright | ^1.58.2 |
| 3-D dice | @3d-dice/dice-box | ^1.0.5 |
| PDF export | pdf-lib | ^1.17.1 |
| URL sharing | lz-string | ^1.5.0 |
| i18n | i18next + react-i18next | ^21 / ^11 |
| Character persistence | browser localStorage | — |

---

## Development Commands

```bash
npm run dev            # Vite dev server → http://localhost:3000
npm run build          # Production build to /dist
npm run check-types    # TypeScript type-check (no emit)
npm run test           # Vitest unit tests (single run)
npm run test:ui        # Vitest interactive UI
npm run test:e2e       # Playwright e2e (Chrome + Firefox + WebKit)
npm run test:e2e-ui    # Playwright interactive UI
npm run test:visual          # Visual regression: compare against baselines
npm run test:visual-update   # Visual regression: re-capture baselines
npm run test:e2e-report      # Open HTML report (shows screenshot diffs)
npm run test:all       # Vitest + Playwright combined
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

---

## Architecture

### Wizard flow

Navigation uses **React Router** (`HashRouter`) with one route per wizard step:

| Route | Screen |
|---|---|
| `/` | `LandingScreen` (initial landing, always visible as header) |
| `/ability` | `AbilityScreen` — roll stats, pick class |
| `/class` | `ClassScreen` — class details, roll HP |
| `/equipment` | `EquipmentScreen` — roll gold, buy gear |
| `/details` | `DetailsScreen` — name, alignment, description |
| `/sheet` | `CharacterSheetScreen` — review + export PDF |
| `/tavern` | `CharacterStorageScreen` — saved characters list |

`CharacterGenerator.tsx` declares these routes with `<Routes>` + `<Route>`. Each screen calls `useNavigate()` internally to advance or retreat. `useCharacterManager` calls `navigate()` when character state transitions require a route change (e.g., after `rollCharacter()` navigates to `/ability`; after `importCharacter()` or `loadCharacter()` navigates to `/sheet`).

`LandingScreen` is rendered **outside** the `<Routes>` block so it remains visible (as a header) on all wizard steps.

### State management

`useCharacterManager` (a custom hook) is the **only** state container. There is no Redux, Zustand, or React Context in use — the `src/contexts/` and `src/API/` directories exist but are **empty**. All wizard state is co-located in this one hook and passed as props.

Navigation is **not** part of hook state. `useCharacterManager` calls `useNavigate()` from react-router-dom and issues `navigate('/route')` calls directly. There is no `screen` object or `setScreen` function.

### Game-rule data

`src/data/classOptionsData.tsx` (~1400 lines) is the central rules file. Each class entry is a plain object that includes **embedded functions** — notably:

- `xpModifierPercentage(abilityScores)` — returns the XP bonus string for the class.
- `checkAbilityScoreRequirements(abilityScores)` — returns `true` if the player qualifies.
- `isStandardWeapon(weapon)` — weapon filter for the class.

Do not treat `classOptionsData` as inert JSON; it contains logic.

---

## Domain Concepts (OSE / B/X D&D)

Understanding these is required to make sensible changes to game-rule code.

| Concept | Explanation |
|---|---|
| **Ability scores** | STR, INT, WIS, DEX, CON, CHA — each 3–18, rolled 3d6. Scores drive modifiers looked up in `src/data/abilityScoreMods.tsx`. |
| **Prime Requisites** | One or two ability scores specific to each class. Thresholds (13 / 16) unlock +5% or +10% XP bonuses. The exact rule is stored as a declarative `xpBonusRule` string on each class and evaluated by `ClassOptions.parseXpBonusRule` / `evaluateXpClauses`. |
| **Hit Die (HD)** | The die type rolled for HP (e.g., d6 for Fighter). HP = roll + CON modifier, minimum 1. Re-rolling is allowed (tracked via `hpRolls`). |
| **Saving throws** | Five categories (Death/Poison, Wands, Paralysis/Petrify, Breath, Spells). Values come from the `savingThrows` array on each class object (indexed 0–4). |
| **Armour Class (AC)** | Traditional descending AC (lower = better). Unarmoured AC is tracked separately (`unarmouredAC`) for some class abilities. A "DAC" (Descending AC) character sheet variant exists. |
| **Gold Pieces (GP)** | Starting wealth rolled (`3d6 × 10` GP for most classes). Equipment purchases are constrained by this pool. |
| **Equipment packs** | Pre-configured gear bundles in `src/data/equipmentData.tsx`. Resolved by `PackUtils.ts`; some items are conditional on class (e.g., holy symbol for Cleric). |
| **XP modifier** | Stored as a string percentage (e.g., `"+10%"`). Derived by calling `characterClass.xpModifierPercentage(abilityScores)` whenever ability scores or class changes. |
| **Character classes** | Core OSE B/X classes + Advanced Fantasy classes + Carcass Crawler classes. All defined in `classOptionsData.tsx`. |
| **Spells** | Some classes have arcane, divine, druid, illusionist, necromancer, or runesmith spells (boolean flags on class). Spell data is in `src/data/spells.tsx`. |

---

## Files Never to Touch

| Path | Reason |
|---|---|
| `reference/` | Game SRD content. Read-only reference material. |
| `temp/` | Designer scratch files (.sla). Not part of the codebase. |
| `public/assets/dice-box/` | Pre-built web-worker assets for @3d-dice/dice-box. Replacing these will break 3-D dice. |
| `src/css/normalize.css` | Third-party reset stylesheet. |
| `src/css/skeleton.css` | Third-party layout stylesheet. |

---

## Gotchas

1. **Vitest config lives inside `vite.config.js`**, not a separate `vitest.config.js`. Test environment is `jsdom`; setup file is `src/test/setup.ts`.

2. **`jsconfig.json` exists alongside `tsconfig.json`** — artifact of an in-progress TypeScript migration. Do not delete `jsconfig.json` without checking editor tooling still works.

3. **TypeScript migration is incomplete.** Several files lack explicit types; `useCharacterManager.ts` has untyped props in several functions. See TODO.md for tracking.

4. **DiceBox requires static assets in `public/assets/dice-box/`**. The library uses web workers and loads assets from that path at runtime. Moving or renaming these assets will silently break dice animation.

5. **Character sharing uses URL query params**, not routes. `ShareService` compresses the full character state with lz-string and appends it as `?data=…`. `CharacterGenerator.tsx` reads `window.location.search` on mount. Because `HashRouter` is used, the full URL looks like `https://…/#/?data=…` — the `?data=` param comes after the hash fragment, which browsers still expose via `window.location.search` as normal.

6. **i18n translations are inline** in `src/utilities/i18n.tsx`, not in separate JSON files. Currently English and German are supported.

7. **PDF character sheet templates are hosted remotely** on `matthewfee.github.io`. If that server is down, PDF export will not work (not a local asset).

8. **`emptyClassOptions`** is an exported sentinel object from `classOptionsData.tsx`. It is used as the initial `characterClass` state. Its functions return safe defaults. Never replace it with `null`.

9. **`hpRolls` counter** tracks how many times HP has been re-rolled; it resets only on class change. The UI uses this to decide whether to show "re-roll" affordances.