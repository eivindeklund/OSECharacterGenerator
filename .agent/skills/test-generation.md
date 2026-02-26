---
name: test-generation
description: >
  Generate Vitest unit tests or Playwright e2e tests for the OSE Character
  Generator, following project conventions for file placement, test utilities,
  and game-rule coverage.
---

# Skill: Test Generation

## Test frameworks

| Type | Framework | Config |
|---|---|---|
| Unit | **Vitest** | `vite.config.js` → `test` block, env = `jsdom` |
| E2E | **Playwright** | `playwright.config.js`, specs in `e2e/` |

## Unit tests (Vitest)

### File placement

Co-locate the test beside the source file:
- `src/pages/FooScreen.tsx` → `src/pages/FooScreen.test.tsx`
- `src/utilities/BarUtils.ts` → `src/utilities/BarUtils.test.ts`
- `src/hooks/useHook.ts` → `src/hooks/useHook.test.ts`

### Imports

```ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

The setup file (`src/test/setup.ts`) configures `@testing-library/jest-dom` matchers globally — no need to import them.

### Testing `useCharacterManager`

The hook accepts injectable services. Use this pattern:

```ts
const mockDiceService = { show: vi.fn().mockReturnThis(), roll: vi.fn(), hide: vi.fn().mockReturnThis(), clear: vi.fn() }
const mockStorageService = { loadCharacters: vi.fn(() => []), saveCharacters: vi.fn(), saveCharacter: vi.fn(), deleteCharacter: vi.fn() }
const mockDeviceService = { getIsMobile: vi.fn(() => false) }

const { result } = renderHook(() =>
  useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
)
```

### Testing game-rule data functions

`classOptionsData.tsx` exports a default array; `emptyClassOptions` is also exported. Test individual class entries by importing the array and finding by `name`:

```ts
import classOptionsData from '../data/classOptionsData'

const fighter = classOptionsData.find(c => c.name === 'Fighter')!
expect(fighter.xpModifierPercentage({ strength: 13, ...rest })).toBe('+5%')
```

### XP modifier coverage

Each class that has prime requisites should have tests for:
- Below threshold → `'0%'`
- Single threshold (13) → `'+5%'`
- High threshold (16) → `'+10%'`
- Two prime req variants (both/either/16-13 rules as applicable)

### HP tests

Always test the minimum-1 rule:
```ts
// Constitution penalty should not reduce HP below 1
expect(result.current.characterStatistics.hitPoints).toBeGreaterThanOrEqual(1)
```

## E2E tests (Playwright)

### File placement

All specs go in `e2e/`. Name after the feature: `e2e/feature-name.spec.js`.

### Conventions

- Use `page.getByRole(…)` and `page.getByText(…)` over CSS selectors.
- Gate assertions with `await expect(…).toBeVisible()` before interacting.
- The base URL is set in `playwright.config.js`; just `page.goto('/')` for root.

### Wizard flow helpers

The standard wizard steps in order:
1. Landing → click **Start**
2. Ability Screen → **Roll All**, pick a class, click **Class Options**
3. Class Screen → **Roll HP**, click **Equipment**
4. Equipment Screen → **Roll Gold**, click **Character Details**
5. Details Screen → fill name, pick alignment, click **Character Sheet**

Reuse this sequence in any spec that needs a fully-built character.

### Mobile viewport

```js
test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14
```
