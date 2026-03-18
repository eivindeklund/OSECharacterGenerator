/**
 * Acceptance tests for getOptimalEquipmentPack.
 * Based on: docs/design-equipment-pack-acceptance-criteria.md
 *
 * These tests are written spec-first (RED → GREEN TDD).
 * Run with: npx vitest run src/utilities/PackUtils.optimal.test.ts
 */

import armourData from '../data/armourData';
import classOptionsData from '../data/classOptionsData';
import equipmentData from '../data/equipmentData';
import weaponsData from '../data/weaponsData';
import type { ClassOptionsData } from '../types';
import { getOptimalEquipmentPack } from './PackUtils';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build the same flat allItems map PackUtils uses internally. */
const allItems: Record<string, { price: number; category: string; [k: string]: unknown }> = {};
for (const item of (equipmentData as { id?: string; price?: number; [k: string]: unknown }[])) {
  if (item.id) allItems[item.id as string] = { ...item, category: 'gear' } as { price: number; category: string; [k: string]: unknown };
}
for (const item of (weaponsData as { id?: string; price?: number; [k: string]: unknown }[])) {
  if (item.id) allItems[item.id as string] = { ...item, category: 'weapon' } as { price: number; category: string; [k: string]: unknown };
}
for (const item of (armourData as { id?: string; price?: number; [k: string]: unknown }[])) {
  if (item.id) allItems[item.id as string] = { ...item, category: 'armour' } as { price: number; category: string; [k: string]: unknown };
}

/** Returns the total gold value of a pack. */
function totalCostOf(pack: { id: string; quantity: number }[]): number {
  return pack.reduce((sum, item) => {
    const data = allItems[item.id];
    return sum + (data ? (data.price as number) * item.quantity : 0);
  }, 0);
}

/** True if pack contains at least one of the given item IDs. */
function hasAnyItem(pack: { id: string }[], ids: string[]): boolean {
  return ids.some(id => pack.some(item => item.id === id));
}

/** True if pack contains a specific item. */
const hasItem = (pack: { id: string }[], id: string) => pack.some(i => i.id === id);

/** Return item count of items matching one of the given IDs. */
function countItems(pack: { id: string }[], ids: string[]): number {
  return pack.filter(item => ids.includes(item.id)).length;
}

// NOTE: 'torches' is in weaponsData with category "Melee" as an improvised
// weapon, but for pack-balance rules it is a light source, not a melee weapon.
// It is therefore excluded from MELEE_WEAPON_IDS so Rule 1 / Rule 3 don't
// treat it as a combat purchase.
const MELEE_WEAPON_IDS = [
  'battle_axe', 'club', 'dagger', 'hand_axe', 'javelin', 'lance', 'mace',
  'polearm', 'short_sword', 'silver_dagger', 'spear', 'staff', 'sword',
  'two_handed_sword', 'warhammer',
];
const RANGED_WEAPON_IDS = ['long_bow', 'crossbow', 'short_bow', 'sling'];
const AMMO_IDS = ['arrows_20', 'crossbow_bolts_30', 'silver_tipped_arrow_1'];

/** True if the pack's light-source category is satisfied:
 *  either torches present, or lantern + at least one oil_flask present. */
function hasLightSource(pack: { id: string }[]): boolean {
  if (hasItem(pack, 'torches')) return true;
  if (hasItem(pack, 'lantern') && hasItem(pack, 'oil_flask')) return true;
  return false;
}

/** True if the pack contains a container. */
function hasContainer(pack: { id: string }[]): boolean {
  return hasAnyItem(pack, ['backpack', 'sack_small', 'sack_large']);
}

/** True if the pack has a melee weapon allowed by the given class.
 *  'torches' is excluded even though it appears in weaponsData as Melee. */
function hasMeleeWeapon(pack: { id: string }[], cls: ClassOptionsData): boolean {
  return pack.some(item => {
    if (!MELEE_WEAPON_IDS.includes(item.id)) return false;
    const weapon = allItems[item.id];
    if (!weapon) return false;
    return cls.canUseWeapon(weapon);
  });
}

// Cheapest item prices for each mandatory category (from the spec).
const CHEAPEST = {
  melee_weapon: 2,   // staff for MU, dagger for most
  light:        1,   // torches
  container:    1,   // sack_small
  water:        1,   // waterskin
  rations:      5,   // rations_standard
  tinder:       3,   // tinder_box
  holy_symbol:  25,  // silver (BX)
  thieves_tools: 25,
};

/**
 * For each mandatory category that is missing from a pack, returns the
 * cheapest item cost that would fill it.  An empty array means all
 * categories are satisfied.
 */
function missingMandatoryCosts(
  pack: { id: string }[],
  cls: ClassOptionsData,
): number[] {
  const missing: number[] = [];

  if (!hasMeleeWeapon(pack, cls)) missing.push(CHEAPEST.melee_weapon);
  if (!hasLightSource(pack))       missing.push(CHEAPEST.light);
  if (!hasContainer(pack))         missing.push(CHEAPEST.container);
  if (!hasItem(pack, 'waterskin')) missing.push(CHEAPEST.water);
  if (!hasAnyItem(pack, ['rations_standard', 'rations_iron'])) missing.push(CHEAPEST.rations);
  if (!hasItem(pack, 'tinder_box')) missing.push(CHEAPEST.tinder);

  if (cls.magicTypeId === 'divine' && !hasAnyItem(pack, ['holy_symbol_silver', 'holy_symbol_wooden', 'holy_symbol_gold'])) {
    missing.push(CHEAPEST.holy_symbol);
  }
  const THIEF_CLASSES = ['Thief', 'Acrobat', 'Assassin'];
  if (THIEF_CLASSES.includes(cls.name) && !hasItem(pack, 'thieves_tools')) {
    missing.push(CHEAPEST.thieves_tools);
  }

  return missing;
}

/** Convenience: lookup a class or throw. */
function getClass(name: string): ClassOptionsData {
  const cls = classOptionsData.find(c => c.name === name);
  if (!cls) throw new Error(`Class not found: ${name}`);
  return cls;
}

/** A minimal seeded LCG so variety tests are reproducible. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return function () {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Deterministic RNG that always returns 0.30 — above the 0.24 tier-drop
 * threshold, so armour tier is never dropped. Use for oracle tests that assert
 * specific armour tiers and must not be sensitive to random variation.
 */
const noTierDrop = () => 0.30;

const ALL_CLASSES = [
  'Fighter', 'Cleric', 'Magic-User', 'Thief', 'Dwarf', 'Elf', 'Halfling',
];
const GOLD_LEVELS = [30, 60, 90, 120, 150, 180];

// ─── Budget Utilisation Tests ────────────────────────────────────────────────

describe('getOptimalEquipmentPack — budget utilisation', () => {
  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('%s at %d gp spends at least 80%% of gold', (cls, gold) => {
    const pack = getOptimalEquipmentPack(getClass(cls), gold);
    const cost = totalCostOf(pack);
    expect(cost).toBeGreaterThanOrEqual(gold * 0.80);
  });

  test.each(
    ALL_CLASSES.flatMap(cls =>
      GOLD_LEVELS.filter(g => g >= 60).map(gold => [cls, gold] as [string, number])
    )
  )('%s at %d gp leaves ≤ 20 gp unspent (hard residual cap)', (cls, gold) => {
    const pack = getOptimalEquipmentPack(getClass(cls), gold);
    const cost = totalCostOf(pack);
    expect(gold - cost).toBeLessThanOrEqual(20);
  });

  test('pack total never exceeds available gold', () => {
    for (const cls of ALL_CLASSES) {
      for (const gold of GOLD_LEVELS) {
        const pack = getOptimalEquipmentPack(getClass(cls), gold);
        expect(totalCostOf(pack)).toBeLessThanOrEqual(gold);
      }
    }
  });
});

// ─── Category Coverage Tests ─────────────────────────────────────────────────

describe('getOptimalEquipmentPack — category coverage', () => {
  /**
   * Core assertion: for every missing mandatory category the cheapest item
   * that fills it must be MORE expensive than the remaining gold.
   */
  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('%s at %d gp: every absent mandatory category must be individually unaffordable', (cls, gold) => {
    const clsData = getClass(cls);
    const pack = getOptimalEquipmentPack(clsData, gold);
    const cost = totalCostOf(pack);
    const remainingGold = gold - cost;
    const missingCosts = missingMandatoryCosts(pack, clsData);

    for (const cheapest of missingCosts) {
      expect(cheapest).toBeGreaterThan(remainingGold);
    }
  });

  test('Magic-User gets a melee weapon at every gold level', () => {
    const mu = getClass('Magic-User');
    for (const gold of GOLD_LEVELS) {
      const pack = getOptimalEquipmentPack(mu, gold);
      expect(hasMeleeWeapon(pack, mu)).toBe(true);
    }
  });

  test('Cleric (BX) gets holy_symbol_silver', () => {
    for (const gold of [60, 80, 120, 180]) {
      const pack = getOptimalEquipmentPack(getClass('Cleric'), gold);
      expect(hasItem(pack, 'holy_symbol_silver')).toBe(true);
    }
  });

  test('Thief gets thieves_tools', () => {
    for (const gold of [60, 90, 120, 180]) {
      const pack = getOptimalEquipmentPack(getClass('Thief'), gold);
      expect(hasItem(pack, 'thieves_tools')).toBe(true);
    }
  });
});

// ─── Weapons Priority Tests ───────────────────────────────────────────────────
//
// When the budget is insufficient for a full kit, having *some* weapon takes
// priority over all other mandatory categories — including class-specific items
// such as holy symbol (Cleric) and thieves' tools (Thief).  The weapon budget
// is reserved BEFORE those class-specific items so that tight-budget characters
// are never left weaponless.

describe('getOptimalEquipmentPack — weapons priority', () => {
  /**
   * Universal: every class at every standard gold level must include a melee
   * weapon.  All classes can use at least one weapon costing ≤ 5 gp, and even
   * at the lowest (30 gp) budget there is enough headroom after setting aside
   * 15 gp for essential gear.
   */
  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('%s at %d gp: pack includes a melee weapon', (cls, gold) => {
    const clsData = getClass(cls);
    const pack = getOptimalEquipmentPack(clsData, gold);
    expect(hasMeleeWeapon(pack, clsData)).toBe(true);
  });

  test('Cleric at 30 gp: has a melee weapon (weapon priority over holy symbol)', () => {
    // Min full kit for Cleric = 41 gp; at 30 gp all mandatory categories cannot
    // be filled.  Weapons priority means the weapon is purchased BEFORE trying
    // to buy the holy symbol, so the character is never weaponless.
    const c = getClass('Cleric');
    const pack = getOptimalEquipmentPack(c, 30);
    expect(hasMeleeWeapon(pack, c)).toBe(true);
  });

  test('Thief at 30 gp: has a melee weapon (weapon priority over thieves tools)', () => {
    // Min full kit for Thief ≈ 39 gp; at 30 gp full coverage is not possible.
    // Weapons priority means a weapon is purchased before thieves' tools.
    const t = getClass('Thief');
    const pack = getOptimalEquipmentPack(t, 30);
    expect(hasMeleeWeapon(pack, t)).toBe(true);
  });
});

// ─── Redundancy / Category-Balance Rules ─────────────────────────────────────

describe('getOptimalEquipmentPack — redundancy rules', () => {
  /**
   * Rule 4: no duplicate item IDs.
   * This must be checked first because duplicate IDs corrupt cost calculations.
   */
  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('Rule 4 — no duplicate item IDs: %s at %d gp', (cls, gold) => {
    const pack = getOptimalEquipmentPack(getClass(cls), gold);
    const ids = pack.map(i => i.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  /**
   * Rule 1: at most one melee weapon.
   * Exception for classes restricted to {dagger, staff}: may hold ≤ 2 ONLY when
   * all mandatory exploration categories are already covered.
   */
  const DAGGER_STAFF_CLASSES = ['Magic-User'];

  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('Rule 1 — at most one melee weapon: %s at %d gp', (cls, gold) => {
    const clsData = getClass(cls);
    const pack = getOptimalEquipmentPack(clsData, gold);
    const meleeCount = countItems(pack, MELEE_WEAPON_IDS);

    if (DAGGER_STAFF_CLASSES.includes(cls) && missingMandatoryCosts(pack, clsData).length === 0) {
      // Relaxed: staff + dagger allowed only when all mandatory gear is covered
      expect(meleeCount).toBeLessThanOrEqual(2);
    } else {
      expect(meleeCount).toBeLessThanOrEqual(1);
    }
  });

  /**
   * Rule 2: at most one ranged weapon type (ammo excluded).
   */
  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('Rule 2 — at most one ranged weapon: %s at %d gp', (cls, gold) => {
    const pack = getOptimalEquipmentPack(getClass(cls), gold);
    const rangedCount = countItems(pack, RANGED_WEAPON_IDS);
    expect(rangedCount).toBeLessThanOrEqual(1);
  });

  /**
   * Rule 3: weapons must not crowd out the five universal mandatory categories.
   * Only light, container, water, rations, and tinder are checked here.
   * Class-specific items (holy symbol, thieves' tools) may legitimately
   * exhaust a low budget before these categories are reached, so they are
   * not included in this rule's missing-category check.
   *
   * Weapons Priority amendment: the first (cheapest) melee weapon in the pack
   * is exempt from this rule — it is the mandatory weapon guaranteed by the
   * "Weapons priority" criterion.  Only REDUNDANT weapon spending beyond that
   * first weapon is required to stay within the cheapest-fix threshold.
   */
  test.each(
    ALL_CLASSES.flatMap(cls => GOLD_LEVELS.map(gold => [cls, gold] as [string, number]))
  )('Rule 3 — weapons must not crowd out mandatory categories: %s at %d gp', (cls, gold) => {
    const pack = getOptimalEquipmentPack(getClass(cls), gold);

    // Only the five universal survival categories
    const missingUniversal: number[] = [];
    if (!hasLightSource(pack))       missingUniversal.push(CHEAPEST.light);
    if (!hasContainer(pack))         missingUniversal.push(CHEAPEST.container);
    if (!hasItem(pack, 'waterskin')) missingUniversal.push(CHEAPEST.water);
    if (!hasAnyItem(pack, ['rations_standard', 'rations_iron'])) missingUniversal.push(CHEAPEST.rations);
    if (!hasItem(pack, 'tinder_box')) missingUniversal.push(CHEAPEST.tinder);

    if (missingUniversal.length === 0) return; // all universal categories covered — rule doesn't fire

    const weaponSpend = pack
      .filter(item => [...MELEE_WEAPON_IDS, ...RANGED_WEAPON_IDS, ...AMMO_IDS].includes(item.id))
      .reduce((sum, item) => sum + (allItems[item.id]?.price as number ?? 0) * item.quantity, 0);

    // Per Weapons Priority: deduct the cheapest melee weapon in the pack so that
    // the mandatory first weapon is never blamed for crowding out survival gear.
    // Only spending on additional (redundant) weapons is checked against the
    // cheapest-fix threshold.
    const cheapestMandatoryMelee = pack
      .filter(i => MELEE_WEAPON_IDS.includes(i.id))
      .reduce((min, i) => Math.min(min, (allItems[i.id]?.price as number ?? 0)), Infinity);
    const redundantWeaponSpend = cheapestMandatoryMelee === Infinity
      ? weaponSpend
      : Math.max(0, weaponSpend - cheapestMandatoryMelee);

    const cheapestFix = Math.min(...missingUniversal);
    expect(redundantWeaponSpend).toBeLessThanOrEqual(cheapestFix);
  });
});

// ─── Scaling Monotonicity Tests ───────────────────────────────────────────────

describe('getOptimalEquipmentPack — scaling monotonicity', () => {
  test.each(ALL_CLASSES)(
    '%s: 120 gp pack costs more than 60 gp pack',
    (cls) => {
      const packLow  = getOptimalEquipmentPack(getClass(cls), 60);
      const packHigh = getOptimalEquipmentPack(getClass(cls), 120);
      expect(totalCostOf(packHigh)).toBeGreaterThan(totalCostOf(packLow));
    }
  );

  test.each(ALL_CLASSES)(
    '%s: 180 gp pack costs more than 120 gp pack',
    (cls) => {
      const packLow  = getOptimalEquipmentPack(getClass(cls), 120);
      const packHigh = getOptimalEquipmentPack(getClass(cls), 180);
      expect(totalCostOf(packHigh)).toBeGreaterThan(totalCostOf(packLow));
    }
  );
});

// ─── Oracle / Reference Kernel Tests ─────────────────────────────────────────

describe('getOptimalEquipmentPack — oracle / reference kernels', () => {
  // Magic-User kernels
  test('Magic-User at 30 gp: melee weapon, container, waterskin, light, rations', () => {
    const mu = getClass('Magic-User');
    const pack = getOptimalEquipmentPack(mu, 30);
    expect(hasMeleeWeapon(pack, mu)).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasLightSource(pack)).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  test('Magic-User at 60 gp: melee weapon, backpack, waterskin, light, tinder, rations', () => {
    const mu = getClass('Magic-User');
    const pack = getOptimalEquipmentPack(mu, 60);
    expect(hasMeleeWeapon(pack, mu)).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasLightSource(pack)).toBe(true);
    expect(hasItem(pack, 'tinder_box')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  test('Magic-User at 60 gp: includes oil_flask or lantern (lighting upgrade)', () => {
    const pack = getOptimalEquipmentPack(getClass('Magic-User'), 60);
    expect(hasAnyItem(pack, ['oil_flask', 'lantern'])).toBe(true);
  });

  // TODO: Find out what the correct assertion is here.  The current implementation is flaky.
  // And if it is flaky, it probably means we should also loop to make sure it
  // is always true, not just sometimes true.
  //
  //test('Magic-User at 90 gp: includes dungeoneering gear (pole or iron spikes)', () => {
  //  const pack = getOptimalEquipmentPack(getClass('Magic-User'), 90);
  //  expect(hasAnyItem(pack, ['pole_10_wooden', 'iron_spikes'])).toBe(true);
  //});

  test('Magic-User at 90 gp: oil_flask or lantern present (lighting upgrade at moderate budget)', () => {
    const pack = getOptimalEquipmentPack(getClass('Magic-User'), 90);
    expect(hasAnyItem(pack, ['oil_flask', 'lantern'])).toBe(true);
  });

  // TODO: Find out what the correct assertion is here.  The current implementation is flaky.
  // And if it is flaky, it probably means we should also loop to make sure it
  // is always true, not just sometimes true.
  //
  //test('Magic-User at ≥ 90 gp: dungeoneering utility — mirror_hand_steel or iron_spikes present', () => {
  //  for (const gold of [90, 120, 150, 180]) {
  //    const pack = getOptimalEquipmentPack(getClass('Magic-User'), gold);
  //    expect(hasAnyItem(pack, ['mirror_hand_steel', 'iron_spikes'])).toBe(true);
  //  }
  //});

  test('Magic-User at 120 gp: lantern and oil_flask present', () => {
    const pack = getOptimalEquipmentPack(getClass('Magic-User'), 120);
    expect(hasItem(pack, 'lantern')).toBe(true);
    expect(hasItem(pack, 'oil_flask')).toBe(true);
  });

  test('Magic-User at 180 gp: full exploration kit (lantern, oil_flask, tinder, rations, container, water)', () => {
    const pack = getOptimalEquipmentPack(getClass('Magic-User'), 180);
    expect(hasItem(pack, 'lantern')).toBe(true);
    expect(hasItem(pack, 'oil_flask')).toBe(true);
    expect(hasItem(pack, 'tinder_box')).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  // Fighter kernels
  test('Fighter at 30 gp: melee weapon, torches, container, waterskin, rations', () => {
    const f = getClass('Fighter');
    const pack = getOptimalEquipmentPack(f, 30);
    expect(hasMeleeWeapon(pack, f)).toBe(true);
    expect(hasLightSource(pack)).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  test('Fighter at 60 gp: leather, melee weapon, light source, container, waterskin, rations', () => {
    const f = getClass('Fighter');
    const pack = getOptimalEquipmentPack(f, 60);
    expect(hasAnyItem(pack, ['leather', 'chainmail', 'plate_mail'])).toBe(true);
    expect(hasMeleeWeapon(pack, f)).toBe(true);
    expect(hasLightSource(pack)).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  test('Fighter at 60 gp: includes iron_spikes or pole', () => {
    // Use noTierDrop seed so weapon/gear choices are deterministic and
    // the expansion phase's shuffled order is reproducible.
    const pack = getOptimalEquipmentPack(getClass('Fighter'), 60, true, noTierDrop);
    expect(hasAnyItem(pack, ['iron_spikes', 'pole_10_wooden'])).toBe(true);
  });

  test('Fighter at 90 gp: chainmail', () => {
    const pack = getOptimalEquipmentPack(getClass('Fighter'), 90, true, noTierDrop);
    expect(hasItem(pack, 'chainmail')).toBe(true);
  });

  test('Fighter at 120 gp: a ranged weapon', () => {
    const pack = getOptimalEquipmentPack(getClass('Fighter'), 120);
    expect(hasAnyItem(pack, RANGED_WEAPON_IDS)).toBe(true);
  });

  test('Fighter at 180 gp: plate_mail, shield, melee weapon, ranged weapon, lantern, oil_flask, container, water, rations', () => {
    const f = getClass('Fighter');
    const pack = getOptimalEquipmentPack(f, 180, true, noTierDrop);
    expect(hasItem(pack, 'plate_mail')).toBe(true);
    expect(hasItem(pack, 'shield')).toBe(true);
    expect(hasMeleeWeapon(pack, f)).toBe(true);
    expect(hasAnyItem(pack, RANGED_WEAPON_IDS)).toBe(true);
    expect(hasItem(pack, 'lantern')).toBe(true);
    expect(hasItem(pack, 'oil_flask')).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  // Cleric kernels
  test('Cleric at 120 gp: plate_mail, melee weapon, holy_symbol_silver, light, container, water, rations', () => {
    const c = getClass('Cleric');
    const pack = getOptimalEquipmentPack(c, 120, true, noTierDrop);
    expect(hasItem(pack, 'plate_mail')).toBe(true);
    expect(hasMeleeWeapon(pack, c)).toBe(true);
    expect(hasItem(pack, 'holy_symbol_silver')).toBe(true);
    expect(hasLightSource(pack)).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });

  test('Cleric at 80 gp: chainmail, weapon, holy_symbol_silver, container, waterskin, tinder_box', () => {
    const c = getClass('Cleric');
    const pack = getOptimalEquipmentPack(c, 80, true, noTierDrop);
    // Weapons priority: chainmail(40) + weapon(5) + holy_symbol(25) + partial essentials(10) = 80 gp.
    // Rations(5 gp) can no longer fit because the weapon purchase takes priority;
    // remaining gold = 0 after tinder_box, so the missing rations category is acceptable.
    expect(hasAnyItem(pack, ['chainmail', 'plate_mail'])).toBe(true);
    expect(hasMeleeWeapon(pack, c)).toBe(true);
    expect(hasItem(pack, 'holy_symbol_silver')).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasItem(pack, 'tinder_box')).toBe(true);
  });

  test('Cleric at 180 gp: plate_mail, shield, blunt weapon, holy_symbol_silver, lantern, oil_flask, container, water, rations', () => {
    const c = getClass('Cleric');
    const pack = getOptimalEquipmentPack(c, 180, true, noTierDrop);
    expect(hasItem(pack, 'plate_mail')).toBe(true);
    expect(hasItem(pack, 'shield')).toBe(true);
    expect(hasMeleeWeapon(pack, c)).toBe(true);
    expect(hasItem(pack, 'holy_symbol_silver')).toBe(true);
    expect(hasItem(pack, 'lantern')).toBe(true);
    expect(hasItem(pack, 'oil_flask')).toBe(true);
    expect(hasContainer(pack)).toBe(true);
    expect(hasItem(pack, 'waterskin')).toBe(true);
    expect(hasAnyItem(pack, ['rations_standard', 'rations_iron'])).toBe(true);
  });
});

// ─── Budget-Scaling Detail Tests ─────────────────────────────────────────────

describe('getOptimalEquipmentPack — budget tier detail', () => {
  test('Magic-User spends at least 80% at every standard gold level', () => {
    const mu = getClass('Magic-User');
    for (const gold of GOLD_LEVELS) {
      const pack = getOptimalEquipmentPack(mu, gold);
      const cost = totalCostOf(pack);
      expect(cost).toBeGreaterThanOrEqual(gold * 0.80);
    }
  });

  test('Magic-User gets no armour regardless of gold', () => {
    const mu = getClass('Magic-User');
    for (const gold of GOLD_LEVELS) {
      const pack = getOptimalEquipmentPack(mu, gold);
      expect(hasAnyItem(pack, ['leather', 'chainmail', 'plate_mail'])).toBe(false);
    }
  });

  test('Cleric includes dungeoneering gear at ≥ 90 gp', () => {
    // Weapons priority shifts some budget from expansion to the weapon purchase
    // at tight levels, but enough budget remains for cheap dungeoneering items.
    // noTierDrop ensures a deterministic expansion-list shuffle so this test
    // is stable across runs.
    const c = getClass('Cleric');
    for (const gold of [90, 120, 150, 180]) {
      const pack = getOptimalEquipmentPack(c, gold, true, noTierDrop);
      expect(hasAnyItem(pack, ['iron_spikes', 'pole_10_wooden', 'mirror_hand_steel', 'rope_50'])).toBe(true);
    }
  });
});

// ─── Variety / Randomisation Tests ───────────────────────────────────────────
//
// These tests call getOptimalEquipmentPack with an injectable random source so
// the distribution is repeatable.  The function must accept an optional fourth
// parameter: `random?: () => number`.
//
// All correctness invariants must hold for every pack in the variety set,
// *then* distribution assertions are checked.

/** Produce N packs for the same (class, gold) with distinct seeds. */
function varietyPacks(
  cls: ClassOptionsData,
  gold: number,
  n = 20,
): Array<{ id: string; quantity: number }>[] {
  return Array.from({ length: n }, (_, i) =>
    getOptimalEquipmentPack(cls, gold, true, seededRandom(i + 1))
  );
}

describe('getOptimalEquipmentPack — variety / randomisation', () => {
  const PRIORITY_PAIRS: [string, number][] = [
    ['Magic-User', 120],
    ['Fighter', 90],
    ['Fighter', 180],
    ['Cleric', 120],
  ];

  test('all packs in variety set satisfy correctness invariants', () => {
    for (const [cls, gold] of PRIORITY_PAIRS) {
      const clsData = getClass(cls);
      for (const pack of varietyPacks(clsData, gold)) {
        const cost = totalCostOf(pack);
        // never overspend
        expect(cost).toBeLessThanOrEqual(gold);
        // spend ≥ 80%
        expect(cost).toBeGreaterThanOrEqual(gold * 0.80);
        // no duplicate IDs
        const ids = pack.map(i => i.id);
        expect(ids.length).toBe(new Set(ids).size);
        // at most 1 ranged
        expect(countItems(pack, RANGED_WEAPON_IDS)).toBeLessThanOrEqual(1);
      }
    }
  });

  test('weapon choice varies across 20 runs — Fighter at 60 gp', () => {
    const packs = varietyPacks(getClass('Fighter'), 60);
    const meleeWeapons = packs
      .map(p => p.find(i => MELEE_WEAPON_IDS.includes(i.id))?.id)
      .filter(Boolean);
    const distinctWeapons = new Set(meleeWeapons);
    expect(distinctWeapons.size).toBeGreaterThanOrEqual(2);
  });

  test('weapon choice varies across 20 runs — Fighter at 120 gp', () => {
    const packs = varietyPacks(getClass('Fighter'), 120);
    const meleeWeapons = packs
      .map(p => p.find(i => MELEE_WEAPON_IDS.includes(i.id))?.id)
      .filter(Boolean);
    const distinctWeapons = new Set(meleeWeapons);
    expect(distinctWeapons.size).toBeGreaterThanOrEqual(2);
  });

  test('armour tier varies across 20 runs — Fighter at 180 gp', () => {
    const packs = varietyPacks(getClass('Fighter'), 180);
    const armours = packs
      .map(p => p.find(i => ['plate_mail', 'chainmail', 'leather'].includes(i.id))?.id)
      .filter(Boolean);
    // Both plate and chainmail should appear across 20 runs
    expect(armours).toContain('plate_mail');
    expect(armours).toContain('chainmail');
  });

  test('armour tier varies across 20 runs — Fighter at 120 gp', () => {
    const packs = varietyPacks(getClass('Fighter'), 120);
    const armours = packs
      .map(p => p.find(i => ['plate_mail', 'chainmail', 'leather'].includes(i.id))?.id)
      .filter(Boolean);
    expect(armours).toContain('plate_mail');
    expect(armours).toContain('chainmail');
  });

  test('expansion gear varies across 20 runs — Magic-User at 120 gp', () => {
    const packs = varietyPacks(getClass('Magic-User'), 120);
    // Items beyond the mandatory set
    const mandatoryIds = new Set([
      'staff', 'dagger', 'backpack', 'waterskin', 'torches',
      'rations_standard', 'rations_iron', 'tinder_box',
    ]);
    const expansionItems = packs.flatMap(p =>
      p.filter(i => !mandatoryIds.has(i.id)).map(i => i.id)
    );
    const distinctExpansion = new Set(expansionItems);
    expect(distinctExpansion.size).toBeGreaterThanOrEqual(3);
  });

  test('weapon choice varies across 20 runs — Cleric at 90 gp', () => {
    // At 60 gp: leather(20) + holy_symbol_silver(25) + essentials(15) = 60 gp exactly;
    // weaponBudget=0 so no weapon is purchased. 90 gp is the minimum with weapon budget.
    const packs = varietyPacks(getClass('Cleric'), 90);
    const meleeWeapons = packs
      .map(p => p.find(i => MELEE_WEAPON_IDS.includes(i.id))?.id)
      .filter(Boolean);
    const distinctWeapons = new Set(meleeWeapons);
    // Cleric eligible weapons at 90 gp: warhammer, mace
    expect(distinctWeapons.size).toBeGreaterThanOrEqual(2);
  });

  test('weapon choice varies across 20 runs — Thief at 90 gp', () => {
    // At 60 gp: leather(20) + thieves_tools(25) + essentials(15) = 60 gp exactly;
    // weaponBudget=0 so no weapon is purchased. 90 gp is the minimum with weapon budget.
    const packs = varietyPacks(getClass('Thief'), 90);
    const meleeWeapons = packs
      .map(p => p.find(i => MELEE_WEAPON_IDS.includes(i.id))?.id)
      .filter(Boolean);
    const distinctWeapons = new Set(meleeWeapons);
    // Thief eligible weapons at 90 gp: sword, short_sword, hand_axe, dagger
    expect(distinctWeapons.size).toBeGreaterThanOrEqual(2);
  });

  test('armour tier varies across 20 runs — Cleric at 120 gp', () => {
    const packs = varietyPacks(getClass('Cleric'), 120);
    const armours = packs
      .map(p => p.find(i => ['plate_mail', 'chainmail', 'leather'].includes(i.id))?.id)
      .filter(Boolean);
    // Both plate_mail and chainmail should appear across 20 seeded runs
    expect(armours).toContain('plate_mail');
    expect(armours).toContain('chainmail');
  });

  test('armour tier varies across 20 runs — Cleric at 80 gp', () => {
    const packs = varietyPacks(getClass('Cleric'), 80);
    const armours = packs
      .map(p => p.find(i => ['plate_mail', 'chainmail', 'leather'].includes(i.id))?.id)
      .filter(Boolean);
    // Both chainmail and leather should appear across 20 seeded runs
    expect(armours).toContain('chainmail');
    expect(armours).toContain('leather');
  });
});
