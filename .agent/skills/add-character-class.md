---
name: add-character-class
description: >
  Add a new character class to the OSE Character Generator, covering all required
  fields in classOptionsData, game-rule data, and associated tests.
---

# Skill: Add a Character Class

## Overview

All classes live in `src/data/classOptionsData.tsx` as elements of the default export array. Each entry must satisfy the `ClassOptionsData` interface defined in `src/types.ts`.

## Step-by-step

### 1. Understand the class rules

Check `reference/OSE.SRD.Wiki/2. Classes/` for the authoritative class description. Note:
- Prime requisites and XP bonus thresholds
- Allowed armour and weapons
- Hit die (HD) type
- Maximum level
- Saving throw progression (array of 5 values at level 1)
- Special abilities list
- Spell lists (if any)

### 2. Choose the correct `xpBonus_*` helper

Helpers are defined at the top of `classOptionsData.tsx`:

| Rule text | Helper |
|---|---|
| "16/13 or both 13" | `xpBonus_16_13_Or_Both_13` |
| "16/13 or either 13" | `xpBonus_16_13_Or_Either_13` |
| "Any 16/13 or both 13" | `xpBonus_Any16_13_Or_Both13` |
| "Both 16 or both 13" | `xpBonus_Both16_Or_Both13` |
| "Both 16 or either 13" | `xpBonus_Both16_Or_Either13` |
| "Both 13 or either 13" | `xpBonus_Both13_Or_Either13` |

If none fits, add a new helper following the same `(a, b) => number` signature returning `0 | 5 | 10`.

### 3. Create the class entry

Minimum shape:

```ts
{
  name: 'MyClass',
  category: 'core' | 'advanced' | 'carcass-crawler',
  requirements: null | 'Ability ≥ N',
  primeReqs: ['abilityName'],           // 1–2 entries
  hd: 6,                                // die faces: 4, 6, 8, 10
  maxLevel: 14,
  armour: 'Any',
  weapons: 'Any',
  isStandardWeapon: (w) => true,        // or filter using checkWeaponQuality()
  languages: '',
  description: 'One-sentence summary.',
  savingThrows: [12, 13, 14, 15, 16],  // [Death, Wands, Paralysis, Breath, Spells]
  nextLevel: 2000,                      // XP to reach level 2
  abilities: ['Ability one', 'Ability two'],
  link: 'https://oldschoolessentials.necroticgnome.com/srd/…',
  arcane: false,
  divine: false,
  xpModifierPercentage: (abilityScores) => {
    const bonus = xpBonus_16_13_Or_Both_13(
      abilityScores.strength, abilityScores.intelligence
    )
    return bonus === 0 ? '0%' : `+${bonus}%`
  },
  checkAbilityScoreRequirements: makeAbilityRequirementsChecker([]),
}
```

`makeAbilityRequirementsChecker` is a factory in `classOptionsData.tsx` that takes an array of `AbilityRequirement` objects.

### 4. Add spell flags if needed

```ts
arcaneSpells: true,        // uses arcane spell list
divineSpells: true,        // uses divine spell list
druidSpells: true,
illusionistSpells: true,
necromancerSpells: true,
runesmithSpells: true,
```

### 5. Update tests

Create or extend `src/data/classOptionsData.test.ts`:
- Test `xpModifierPercentage` at all prime req thresholds.
- Test `checkAbilityScoreRequirements` with a valid and an invalid score set.
- Test `isStandardWeapon` with an allowed and a forbidden weapon.

### 6. Verify the UI

Run `npm run dev` and navigate to the Ability Screen. The new class should appear in the class list if ability scores meet its requirements.

Run `npm run test:all` to confirm nothing regressed.

## Common pitfalls

- Forgetting to export nothing extra — only modify the default export array.
- Using magic numbers for saving throws instead of matching the OSE table for the class.
- Not testing the "neither threshold met → 0%" XP case.
- Using `any` for the weapon filter argument without the `eslint-disable` comment already present in the file.
