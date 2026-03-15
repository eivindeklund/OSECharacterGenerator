import {
  druidSpellsByLevel,
  illusionistSpellsByLevel,
  magicUserSpellsByLevel,
  necromancerSpellsByLevel,
  runesmithSpellsByLevel,
} from '../data/spells';
import type { ClassOptionsData } from '../types';

/**
 * Returns the spell-level progression table for the given class.
 * Index 0 = 1st-level spells, index 1 = 2nd-level spells, etc.
 *
 * Returns an empty array for non-arcane-caster classes.
 */
export function getSpellsByLevelForClass(
  cls: ClassOptionsData,
): readonly (readonly string[])[] {
  if (cls.illusionistSpells) return illusionistSpellsByLevel;
  if (cls.necromancerSpells) return necromancerSpellsByLevel;
  if (cls.runesmithSpells)   return runesmithSpellsByLevel;
  if (cls.druidSpells)       return druidSpellsByLevel;
  if (cls.arcaneSpells)      return magicUserSpellsByLevel;
  return [];
}

/**
 * Returns every (0-indexed) spell tier whose slot count increased when going
 * from `fromCharLevel` to `toCharLevel`, in ascending tier order.
 * Returns an empty array for non-casters or when no tier increased.
 *
 * Some level-ups advance two tiers at once (e.g. Magic-User L6→L7 gains a
 * new 1st-level slot AND unlocks 4th-level spells). Callers should prompt the
 * player once for each entry in the returned array.
 */
export function getSpellTiersGained(
  cls: ClassOptionsData,
  fromCharLevel: number,
  toCharLevel: number,
): number[] {
  const prevSlots = cls.getSpellSlotsAtLevel(fromCharLevel);
  const nextSlots = cls.getSpellSlotsAtLevel(toCharLevel);
  if (nextSlots.length === 0) return [];

  const tiersGained: number[] = [];
  const len = Math.max(prevSlots.length, nextSlots.length);
  for (let i = 0; i < len; i++) {
    const prev = prevSlots[i] ?? 0;
    const next = nextSlots[i] ?? 0;
    if (next > prev) {
      tiersGained.push(i);
    }
  }
  return tiersGained;
}

/**
 * Returns the (0-indexed) spell tier whose slot count increased when going
 * from `fromCharLevel` to `toCharLevel`, or -1 if no such tier exists.
 *
 * Uses the highest tier with a slot-count increase — which, for all standard
 * OSE progressions, is always a unique tier per level-up.
 *
 * "Slot count increased" means the new slot value at that tier is strictly
 * greater than the old value — this catches both:
 *   • a brand-new tier being unlocked (0 → 1)
 *   • an extra slot added to an already-unlocked tier (1 → 2, 2 → 3, …)
 */
export function getSpellTierGained(
  cls: ClassOptionsData,
  fromCharLevel: number,
  toCharLevel: number,
): number {
  const prevSlots = cls.getSpellSlotsAtLevel(fromCharLevel);
  const nextSlots = cls.getSpellSlotsAtLevel(toCharLevel);
  if (nextSlots.length === 0) return -1;

  let highestGained = -1;
  const len = Math.max(prevSlots.length, nextSlots.length);
  for (let i = 0; i < len; i++) {
    const prev = prevSlots[i] ?? 0;
    const next = nextSlots[i] ?? 0;
    if (next > prev) {
      highestGained = i;
    }
  }
  return highestGained;
}

/**
 * Returns the spells available at a given tier (0-indexed) for the class,
 * excluding any already known by the character.
 */
export function getAvailableSpellsAtTier(
  cls: ClassOptionsData,
  spellTier: number,
  knownSpells: readonly string[],
): string[] {
  const byLevel = getSpellsByLevelForClass(cls);
  // If the tier doesn't exist in our data yet, fall back to the last known tier
  const safeIdx = Math.min(spellTier, byLevel.length - 1);
  if (safeIdx < 0) return [];
  return byLevel[safeIdx].filter((s) => !knownSpells.includes(s));
}
