---
name: code-review
description: >
  Review code changes in the OSE Character Generator for correctness, consistency
  with project conventions, TypeScript safety, and game-rule accuracy.
---

# Skill: Code Review

## Checklist

### TypeScript

- [ ] New functions and parameters have explicit types or are covered by inference.
- [ ] No use of `any` without a comment explaining why.
- [ ] Interfaces added/changed in **`src/types.ts`** (shared types go there, not inline).
- [ ] Index signatures (`[key: string]: …`) only where truly dynamic.

### State management

- [ ] All new wizard state lives inside **`useCharacterManager.ts`**.
- [ ] Props are drilled from `CharacterGenerator.tsx` down to screens; no new globals.
- [ ] `screen` state: exactly one flag set to `true` at a time.
- [ ] `emptyClassOptions` is used as the initial class state sentinel (not `null`).

### Game-rule correctness

- [ ] Ability score modifiers are looked up from `src/data/abilityScoreMods.tsx`, not hardcoded.
- [ ] XP bonus logic uses the appropriate `xpBonus_*` helper in `classOptionsData.tsx`.
- [ ] HP minimum is enforced (`Math.max(1, roll + constitutionMod)`).
- [ ] Equipment purchases are constrained by the character's `gold` value.
- [ ] If a new class is added, all required `ClassOptionsData` fields are present,
  including `xpModifierPercentage`, `checkAbilityScoreRequirements`, and `isStandardWeapon`.

### Naming & structure

- [ ] New screens follow the `*Screen.tsx` + `*Screen.test.tsx` naming convention.
- [ ] New data files live in `src/data/`.
- [ ] New pure utilities live in `src/utilities/`.
- [ ] Constants go in `src/constants/constants.tsx`.

### i18n

- [ ] Any new user-visible string has an entry in both `en` and `de` blocks
  inside `src/utilities/i18n.tsx`.

### Tests

- [ ] Unit tests cover new branches in game-rule logic.
- [ ] Existing Vitest and Playwright tests pass (`npm run test:all`).

### Do-not-touch

- [ ] `reference/`, `temp/`, `public/assets/dice-box/`,
  `src/css/normalize.css`, `src/css/skeleton.css` are unchanged.
