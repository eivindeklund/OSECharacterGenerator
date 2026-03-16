import { describe, expect, it } from 'vitest';
import classOptionsData from '../data/classOptionsData';
import {
    magicUserSpellsByLevel
} from '../data/spells';
import {
    getAvailableSpellsAtTier,
    getSpellsByLevelForClass,
    getSpellTierGained,
    getSpellTiersGained,
} from './levelUpSpellUtils';

const mu = classOptionsData.find((c) => c.name === 'Magic-User')!;
const fighter = classOptionsData.find((c) => c.name === 'Fighter')!;
const illusionist = classOptionsData.find((c) => c.name === 'Illusionist');
const druid = classOptionsData.find((c) => c.name === 'Druid');

describe('getSpellsByLevelForClass', () => {
  it('returns the Magic-User spell table with 6 tiers', () => {
    const table = getSpellsByLevelForClass(mu);
    expect(table.length).toBe(6);
    expect(table[0].map((s) => s.name)).toContain('Magic Missile');
    expect(table[1].map((s) => s.name)).toContain('Invisibility');
    expect(table[2].map((s) => s.name)).toContain('Fire Ball');
  });

  it('returns an empty array for a Fighter', () => {
    expect(getSpellsByLevelForClass(fighter)).toEqual([]);
  });
});

// Magic-User spell slot progression (from rules):
//   L1: [1,0,0,0,0,0]   L2: [2,0,0,0,0,0]   L3: [2,1,0,0,0,0]
//   L4: [2,2,0,0,0,0]   L5: [2,2,1,0,0,0]

describe('getSpellTierGained', () => {
  it('Bug fix: MU L1→L2 gains an extra tier-0 slot — returns 0 (was: -1 / 0 meaning no pick)', () => {
    // L1 slots: [1,0,0,0,0,0] → L2 slots: [2,0,0,0,0,0]
    // tier 0 slot count goes from 1 to 2 → must return 0
    expect(getSpellTierGained(mu, 1, 2)).toBe(0);
  });

  it('Bug fix: MU L2→L3 newly unlocks tier-1 (L2 spells) → returns 1', () => {
    // L2 slots: [2,0,0,0,0,0] → L3 slots: [2,1,0,0,0,0]
    expect(getSpellTierGained(mu, 2, 3)).toBe(1);
  });

  it('MU L3→L4 gains an extra tier-1 slot → returns 1', () => {
    // L3 slots: [2,1,0,0,0,0] → L4 slots: [2,2,0,0,0,0]
    expect(getSpellTierGained(mu, 3, 4)).toBe(1);
  });

  it('MU L4→L5 newly unlocks tier-2 (L3 spells) → returns 2', () => {
    // L4 slots: [2,2,0,0,0,0] → L5 slots: [2,2,1,0,0,0]
    expect(getSpellTierGained(mu, 4, 5)).toBe(2);
  });

  it('Fighter L1→L2 returns -1 (no spell slots ever)', () => {
    expect(getSpellTierGained(fighter, 1, 2)).toBe(-1);
  });

  it('returns the HIGHEST gained tier when multiple tiers increase in one level-up', () => {
    // Level-ups of ≥2 levels could cause multiple tiers to increase at once.
    // The function should return the highest tier that gained slots.
    // Manually test MU L1→L3: tier 0 gains (1→2) and tier 1 unlocks (0→1) → returns 1
    expect(getSpellTierGained(mu, 1, 3)).toBe(1);
  });
});

describe('getAvailableSpellsAtTier', () => {
  it('returns L1 MU spells (tier 0) when no spells are known', () => {
    const available = getAvailableSpellsAtTier(mu, 0, []);
    expect(available).toEqual([...magicUserSpellsByLevel[0]]);
    expect(available.map((s) => s.name)).toContain('Sleep');
  });

  it('returns L2 MU spells (tier 1) when no spells are known', () => {
    const available = getAvailableSpellsAtTier(mu, 1, []);
    expect(available).toEqual([...magicUserSpellsByLevel[1]]);
    expect(available.map((s) => s.name)).toContain('Invisibility');
    expect(available.map((s) => s.name)).not.toContain('Sleep'); // L1 spell must not appear
  });

  it('excludes already-known spells from the results', () => {
    const available = getAvailableSpellsAtTier(mu, 0, ['Sleep', 'Magic Missile']);
    expect(available.map((s) => s.name)).not.toContain('Sleep');
    expect(available.map((s) => s.name)).not.toContain('Magic Missile');
    expect(available.map((s) => s.name)).toContain('Charm Person');
  });

  it('returns empty array for a non-caster class', () => {
    expect(getAvailableSpellsAtTier(fighter, 0, [])).toEqual([]);
  });

  it('falls back to the last available tier when spellTier is out of range', () => {
    // Only 6 tiers for MU. Asking for tier 10 → falls back to tier 5 (last).
    const available = getAvailableSpellsAtTier(mu, 10, []);
    expect(available).toEqual([...magicUserSpellsByLevel[5]]);
  });
});

// ---------------------------------------------------------------------------
// getSpellTiersGained — returns ALL tiers that gained slots (not just highest)
// ---------------------------------------------------------------------------
describe('getSpellTiersGained', () => {
  it('Bug fix: MU L6→L7 gains tier 0 (L1) AND tier 3 (L4) — returns [0, 3]', () => {
    // L6 slots: [2,2,2,0,0,0] → L7 slots: [3,2,2,1,0,0]
    // tier 0: 2→3, tier 3: 0→1 — both increase
    expect(getSpellTiersGained(mu, 6, 7)).toEqual([0, 3]);
  });

  it('MU L1→L2 gains only tier 0 → returns [0]', () => {
    expect(getSpellTiersGained(mu, 1, 2)).toEqual([0]);
  });

  it('MU L2→L3 gains only tier 1 → returns [1]', () => {
    expect(getSpellTiersGained(mu, 2, 3)).toEqual([1]);
  });

  it('Fighter L1→L2 has no spell slots → returns []', () => {
    expect(getSpellTiersGained(fighter, 1, 2)).toEqual([]);
  });

  it('MU L3→L4 gains only tier 1 → returns [1]', () => {
    expect(getSpellTiersGained(mu, 3, 4)).toEqual([1]);
  });
});

// Regression: L2→L3 should show L2 spell list (fix for reported bug)
describe('Bug regression: L2→L3 spell selection shows L2 spells', () => {
  it('getSpellTierGained returns 1 (tier-1 = L2 spells) for MU L2→L3', () => {
    const tier = getSpellTierGained(mu, 2, 3);
    expect(tier).toBe(1);
  });

  it('getAvailableSpellsAtTier with tier 1 returns L2 spells (not L1 spells)', () => {
    const available = getAvailableSpellsAtTier(mu, 1, ['Sleep']); // 'Sleep' is L1, irrelevant
    expect(available.map((s) => s.name)).toContain('Invisibility'); // L2 spell
    expect(available.map((s) => s.name)).not.toContain('Sleep');    // L1 spell must not appear
    expect(available.map((s) => s.name)).not.toContain('Magic Missile'); // L1 spell must not appear
  });
});
