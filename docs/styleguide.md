# TypeScript & React Style Guide

OSE Character Generator — last updated 2026-02-28

This guide covers TypeScript, React, and general coding conventions for this codebase.  
CSS and HTML conventions are in [docs/html-css-style.md](html-css-style.md).

---

## Table of Contents

1. [Variable & Identifier Naming](#1-variable--identifier-naming)
2. [File & Folder Naming](#2-file--folder-naming)
3. [TypeScript Conventions](#3-typescript-conventions)
4. [React Component Conventions](#4-react-component-conventions)
5. [Module Structure & Exports](#5-module-structure--exports)
6. [State Management](#6-state-management)
7. [Services and Utilities](#7-services-and-utilities)
8. [Imports](#8-imports)
9. [Comments and Documentation](#9-comments-and-documentation)
10. [Test Requirements](#10-test-requirements)
11. [Known Inconsistencies to Migrate](#11-known-inconsistencies-to-migrate)

---

## 1. Variable & Identifier Naming

### `camelCase`

Use `camelCase` for:
- Local variables and function parameters
- Module-level non-constant values
- React state variables, setter functions, and callbacks
- Exported helper functions (e.g. `deriveCharacterModifiers`, `getRndInteger`)
- Non-component React functions internal to a module (e.g. `xpWrapperClass`, `scoreParenthetical`)

```ts
const abilityScores = { strength: 14, ... };
const [characterClass, setCharacterClass] = useState(emptyClassOptions);
function deriveCharacterModifiers(scores: AbilityScores) { ... }
```

### `PascalCase`

Use `PascalCase` for:
- React components (functions and classes)
- TypeScript `interface` and `type` declarations
- Service objects (e.g. `StorageService`, `ShareService`)
- Class declarations (e.g. `CharacterRef`)
- Enums (if introduced)

```ts
interface AbilityScreenProps { ... }
type Gender = "male" | "female" | "neutral";
export const StorageService = { ... };
export default function AbilityScreen(props: AbilityScreenProps) { ... }
```

### `SCREAMING_SNAKE_CASE`

Use `SCREAMING_SNAKE_CASE` for:
- Module-level string, number, or URL constants that are truly fixed configuration values (keys, URLs, storage keys)

```ts
export const CHARACTER_STORAGE = "characterStorage";
export const CHARACTER_SHEET_PURIST_URL = "https://...";
```

### Class-name string constants

String constants that hold a game class name (e.g. `Cleric`, `Fighter`) use `PascalCase` because they mirror the in-game proper noun:

```ts
export const Cleric = "Cleric";
export const Fighter = "Fighter";
```

Any new game-entity string constant should follow this same PascalCase convention.

### What to avoid

- Do **not** use `camelCase` for configuration constants (`redFail = "#b10909"` is a known issue — new colour constants belong in `tokens.css`, not JS).
- Do **not** use abbreviations unless they are universally understood (`hp`, `ac`, `xp` are acceptable domain abbreviations; prefer full words elsewhere).

---

## 2. File & Folder Naming

| File type | Convention | Example |
|---|---|---|
| React component | `PascalCase.tsx` | `ScreenNavigation.tsx` |
| React page/screen | `PascalCase.tsx` | `AbilityScreen.tsx` |
| Custom hook | `useCamelCase.ts` | `useCharacterManager.ts` |
| Service object | `PascalCaseService.ts` | `StorageService.ts` |
| Utility module | `PascalCaseUtils.ts` | `PackUtils.ts`, `GenderUtils.ts` |
| Formatter module | `PascalCaseFormatter.ts` | `XpBonusFormatter.ts` |
| Data file | `camelCaseData.tsx` | `classOptionsData.tsx`, `armourData.tsx` |
| Test file (unit) | `OriginalFile.test.ts(x)` | `PackUtils.test.ts` |
| Test file (e2e) | `kebab-case.spec.js` | `happy-path.spec.js` |
| CSS file | `PascalCase.css` for feature files; existing globals keep their names | `PackOptions.css` |

### Folder naming

Folders use `kebab-case`:

```
src/
  components/general/
  containers/class-details/
  css/
```

> **Known issue:** `src/containers/abilties/` is a typo for `abilities`.  
> Do not create new typo names; the existing folder will be corrected in a future rename.

---

## 3. TypeScript Conventions

### Prefer `interface` for object shapes, `type` for unions/aliases

```ts
// Props, API shapes, data models → interface
interface ClassOptionsData {
  name: string;
  hd: number;
  ...
}

// Unions, mapped types, simple aliases → type
type Gender = "male" | "female" | "neutral";
type XpBonusClauseDisplay = { text: string; active: boolean };
```

Both `interface` and `type` exist in the codebase.  The split above is the preferred direction; new code should follow it.

### Props interfaces

Every component must have a named `XxxProps` interface in the same file, even for small components:

```ts
interface ButtonProps {
  name?: string;
  callback?: (...args: any[]) => void;
  text?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}
```

### Type annotations on exported functions

All exported functions and their parameters should be explicitly typed.  
Private/internal helpers may rely on inference when the types are obvious, but prefer explicit return types on anything complex:

```ts
// Good — explicit parameter and return types on exported function
export function formatXpBonusRuleClauses(
  xpBonusRule: string | null | undefined,
  abilityScores: AbilityScores | null,
): XpBonusClauseDisplay[] { ... }

// Acceptable — inference for a trivial private helper
function scoreParenthetical(ability: string, abilityScores: AbilityScores | null): string { ... }
```

### Use `import type`

When importing only types (no runtime value), use `import type`:

```ts
import type { AbilityScores, CharacterModifiers } from '../types';
```

### Avoid `any`

Prefer `unknown` or a specific type.  When `any` is truly unavoidable (e.g. a third-party callback signature), annotate with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` and a brief explanation.

### Index signatures

Use index signatures (`[key: string]: ...`) only when the shape is genuinely open-ended (e.g. `AbilityScores` for dynamic lookup).  Avoid them as a shortcut to silence the compiler.

---

## 4. React Component Conventions

### Function declarations, not arrow functions, for top-level components

```ts
// Preferred
export default function AbilityScreen(props: AbilityScreenProps) { ... }

// Avoid at top level
const AbilityScreen = (props: AbilityScreenProps) => { ... };
```

Arrow functions are fine for internal helpers, event handlers, and callbacks inside a component.

### Destructure props at the top

```ts
export default function ClassDescription(props: ClassDescriptionProps) {
  const { characterClass, abilityScores } = props;
  ...
}
```

### Keep screens thin

Screens (`pages/`) are layout containers.  They should:
- Declare a props interface
- Compose containers and generic components
- Handle navigation (`useNavigate`)
- Contain minimal logic

Business logic belongs in `useCharacterManager` or a utility module.

### Component layers

| Layer | Where | Purpose |
|---|---|---|
| Pages / screens | `src/pages/` | Full-screen wizard steps; route endpoints |
| Containers | `src/containers/` | Feature sub-sections; may have local state |
| Components | `src/components/` | Reusable, generic UI primitives (Button, Modal, …) |

Do not put game-rule logic (class requirements, XP calculations) inside a component or container.  It belongs in `src/data/` or `src/utilities/`.

### Hooks

Custom hooks live in `src/hooks/` and follow the `use` prefix:

```ts
export const useCharacterManager = (...) => { ... };
```

`useCharacterManager` is the single state container for the entire wizard.  Don't introduce a second global-state hook; extend this one.

---

## 5. Module Structure & Exports

### Default vs. named exports

| Module type | Export style |
|---|---|
| React component | `export default function XxxComponent` |
| Hook | `export const useXxx` |
| Service object | `export const XxxService` (named) |
| Utility functions | Named `export function` or `export const` |
| Data arrays/objects | `export default` (the dataset) + named exports for sentinels (e.g. `emptyClassOptions`) |
| Types | Named `export interface` / `export type` |

### One component per file

Each `.tsx` file exports one primary component as its default.  Small co-located helper components (e.g. `XpClauseSpan` inside `ClassDescription.tsx`) are acceptable when they are only ever used by that one file.

### Section dividers in longer files

For files longer than ~100 lines, use horizontal dividers to separate logical sections:

```ts
// ── Section Name ──────────────────────────────────────────────────────────────
```

---

## 6. State Management

All wizard state lives in `useCharacterManager`.  There is no Redux, Zustand, or React Context in active use.

Rules:
- **Add new wizard state to `useCharacterManager`**, not to page or container local state.
- Local UI state (e.g. modal open/close, toggle visibility) may stay in individual components.
- Pass state down as props — do not tunnel data through many layers by adding it to the hook without documenting it in `types.ts`.
- Navigation is performed by calling `navigate('/route')` directly in the hook or in a page component.  There is no `screen` state variable.

---

## 7. Services and Utilities

### Services

A service is a plain-object singleton that encapsulates a single external concern (localStorage, URL compression, device detection):

```ts
export const StorageService = {
  loadCharacters: () => { ... },
  saveCharacters: (characters) => { ... },
};
```

- No class syntax needed unless the service genuinely requires instance state.
- Services accept their dependencies as parameters (injected by `useCharacterManager`) so they can be mocked in tests.

### Utility functions

Pure functions that transform data live in `src/utilities/`.  Name the file after the domain (`PackUtils.ts`, `GenderUtils.ts`) not after what it does (`helpers.ts`).

- Export each function by name.
- Write a JSDoc comment for anything non-obvious.
- Keep functions pure where possible (no side-effects, no global reads).

### Game-rule data

`src/data/classOptionsData.tsx` is **not** inert JSON — it is converted to `class ClassOptions` providing several methods, notably (`xpModifierPercentage`, `checkAbilityScoreRequirements`, `canUseWeapon`).  Treat it as a module, not a config file.

All game-rule data belongs in `src/data/`.  Do not hardcode rule values (damage dice, level thresholds, saving throws) in components.

---

## 8. Imports

### Order

Group imports in this order, separated by a blank line:

1. React and third-party packages
2. Internal utilities, services, hooks
3. Internal data
4. Internal types (`import type`)
5. CSS (in `App.tsx` / entry points only)

```ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { StorageService } from "../utilities/StorageService";
import { deriveCharacterModifiers } from "../utilities/utilities";

import classOptionsData, { emptyClassOptions } from "../data/classOptionsData";

import type { AbilityScores, ClassOptionsData } from "../types";
```

### Paths

Use relative paths (`../utilities/StorageService`).  No path aliases are configured in this project.

---

## 9. Comments and Documentation

### JSDoc on exported symbols

Every exported function, class, and non-trivial constant should have a JSDoc block explaining what it does, its parameters, and its return value when these aren't self-evident:

```ts
/**
 * Converts a canonical HP seed to a die roll result for the given hit die.
 *
 * @param seed - integer in [1, 120] produced by generateHpSeed()
 * @param hd   - hit die size (4 | 6 | 8 | 10 | 12 | 20)
 */
export const hpSeedToRoll = (seed: number, hd: number): number => ...
```

### Inline comments

Use inline comments to explain *why*, not *what*.  The code shows what; comments explain intent, trade-offs, and non-obvious constraints:

```ts
// 120 is divisible by every valid hit-die size (d4 d6 d8 d10 d12 d20)
export const generateHpSeed = (): number => getRndInteger(1, 120);
```

### TODO comments

Use `// TODO:` for deferred work.  If the item is substantial, also add it to `TODO.md`.

---

## 10. Test Requirements

### What must be tested

| Code type | Required tests |
|---|---|
| Pure utility function | Unit tests covering normal cases, edge cases, and failure modes |
| Service | Unit tests for each public method, with localStorage/external APIs mocked |
| Custom hook | Hook tests via `renderHook` from `@testing-library/react` |
| React screen (`pages/`) | Smoke test: renders without crash, key elements visible |
| React container | Smoke test +  at least one interaction test per non-trivial interaction |
| React generic component | Full unit test: all prop variations, event handlers, disabled states |
| Data module | Tests for any embedded functions (e.g. `xpModifierPercentage`, `checkAbilityScoreRequirements`) |

### Test file location and naming

- Unit tests live **next to the file they test**, named `OriginalFile.test.ts(x)`.
- Component tests use `.test.tsx`; pure TS modules use `.test.ts`.
- E2e tests live in `e2e/` with `kebab-case.spec.js` names.
- Visual regression tests live in `e2e/visual.spec.js` and run under the `visual` Playwright project only.

### Test framework conventions

Unit tests use **Vitest** + **@testing-library/react**:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
```

- Use `describe` to group related tests; use `it` or `test` for individual cases.
- Prefer `it('should ...')` with descriptive names.
- Use `beforeEach(() => vi.clearAllMocks())` in any `describe` block that creates mocks.
- Use `vi.fn()` for all mocks; never patch `Math.random` manually — use `vi.spyOn` or provide a seeded service.

E2e tests use **Playwright** with `test` + `expect` from `@playwright/test`:

```js
import { expect, test } from '@playwright/test';
test('description', async ({ page }) => { ... });
```

### Mocking guidelines

- **Services** (`StorageService`, `DeviceService`) are injected into `useCharacterManager` as parameters — pass mock objects in tests rather than `vi.mock`-ing the module.
- **react-router-dom** is mocked globally via `vi.mock` in hook tests that call `useNavigate`.
- **Sub-components** in screen smoke tests are mocked with simple stubs to keep the test focused on the screen itself.
- **`react-i18next`** is stubbed in `src/test/setup.ts` so individual test files do not need to repeat the mock.  Tests that require real translations wrap in `<I18nextProvider i18n={i18n}>`.

### Router and i18n wrapping

- Wrap any component that calls `useNavigate` or renders a `<Link>` in `<MemoryRouter>`.
- Wrap any component that calls `useTranslation` (and is not already covered by the global mock) in `<I18nextProvider i18n={i18n}>`.

### Coverage expectations

There is no enforced coverage threshold, but:
- All new utility functions must have accompanying unit tests.
- Any bug fix should include a regression test that would have caught it.

---

## 11. Known Inconsistencies to Migrate

These patterns exist in the codebase today but should be corrected in new code and cleaned up incrementally:

| Issue | Current state | Target state |
|---|---|---|
| Colour constants in `constants.tsx` | `redFail`, `greenSuccess` as JS variables | Move to `tokens.css` as CSS custom properties |
| Indentation in `PackUtils.ts` | Tabs | 2-space indentation (consistent with all other files) |
| `containers/abilties/` folder | Typo | Rename to `containers/abilities/` |
| `// eslint-disable-next-line` scattered inline | Various | Fix the underlying type; keep only genuinely unavoidable suppressions |
| `console.log("Loaded")` in `AbilityScreen.tsx` | Debug log | Remove |
| `App.tsx` uses a class component | `class App extends React.Component` | Convert to function component |
| `.wrapper {}` re-declares CSS tokens | Scoped token overrides | Remove; tokens should only be declared on `html` (see `html-css-style.md §3`) |
| Some prop interfaces use `type`, others `interface` | Mixed | Prefer `interface` for all props shapes |
