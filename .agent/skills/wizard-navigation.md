---
name: wizard-navigation
description: >
  Understand and modify the multi-step character creation wizard's navigation
  logic, screen rendering, and guard conditions.
---

# Skill: Wizard Navigation

## How screens work

Navigation is **not** React Router. The wizard uses a `screen` object of boolean flags managed inside `useCharacterManager.ts`:

```ts
screen = {
  abilityScreen: boolean,
  classScreen: boolean,
  detailsScreen: boolean,
  equipmentScreen: boolean,
  characterSheetScreen: boolean,
  characterStorageScreen: boolean,
}
```

`CharacterGenerator.tsx` conditionally renders the matching `*Screen` component based on which flag is `true`. Exactly one flag should be `true` at any time (by convention — TypeScript does not enforce this).

## Navigation order (happy path)

```
LandingScreen
  └─ Start button → abilityScreen: true

AbilityScreen  (roll stats, pick class)
  └─ "Class Options" → classScreen: true

ClassScreen  (class details, roll HP)
  └─ "Equipment" → equipmentScreen: true

EquipmentScreen  (roll gold, buy gear)
  └─ "Character Details" → detailsScreen: true

DetailsScreen  (name, alignment, description)
  └─ "Character Sheet" → characterSheetScreen: true

CharacterSheetScreen  (review + export PDF)
  └─ "Tavern" → characterStorageScreen: true

CharacterStorageScreen  (saved characters list)
```

There is also `ImportCharacterScreen`, shown when the URL contains a `?data=…` query param (shared character).

## Changing screens

Call `setScreen` with all flags overridden:

```ts
setScreen({
  abilityScreen: false,
  classScreen: true,
  detailsScreen: false,
  equipmentScreen: false,
  characterSheetScreen: false,
  characterStorageScreen: false,
})
```

A helper pattern used in the codebase:

```ts
const navigateTo = (screenName: keyof ScreenState) =>
  setScreen(Object.fromEntries(
    Object.keys(screen).map(k => [k, k === screenName])
  ) as ScreenState)
```

## Guard conditions (Next button disabled)

Each screen's "Next" button is disabled until the player has completed the required step:

| Screen | Required state |
|---|---|
| AbilityScreen | All 6 ability scores rolled (`!= null`) AND a class selected |
| ClassScreen | HP rolled (`hitPoints != null`) |
| EquipmentScreen | Gold rolled (`gold != null`) |
| DetailsScreen | Name entered AND alignment selected |

When writing new guard logic, check the existing `disabled` prop in the screen component's Next button.

## Scrolling

After navigation, the view should scroll to the appropriate position. As of Feb 2026 this is an open bug (see TODO.md "Planned prompts — Scrolling during navigation" for the full spec).

## Adding a new screen

1. Create `src/pages/NewScreen.tsx` + `src/pages/NewScreen.test.tsx`.
2. Add the flag to the `ScreenState` interface in `src/types.ts`.
3. Add the flag to the `screen` initial state in `useCharacterManager.ts`.
4. Add a conditional render block in `CharacterGenerator.tsx`.
5. Wire up navigation from the preceding and following screens.
6. Add an e2e spec or extend `happy-path.spec.js`.
