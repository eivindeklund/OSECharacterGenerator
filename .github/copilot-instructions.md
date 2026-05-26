# GitHub Copilot Instructions — OSE Character Generator

A React/TypeScript wizard app for creating Old-School Essentials (B/X D&D 1981) characters, enforcing all game rules, with PDF character-sheet export.

---

## Commands

```bash
npm run dev                  # Vite dev server → http://localhost:3000
npm run build                # Production build to /dist
npm run check-types          # TypeScript type-check (no emit)
npm run test                 # Vitest unit tests (single run)
npm run test:ui              # Vitest interactive UI
npm run test:e2e             # Playwright e2e (Chromium + Firefox + WebKit)
npm run test:css             # Playwright Quixote CSS layout tests
npm run test:visual          # Visual regression: compare against baselines
npm run test:visual-update   # Visual regression: re-capture baselines
npm run test:e2e-report      # Open HTML report (shows screenshot diffs)
npm run test:all             # Vitest + Playwright combined
npm run lint:css             # Stylelint check on src/css/ (excl. third-party files)
```

**Run a single Vitest test file:**
```bash
npx vitest run src/utilities/normalizeCharacterData.test.ts
```

**Run a single Playwright test:**
```bash
npx playwright test --project=chromium -g "test name substring"
```

---

## Architecture

### Wizard Flow

`CharacterGenerator.tsx` declares routes (`HashRouter`). `LandingScreen` is rendered **outside** `<Routes>` so it stays visible as a header on every step.

| Route | Screen |
|---|---|
| `/` | `LandingScreen` |
| `/ability` | `AbilityScreen` — roll stats, pick class |
| `/class` | `ClassScreen` — class details, roll HP |
| `/equipment` | `EquipmentScreen` — roll gold, buy gear |
| `/details` | `DetailsScreen` — name, alignment, description |
| `/sheet` | `CharacterSheetScreen` — review + export PDF |
| `/tavern` | `CharacterStorageScreen` — saved characters list |

### State Management

`useCharacterManager` (in `src/hooks/useCharacterManager.ts`) is the **only** state container. No Redux, Zustand, or React Context is in use. Navigation is handled inside the hook via `useNavigate()` calls — there is no `screen` state object.

### Central Rules File

`src/data/classOptionsData.tsx` is the **only** place that knows about specific character classes. All other code operates on the `ClassOptions` interface exported from it. `ClassOptions` is not inert data — it has methods:
- `xpModifierPercentage(abilityScores)` — returns the XP bonus string.
- `checkAbilityScoreRequirements(abilityScores)` — returns `true` if the character qualifies.
- `canUseWeapon(weapon)` — weapon filter for the class.

`emptyClassOptions` is an exported sentinel (the initial `characterClass` state). Never replace it with `null`.

### Shared Types

`src/types.ts` is the single source for all TypeScript interfaces. All fields on `CharacterStatistics` are required (not optional) — the normalization layer guarantees this at runtime.

### Save-Format Migrations

All backward-compatibility shims for localStorage / URL-share data belong exclusively in `src/utilities/normalizeCharacterData.ts`. The three entry points (`StorageService.loadCharacters`, `StorageService.loadPartialCharacter`, `ShareService.decompressCharacter`) each call `normalizeStoredCharacter` before returning. Downstream code must never contain `?? fallback` guards for fields that normalization guarantees.

### Character Sharing

`ShareService` compresses character state with `lz-string` into `?data=…`. Because `HashRouter` is used, the full URL looks like `https://…/#/?data=…` — the `?data=` param comes after the hash fragment but is still accessible via `window.location.search`.

---

## Key Conventions

### Development Rules

- **Only `classOptionsData.tsx` may know about specific character classes.** Everything else operates on `ClassOptions` properties.
- **Assume ids are valid.** Do not silently ignore or "fix" invalid ids — treat them as bugs.
- **Prefer non-nullable fields with sane defaults** over `??` guards at consumption sites. `??` is a code smell here.
- **DRY.** No repeated logic.
- **Red/Green TDD** for all non-trivial changes. Exceptions: pure refactorings with existing tests, pure data changes.
- **Static data with invariants must have tests** that verify those invariants (e.g., parsable string formats are actually parsable).

### CSS & UI

- No inline `style={{}}` except for runtime-computed values.
- All colours/spacing via CSS custom properties (`var(--token-name)`) defined in `src/css/tokens.css`. No bare hex values.
- BEM-lite class naming: `block`, `block-element`, `block--modifier`.
- CSS < ~30 lines → add to the correct section of `App.css`; larger self-contained feature → dedicated `FeatureName.css`.
- No `!important` except to override a third-party sheet.
- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<fieldset>`+`<legend>` for radio groups.
- After CSS changes run `npm run lint:css` and `npm run test:css`.

### Testing

- Vitest config is inside `vite.config.js` (not a separate `vitest.config.js`). Test environment is `jsdom`; setup file is `src/test/setup.ts`.
- `react-i18next` is globally mocked in `src/test/setup.ts` — `t(key)` returns the key as-is.
- Visual regression tests (`e2e/visual.spec.js`) use a seeded `Math.random` and injected `animation-duration: 0s` to be deterministic. They run only under the `visual` Playwright project (1280×800, excluded from `test:e2e`).
- After any intentional visual change: `npm run test:visual-update`, then commit the baseline PNGs in `e2e/visual.spec.js-snapshots/`.
- CSS layout tests use Quixote (`e2e/css.spec.js`). Add a Quixote test for any new interactive element or layout-mode change.

### Files Never to Touch

| Path | Reason |
|---|---|
| `reference/` | Game SRD content — read-only reference |
| `temp/` | Designer scratch files |
| `public/assets/dice-box/` | Pre-built web-worker assets for `@3d-dice/dice-box` |
| `src/css/normalize.css` | Third-party reset |
| `src/css/skeleton.css` | Third-party layout stylesheet |

---

## Agent Skills

Task-specific checklists live in `.agent/skills/`. Read the relevant skill before starting:

| Task | Skill file |
|---|---|
| UI, CSS, or component changes | `.agent/skills/visual-changes.md` |
| Adding a character class | `.agent/skills/add-character-class.md` |
| Save-format migrations / backward compat | `.agent/skills/normalize-at-load.md` |
| PDF export changes | `.agent/skills/pdf-export.md` |
| Navigation / screen order changes | `.agent/skills/wizard-navigation.md` |
| Writing Vitest / Playwright tests | `.agent/skills/test-generation.md` |
| Code review | `.agent/skills/code-review.md` |
| Temporary files during a task | `.agent/skills/tmp-files.md` |
