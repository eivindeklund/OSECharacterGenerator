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

### 2. Write the `xpBonusRule` string (two-prime-req classes only)

Classes with **two** prime requisites need an `xpBonusRule` string. The format mirrors OSE rulebook phrasing: the **10% condition comes first**, the **5% condition second**, separated by `; `.

```
"10% if <condition>; 5% if <condition>"
```

Evaluation is first-match: the result is the percent of the first clause whose condition is satisfied, or 0%. Omit `xpBonusRule` entirely for single-prime-req classes.

**Supported condition forms** (ability names must be lowercase, matching `abilityScoreNames`):

| Condition in rule text | DSL form |
|---|---|
| Either ability ≥ N | `either A or B is N or more` |
| Both abilities ≥ N | `both A and B are N or more` |
| First ≥ N and second ≥ M | `A is N or more and B is M or more` |
| (A≥N and B≥M) or (A≥M and B≥N) | `either A or B is N or more and the other is M or more` |

**Common class patterns** (A = first prime req, B = second prime req):

| OSE rule text | `xpBonusRule` |
|---|---|
| +10% if A≥16 and B≥13; +5% if both ≥13 | `"10% if A is 16 or more and B is 13 or more; 5% if both A and B are 13 or more"` |
| +10% if A≥16 and B≥13; +5% if either ≥13 | `"10% if A is 16 or more and B is 13 or more; 5% if either A or B is 13 or more"` |
| +10% if either ≥16 and other ≥13; +5% if both ≥13 | `"10% if either A or B is 16 or more and the other is 13 or more; 5% if both A and B are 13 or more"` |
| +10% if both ≥16; +5% if both ≥13 | `"10% if both A and B are 16 or more; 5% if both A and B are 13 or more"` |
| +10% if both ≥16; +5% if either ≥13 | `"10% if both A and B are 16 or more; 5% if either A or B is 13 or more"` |
| +10% if both ≥13; +5% if either ≥13 | `"10% if both A and B are 13 or more; 5% if either A or B is 13 or more"` |
| +10% if either ≥16 and other ≥13; +5% if either ≥13 | `"10% if either A or B is 16 or more and the other is 13 or more; 5% if either A or B is 13 or more"` |

The format is validated at test time by `ClassOptions.parseXpBonusRule` — if the string does not parse, tests will fail.

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
  xpBonusRule: "10% if strength is 16 or more and intelligence is 13 or more; 5% if both strength and intelligence are 13 or more",
  // omit xpBonusRule entirely for classes with a single prime req
}
```

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
