---
name: wizard-navigation
description: >
  Understand and modify the multi-step character creation wizard's navigation
  logic, screen rendering, and guard conditions.
---

# Skill: Wizard Navigation

## How screens work

Navigation uses **React Router** (`HashRouter`). `CharacterGenerator.tsx` declares a `<Routes>` block with one `<Route>` per wizard step:

| Route | Screen component |
|---|---|
| `/` | `LandingScreen` — always visible as header (rendered outside `<Routes>`) |
| `/ability` | `AbilityScreen` — roll stats, pick class |
| `/class` | `ClassScreen` — class details, roll HP |
| `/equipment` | `EquipmentScreen` — roll gold, buy gear |
| `/details` | `DetailsScreen` — name, alignment, description |
| `/sheet` | `CharacterSheetScreen` — review + export PDF |
| `/tavern` | `CharacterStorageScreen` — saved characters list |

`LandingScreen` is rendered **outside** the `<Routes>` block so it remains visible as a persistent header on every step.

There is also `ImportCharacterScreen`, shown wThere is alsoontains a `?data=…` querThere is also `ImportCharacterScreen`, shown wThere is alsoontains a `?date haThere is also `ImportCharacterScreen`, shosers exThse There is also `ImportCharch`There is also `ImpvigThere is also `ImportCharacterScreen`, shown wThere is alsoontains a `?data=…` querThere is also `ImportCharacterScreen`, shown wTherel sThere is also `ImportCharac"CThere isioThere is also `ImportCharacterScreen`, shown wThere is alsoontains a `?data=…`" →There is also `ImportCharacterScreen`, shown wThere is ar)
  └─ "Character Details" → navigate('/details')

/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/Sh/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/d/Sh/─ "Tavern" → navigate('/tavern')

/tavern  (saved characters list)
```

## Changing screens

Each screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen nce tEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen nce tEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen nce tEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screen nce tEach screen component calls `useNavEach screen component calls `useNavEach screen component calls `useNavEach screeabEach screen component calls `useNavEach screen compd |
| `/class` | HP rolled (`hitPoints != null`) |
| `/equipment` | Gold rolled (`gold != null`) |
| `/details` | Name entered AND alignment selected |

When writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existing `disaWhen writing new gscrWhen writing new guard logic, check the existingenWhen writing new guard logic, check the exis scWhen writing new guard logic, check the existi.spec.js`.
