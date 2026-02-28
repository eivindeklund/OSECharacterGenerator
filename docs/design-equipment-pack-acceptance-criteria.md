# Design: Testing the Optimal Equipment Pack Generator

## Problem Statement

The current `getOptimalEquipmentPack` implementation produces unacceptably bad packs for
certain classes. The most acute example: a **Magic-User with 180 gp starting gold spends
only 21 gp** (11.7 % utilisation). After buying a staff, basic exploration gear, and
secondary gear, the algorithm has nothing left to purchase and silently exits — leaving
159 gp on the table.

The root cause is structural: the algorithm has a fixed list of spending phases (armour →
melee weapon → shield → class items → essential gear → ranged weapon → secondary gear) and
no fallback phase to exhaust remaining budget with plausible dungeoneering items. Classes
that skip most phases (MU: no armour, no shield, no ranged, no class items) end up
dramatically under-equipped.

Reference pack collections (OD&D equipment tables, Swords & Wizardry packs by
Attronarch's Athenaeum, the random-equipment system in *Carcass Crawler* #2) consistently
show that packs at every budget level should spend **nearly all available gold**, with
residual coins in the low single digits.

---

## What "Acceptable" Means

A pack is acceptable when it satisfies **all** of the following criteria:

| Criterion | Rationale |
|---|---|
| **Budget utilisation ≥ 80 %** of available gold | Reference packs universally leave < 10 gp unspent at every budget level; a generator leaving > 20 % is not doing useful work |
| **Hard residual cap**: unspent gold ≤ 20 gp if budget ≥ 60 gp | Prevents the MU-180gp failure mode while being lenient at low gold |
| **Mandatory category coverage**: at least one item in each required category **that the budget makes achievable**; if the budget is insufficient for a full kit, every missing category must be individually unaffordable given what was already purchased | A Cleric with 30 gp cannot buy weapon + holy symbol + all survival gear; the cheapest valid kit for a Cleric costs 41 gp. Missing categories are only acceptable when there is literally no gold left to fill them. |
| **Class-restriction compliance**: no disallowed weapons or armour | This is a rules violation and already tested, but the oversight tests must co-exist with the new tests |
| **Scaling monotonicity**: higher gold → same or more total items (or higher-value items) | A character with 180 gp should never receive an identical or strictly inferior pack to one with 30 gp |
| **No intra-category redundancy before inter-category coverage**: the pack must not hold multiple items serving the same combat role (two melee weapons, two ranged options) while any essential non-combat category is unfilled | Spending 17 gp on a sword + warhammer when the character has no light source or no rations is objectively worse than buying a sword then filling the other categories first |
| **Output variety**: repeated calls with the same class and gold must be capable of producing different packs; weapon choice, armour tier, and expansion gear should all vary across characters | Two fighters rolling the same gold should not necessarily be identically equipped — variety makes characters feel individual and matches the reference packs, which offer multiple valid loadouts at every budget level |

---

## Required Category Coverage

The following categories are mandatory for all classes. Items expected to satisfy each
category are drawn from the B/X equipment list (`in_bx_basic: true` or
`in_bx_expert: true` in `equipmentData.tsx`).

| Category | Acceptable items | Cheapest item (gp) |
|---|---|---|
| **Melee weapon** | Any weapon allowed by the class | staff 2 (MU), dagger 3 (most), warhammer 5 (Cleric) |
| **Light source** | torches (self-sufficient), OR lantern **paired with** at least one oil\_flask | torches 1; lantern + oil\_flask 12 (10 + 2) |
| **Container** | backpack, sack\_small, sack\_large | sack\_small 1 |
| **Water** | waterskin | 1 |
| **Rations** | rations\_standard, rations\_iron | rations\_standard 5 |
| **Ignition** | tinder\_box | 3 |

Additional mandatory items by class:

| Class type | Mandatory item(s) | Cost |
|---|---|---|
| Divine spellcasters (`characterClass.divine === true`) | holy\_symbol\_silver (BX mode) or holy\_symbol\_wooden (non-BX) | 25 gp (BX) / 1 gp (non-BX) |
| Thieves / Acrobats / Assassins | thieves\_tools | 25 gp |

### Minimum full-kit costs by class archetype

The minimum cost to fill **all** mandatory categories at the cheapest possible prices:

| Class archetype | Min full kit | Binding constraint |
|---|---|---|
| Fighter, Dwarf, Elf, Halfling | 14 gp | dagger (3) + torches (1) + sack\_small (1) + waterskin (1) + rations (5) + tinder (3) |
| Magic-User | 13 gp | staff is only 2 gp, otherwise same |
| Cleric (BX) | 41 gp | above + holy\_symbol\_silver (25) + warhammer (5) — symbol alone is 86 % of 30 gp |
| Thief | 39 gp | above + thieves\_tools (25) |

These figures determine whether a coverage test can use unconditional assertions or
must apply the budget-conditional form described in the next section.

---

## Gold-Utilisation Tests

These are the primary regression tests for the MU-180gp failure. They are parameterised
across all classes at the standard B/X starting-gold levels: **30, 60, 90, 120, 150, 180 gp**.

```
For each (class, gold) pair:
  pack = getOptimalEquipmentPack(classData, gold)
  totalCost = sum of (item.price × item.quantity) for all items in pack
  
  assert totalCost <= gold                         // never overspend (already tested)
  assert totalCost >= gold * 0.80                  // spend at least 80% of gold
  if gold >= 60:
    assert (gold - totalCost) <= 20                // hard residual cap
```

### Priority class / gold combinations

From the reference packs the following combinations are most diagnostic:

| Class | Gold | Expected min spend | Reference |
|---|---|---|---|
| Magic-User | 30 gp | 24 gp (80 %) | OD&D table: dagger + staff + torches + backpack + waterskin + iron rations = ~26 gp |
| Magic-User | 60 gp | 48 gp (80 %) | S&W 60 gp pack: dagger+staff+exploration kit near-zero coins |
| Magic-User | 120 gp | 96 gp (80 %) | S&W 120 gp pack: dagger+staff+riding horse+gear near-zero coins |
| Magic-User | 180 gp | 144 gp (80 %) | S&W 180 gp pack: dagger+staff+scroll+horse+full exploration kit near-zero coins |
| Fighter | 180 gp | 144 gp (80 %) | OD&D table row 18: plate+shield+sword+crossbow+full kit |
| Cleric | 180 gp | 144 gp (80 %) | S&W 180 gp pack: plate+shield+mace+holy symbol+full exploration kit |
| Thief | 180 gp | 144 gp (80 %) | S&W 180 gp pack: leather+thieves tools+sword+crossbow+full kit |

---

## Category-Coverage Tests

These tests verify that every pack fills as many mandatory categories as the budget
permits. Where the gold is sufficient for a complete kit, all categories must be
present. Where it is not, every absent category must be individually unaffordable —
i.e., the generator cannot be blamed for a gap it could not have closed.

### Core assertion (applies to every (class, gold) pair)

```
For each mandatory category C with cheapest item cost P:
  if present(pack, C):
    pass                                       // ✓ category covered
  else:
    remaining = gold - totalCostOf(pack)
    assert P > remaining                       // ✓ couldn't have afforded it anyway
```

The `present(pack, C)` check for the **light source** category is composite:
- `torches` in pack, OR
- `lantern` in pack **and** at least one `oil_flask` in pack

A lantern without oil does not satisfy the category. The cheapest item cost P for this
category is therefore 1 gp (a bundle of torches), since torches are self-sufficient.

This is the strongest correct form. It says: if a mandatory category is absent, the
pack must have spent the gold so thoroughly that even the cheapest possible item for
that category was out of reach. If the remaining gold ≥ cheapest item cost, then the
pack has unjustifiably skipped the category, which is a failure.

Note that this assertion interacts with the redundancy Rule 3: if a weapon purchase
exhausted the budget before a 1 gp category was reached, Rule 3 will catch the
weapon overspend as the root cause, and this assertion will surface the symptom.

### Known budget-constrained cases

The following (class, gold) pairs are **guaranteed to have unfillable categories** at
the standard cheapest prices, so unconditional category assertions must not be used:

| Class | Gold | Reason all categories cannot be filled |
|---|---|---|
| Cleric | 30 gp | Min full kit = 41 gp; any two of {holy symbol 25, weapon 5, rations 5, backpack 5} nearly exhaust the budget |
| Thief | 30 gp | Min full kit = 39 gp; thieves' tools (25 gp) + weapon (3 gp) + rations (5 gp) = 33 gp alone |

For all other class/gold pairs in the priority table (≥ 60 gp for every class;
Fighter/MU/Dwarf/Elf/Halfling even at 30 gp), the full mandatory kit is affordable
and unconditional assertions may be used.

### Priority ordering for partial budgets

When budget is insufficient for a full kit — the Cleric/Thief 30-gp case — the
generator must decide which categories to skip. The tests do not mandate a specific
priority order, but the reference packs suggest filling in ascending cost order ensures
maximum category breadth:

1. waterskin (1 gp) and torches (1 gp) and sack\_small (1 gp) — all three for 3 gp total
2. tinder\_box (3 gp)
3. rations\_standard (5 gp)
4. melee weapon (varies: 2–5 gp)
5. class mandatory items — holy symbol / thieves' tools (25 gp)

A generator that buys the holy symbol first and then runs out of waterskin budget is
not wrong by the core assertion above (the remaining gold after the symbol may be too
small), but the test still checks that the residual is truly < 1 gp — if it is ≥ 1 gp,
the waterskin was omittable only by not filling it.

Since the MU failure currently means none of these optional categories are _wrong_ (the
MU does buy torches, backpack, waterskin, rations, tinder box), the category tests alone
will not catch the bug. They exist to prevent regressions that remove covered categories
and to catch the new inverse failure of unjustified gaps at constrained budgets.

---

## Redundancy / Category-Balance Tests

These tests catch the inverse failure mode: a generator that front-loads weapons or
armour at the expense of broad category coverage. The canonical bad example is a pack
with a sword **and** a warhammer but no tinder box — a second melee weapon is pure
redundancy, while a tinder box enables every torch the character carries.

### Rule 1 — at most one primary melee weapon

Every pack must contain **at most one melee weapon**. The generator should pick the
best affordable option and move on; a second melee weapon is never preferable to an
unfilled essential category.

```
For each (class, gold) pair:
  pack = getOptimalEquipmentPack(classData, gold)
  meleeWeapons = pack.filter(item => isMeleeWeapon(item.id))
  assert meleeWeapons.length <= 1
```

Classes whose weapon list is restricted to dagger and staff (Magic-User, Elf when
treated as a MU) present a special case: the OD&D reference packs do sometimes include
both a staff **and** a dagger because the staff is the primary weapon and the dagger is
a backup/thrown option at a trivial 3 gp cost. The test may therefore relax to ≤ 2 for
those classes **only when** all mandatory exploration categories are already covered:

```
if class.weapons restricted to {dagger, staff}:
  if allMandatoryGearPresent(pack):
    assert meleeWeapons.length <= 2
  else:
    assert meleeWeapons.length <= 1
```

### Rule 2 — at most one ranged weapon type

A pack must contain at most one ranged weapon (ammo does not count against this limit).
Having both a long bow and a sling, or a crossbow and a sling, means the ranged-weapon
budget was spent twice when other categories could have been filled instead.

```
For each (class, gold) pair:
  pack = getOptimalEquipmentPack(classData, gold)
  rangedWeapons = pack.filter(item => isRangedWeapon(item.id))  // excludes ammo
  assert rangedWeapons.length <= 1
```

### Rule 3 — weapons must not crowd out mandatory categories

If the pack is **missing any mandatory category** (light, container, water, rations,
tinder box), the total spent on weapons must not exceed the cost of the cheapest
item that would fill the missing category. In other words: a gap in mandatory coverage
is evidence that weapon spending was prioritised over it.

```
For each (class, gold) pair:
  pack = getOptimalEquipmentPack(classData, gold)
  
  if isMissingMandatoryCategory(pack):         // light (torches, or lantern+oil) / container / water / rations / tinder
    weaponSpend = totalCostOfWeapons(pack)     // sum price × qty for all weapons
    cheapestFix = minCostToFillFirstMissingCategory()
    assert weaponSpend <= cheapestFix
    // i.e., spending on a second (or expensive) weapon was not the reason
    // the category is missing
```

This rule is intentionally conservative: it does not fire when all mandatory categories
are present, so a pack with plate mail + sword + ranged weapon + full gear is fine.

### Rule 4 — no duplicate item IDs

The `getOptimalEquipmentPack` return type is `Array<{ id: string; quantity: number }>`.
Each item ID must appear **at most once** in the array; multiplicity is expressed via
`quantity`, not by repeating the same ID.

```
For each (class, gold) pair:
  pack = getOptimalEquipmentPack(classData, gold)
  ids = pack.map(item => item.id)
  assert ids.length === new Set(ids).size     // no duplicate IDs
```

This is a data-integrity check as much as a logic check and should be the first test
run, since duplicate IDs would corrupt the cost calculations in all other tests.

### Concrete regression test cases

| Scenario | Pack contents that would fail | Failing rule |
|---|---|---|
| Fighter 60 gp | sword + warhammer, no tinder box | Rule 1 and Rule 3 |
| Fighter 60 gp | sword + hand\_axe, no light source | Rule 1 and Rule 3 |
| Cleric 80 gp | warhammer + mace, holy symbol present, no rations | Rule 1 and Rule 3 |
| Fighter 140 gp | long\_bow + sling in same pack | Rule 2 |
| Any class, any gold | `[{ id: 'sword', qty: 1 }, { id: 'sword', qty: 1 }]` | Rule 4 |
| Magic-User 60 gp | staff + dagger when backpack is missing | Rule 3 (relaxed Rule 1) |

---

## Budget-Scaling Tests

These tests ensure a higher budget results in a strictly better pack. "Better" is defined
as either more total items or more total cost.

```
For each class:
  packLow  = getOptimalEquipmentPack(classData, 60)
  packHigh = getOptimalEquipmentPack(classData, 120)
  
  assert costOf(packHigh) > costOf(packLow)

For each class:
  packLow  = getOptimalEquipmentPack(classData, 120)
  packHigh = getOptimalEquipmentPack(classData, 180)
  
  assert costOf(packHigh) > costOf(packLow)
```

Tier-specific assertions for classes with wide budget ranges:

| Class | Budget tier | Item expected to appear | Rationale |
|---|---|---|---|
| Magic-User | ≥ 60 gp | `oil_flask` (supplement to torches) OR `lantern` + `oil_flask` (full lantern upgrade) | At 60 gp the MU has budget to upgrade lighting |
| Magic-User | ≥ 90 gp | `pole_10_wooden` OR `iron_spikes` | Dungeoneering at moderate budget |
| Magic-User | ≥ 90 gp | `mirror_hand_steel` OR `iron_spikes` | Dungeoneering utility |
| Magic-User | ≥ 120 gp | `lantern` AND `oil_flask` | Lantern (10 gp) + oil (2 gp) = 12 gp, affordable and superior to torches |
| Fighter | ≥ 60 gp | `iron_spikes` OR `pole_10_wooden` | Secondary dungeoneering |
| Fighter | ≥ 120 gp | a ranged weapon | Attronarch: "each Fighter pack is equipped to dish out pain up front and at distance" |
| Cleric | ≥ 60 gp | `iron_spikes` OR `rope_50` | Secondary dungeoneering |

---

## Class-Specific Constraint Tests

These already exist in large part but should be extended with budget utilisation
assertions:

```typescript
// Existing: MU gets no armour
test('Magic-User gets no armour regardless of gold', () => {
  for (const gold of [30, 60, 90, 120, 150, 180]) {
    const pack = getOptimalEquipmentPack(getClass('Magic-User'), gold);
    expect(hasAnyItem(pack, ['leather', 'chainmail', 'plate_mail'])).toBe(false);
  }
});

// NEW: MU still spends ≥ 80% at every level
test('Magic-User spends at least 80% of gold at every standard budget level', () => {
  for (const gold of [30, 60, 90, 120, 150, 180]) {
    const pack = getOptimalEquipmentPack(getClass('Magic-User'), gold);
    const cost = totalCostOf(pack);
    expect(cost).toBeGreaterThanOrEqual(gold * 0.80);
  }
});
```

---

## Oracle / Snapshot Tests

The reference sources provide explicit ground-truth packs at given budget levels. Rather
than asserting exact item lists (which is fragile and system-specific), use
**set-containment oracles**: the generated pack must contain every item in the oracle's
_mandatory kernel_.

### Magic-User mandatory kernels (B/X OSE price list)

| Budget | Mandatory kernel | Source |
|---|---|---|
| 30 gp | dagger or staff, backpack, waterskin, torches or candles, rations | OD&D table row 3–4; S&W 30 gp pack |
| 60 gp | staff, dagger, backpack, waterskin, light source, tinder box, rations | S&W 60 gp pack |
| 90 gp | staff, dagger, backpack, waterskin, lantern, oil_flask, tinder_box, rations, rope_50 OR pole_10_wooden | S&W 90 gp pack (lantern + oil + chain/manacles); OD&D 90 gp row |
| 120 gp | staff, dagger, backpack, waterskin, lantern, oil_flask, tinder_box, rations | S&W 120 gp pack |
| 180 gp | staff, dagger, backpack, waterskin, lantern, oil_flask, tinder_box, rations | S&W 180 gp pack |

Note: S&W and OD&D packs include a scroll at 130+ gp (100 gp per spell level) and a
riding horse or mule at 80–120 gp. The OSE B/X equipment data does not include these
items. The kernel therefore deliberately omits them; add them if/when they are added to
the item catalogue.

### Fighter mandatory kernels

| Budget | Mandatory kernel | Source |
|---|---|---|
| 30 gp | melee weapon, torches, backpack, waterskin, rations | OD&D row 3; S&W 30 gp pack |
| 60 gp | leather, melee weapon, torches or (lantern + oil\_flask), backpack, waterskin, rations | S&W 60 gp (leather+short_sword+spear+exploration kit) |
| 90 gp | chainmail, melee weapon, torches or (lantern + oil\_flask), backpack, waterskin, rations | S&W 90 gp (ring mail is S&W; chainmail is OSE equivalent) |
| 120 gp | chainmail or plate_mail, melee weapon, shield (if one-handed), backpack, waterskin, torches or (lantern + oil\_flask), rations | OD&D row 10; S&W 120 gp |
| 180 gp | plate_mail, melee weapon, shield, ranged weapon, backpack, waterskin, lantern, oil_flask, rations | OD&D row 18 |

### Cleric mandatory kernels

| Budget | Mandatory kernel |
|---|---|
| 30 gp | blunt melee weapon, backpack, waterskin, torches, rations, holy_symbol_silver |
| 80 gp | chainmail, warhammer or mace, shield, holy_symbol_silver, backpack, waterskin, rations |
| 120 gp | plate_mail, warhammer or mace, holy_symbol_silver, backpack, waterskin, light source, rations |
| 180 gp | plate_mail, shield, warhammer or mace, holy_symbol_silver, backpack, waterskin, lantern, oil\_flask, rations |

---

## Implementing the Tests

### Helper functions needed

```typescript
/** Returns total gold cost of a resolved pack. */
function totalCostOf(pack: { id: string; quantity: number }[]): number {
  return pack.reduce((sum, item) => {
    const data = allItems[item.id];
    return sum + (data?.price ?? 0) * item.quantity;
  }, 0);
}

/** True if pack contains at least one of the given item ids. */
function hasAnyItem(pack: { id: string }[], ids: string[]): boolean {
  return ids.some(id => pack.some(item => item.id === id));
}

/** True if pack contains at least one weapon the given class is allowed to use. */
function hasMeleeWeapon(
  pack: { id: string }[],
  characterClass: ClassOptionsData
): boolean {
  return pack.some(item => {
    const weapon = allItems[item.id];
    return weapon?.category === 'weapon' && characterClass.isStandardWeapon(weapon);
  });
}
```

### Suggested test file location

`src/utilities/PackUtils.optimal.test.ts`

Keep the new budget-utilisation and oracle tests in a separate file from the existing
`PackUtils.test.ts` so that the structural/unit tests and the acceptance/oracle tests have
distinct scopes and can be understood separately.

### Suggested describe blocks

```
describe('getOptimalEquipmentPack — budget utilisation', () => {
  // parametric gold-utilisation tests for each class × gold level
})

describe('getOptimalEquipmentPack — category coverage', () => {
  // mandatory item category tests
})

describe('getOptimalEquipmentPack — scaling monotonicity', () => {
  // higher gold → greater cost
})

describe('getOptimalEquipmentPack — oracle / reference kernels', () => {
  // mandatory-item-set tests derived from reference packs
})
```

---

## Variety / Randomisation Tests

All other tests in this document verify correctness of a single output. These tests verify
that the generator is *non-deterministic in a controlled way*: repeated calls with the same
class and gold must have the possibility of producing different packs, while every individual
output must still pass every other test.

### Generator interface prerequisite

The current `getOptimalEquipmentPack` is fully deterministic. To be testable for variety it
must accept an injectable random source — either a seeded PRNG passed as an argument, or an
internal source that can be externally seeded:

```typescript
// Suggested signature extension
getOptimalEquipmentPack(
  characterClass: ClassOptionsData | null,
  gold: number,
  bxOnly?: boolean,
  random?: () => number   // drop-in for Math.random; defaults to Math.random
): Array<{ id: string; quantity: number }>
```

This lets variety tests call the function with different seeds and guarantees that
correctness tests remain reproducible by fixing a seed.

### Test approach

Run the generator a fixed number of times (N = 20 is sufficient) with distinct seeds for
the same (class, gold) pair and collect the results. Then assert on the distribution:

```
function varietyPacks(classData, gold, n = 20):
  return Array.from({ length: n }, (_, i) =>
    getOptimalEquipmentPack(classData, gold, true, seededRandom(i))
  )

// For each pack in the set, all correctness invariants must hold
for pack of varietyPacks(classData, gold):
  assert totalCostOf(pack) <= gold
  assert totalCostOf(pack) >= gold * 0.80
  assert noMandatoryCategoryUnjustifiablyMissing(pack, classData, gold)
  assert meleeWeaponsCount(pack) <= 1   // subject to MU relaxation
  assert rangedWeaponsCount(pack) <= 1
  assert noDuplicateIds(pack)
```

### Dimension 1 — weapon variety

Among N packs for the same class and gold, at least 2 distinct melee weapons must appear.
The eligible pool is all weapons the class can use that fit within the remaining budget
after armour; the generator should sample from this pool rather than always picking the
highest-priority item.

```
packs = varietyPacks(getClass('Fighter'), 90)  // leather affordable, sword + battle_axe + warhammer all viable
meleeWeapons = packs.map(p => getMeleeWeapon(p).id)
assert new Set(meleeWeapons).size >= 2
```

Priority classes and gold for this test:

| Class | Gold | Eligible melee weapons (within budget after armour) |
|---|---|---|
| Fighter | 60 gp | sword, short\_sword, hand\_axe, battle\_axe, spear, warhammer, mace |
| Fighter | 120 gp | sword, battle\_axe, two\_handed\_sword, polearm |
| Cleric | 60 gp | warhammer, mace |
| Thief | 60 gp | short\_sword, hand\_axe, dagger |

### Dimension 2 — armour tier variety

At budget levels where the current greedy algorithm would always choose plate, the
generator should occasionally choose chainmail instead (spending the freed 20 gp on
additional gear). Similarly, chainmail should sometimes yield to leather. The test does
not require a specific frequency — only that both tiers appear across N runs.

```
packs = varietyPacks(getClass('Fighter'), 180)  // greedy choice: plate
armours = packs.map(p => getArmour(p).id)   // returns 'plate_mail', 'chainmail', etc.
assert armours.includes('plate_mail')         // optimal still appears
assert armours.includes('chainmail')          // sub-optimal also appears
```

Every pack in the set must still pass the budget-utilisation test: choosing a cheaper
armour is only valid if the freed gold is spent on something else. A pack with chainmail
and the same total cost as a plate pack is not acceptable.

Priority cases:

| Class | Gold | Tiers that should both appear |
|---|---|---|
| Fighter | 120 gp | plate\_mail (60 gp) and chainmail (40 gp) |
| Fighter | 180 gp | plate\_mail and chainmail |
| Cleric | 120 gp | plate\_mail and chainmail |
| Cleric | 80 gp | chainmail and leather |

### Dimension 3 — expansion gear variety

For classes that reach the secondary gear phase with meaningful budget remaining (MU
with 90 gp, Fighter with 180 gp after plate + sword + full mandatory kit), the items
chosen from the expansion list should vary between runs.

```
packs = varietyPacks(getClass('Magic-User'), 120)
// After staff + mandatory gear (~21 gp), ~99 gp remains for expansion items.
// Possible choices: lantern, iron_spikes, pole_10_wooden, mirror_hand_steel, rope_50, oil_flask, ...
expansionItems = packs.map(p => getExpansionItems(p))   // items beyond mandatory set
allChosen = expansionItems.flat().map(i => i.id)
assert new Set(allChosen).size >= 3    // at least 3 distinct expansion items appear across runs
```

### Stability requirement

Variety must not come at the cost of correctness. The test suite should be structured so
that the variety tests run **after** the correctness tests, and variety test failures are
meaningful only when all correctness tests pass. A generator that randomly omits the
waterskin has variety but is broken.

Suggested test structure:

```typescript
describe('getOptimalEquipmentPack — variety / randomisation', () => {
  // Run correctness assertions on every pack in the variety set first
  test('all packs in variety set satisfy correctness invariants', () => {
    for (const [cls, gold] of PRIORITY_PAIRS) {
      for (const pack of varietyPacks(getClass(cls), gold)) {
        expectCorrect(pack, getClass(cls), gold);   // shared helper
      }
    }
  });

  // Then assert on distribution
  test('weapon choice varies across 20 runs — Fighter 90 gp', () => { ... });
  test('armour tier varies across 20 runs — Fighter 180 gp', () => { ... });
  test('expansion gear varies across 20 runs — Magic-User 120 gp', () => { ... });
});
```

---

## What the Tests Will Expose (Anticipated Failures)

Running the tests above before fixing the generator will produce failures in the following
categories:

| Test | Failing class(es) | Expected failure message |
|---|---|---|
| Budget utilisation ≥ 80% (180 gp) | Magic-User | spent 21 gp, expected ≥ 144 gp |
| Budget utilisation ≥ 80% (120 gp) | Magic-User | spent ~21 gp, expected ≥ 96 gp |
| Hard residual cap ≤ 20 gp (180 gp) | Magic-User | 159 gp remaining, expected ≤ 20 gp |
| Scaling: 120 gp better than 60 gp | Magic-User | 0 cost difference (both spend ~21 gp) |
| Scaling: 180 gp better than 120 gp | Magic-User | 0 cost difference |
| Oracle kernel (90 gp): lantern + oil\_flask present | Magic-User | lantern or oil\_flask not found |
| Oracle kernel (90 gp): rope or pole present | Magic-User | neither found |

The Fighter, Cleric, and Thief should pass or come close to passing the budget tests
because their armour purchase consumes a large portion of gold; they will likely fail only
the 30 gp edge case where the armour budget cap leaves both armour and the gear list
underfunded.

---

## Design Implications for the Generator

Passing the tests above will require the generator to implement at least one additional
spending phase: a **"fill remaining budget with useful dungeoneering gear"** phase that
iterates a prioritised expansion list (pole, iron spikes, mirror, extra oil, extra
torches/candles, large sack, extra rope, etc.) until the budget is exhausted. The
reference sources suggest this priority order for the expansion list:

1. Upgrade torches → lantern + extra oil flasks (if not already owned)
2. `iron_spikes` (1 gp, dungeoneering utility)
3. `pole_10_wooden` (1 gp)
4. `mirror_hand_steel` (5 gp)
5. `sack_large` (2 gp)
6. Additional `oil_flask` (2 gp each, up to a sensible cap)
7. `rope_50` if not held (1 gp)
8. `wolfsbane` or `garlic` if not in BX-only mode (monster countermeasures)
9. Additional ration packs (upgrade standard → iron if budget allows)

Additionally, the generator needs a **randomness mechanism** to satisfy the variety tests:
- The function signature should accept an optional seeded random source (e.g. `random?: () => number` defaulting to `Math.random`) so variety tests are repeatable with seeds while production usage gets natural variation.
- **Weapon selection** should sample from the pool of affordable, class-eligible weapons near the budget ceiling rather than always picking the highest-priority item in a fixed list.
- **Armour tier** should be randomised within a configurable probability: e.g., 70 % chance of the best affordable tier, 30 % chance of one tier down (with freed gold redirected to gear). The exact probability is a tuning parameter, not a test requirement — any distribution that produces both tiers across 20 runs is acceptable.
- **Expansion gear order** should be shuffled within each run so the same class and gold produces different secondary items on different characters.

For Magic-User specifically, the OD&D and S&W references suggest that at 130 gp+ a
scroll (100 gp) is a high-priority purchase — this would single-handedly solve the
under-spending problem. Whether to implement this depends on whether scroll items exist
in the equipment catalogue.

The tests themselves are **implementation-agnostic**: they specify outcomes, not how the
generator should achieve them. Any restructuring of `getOptimalEquipmentPack` that passes
all the tests above is acceptable.
