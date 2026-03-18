/**
 * Level progression tables for all OSE character classes.
 *
 * Basic B/X classes (Fighter, Cleric, Magic-User, Thief, Dwarf, Elf,
 * Halfling) are encoded verbatim from the OSE System Reference Document.
 *
 * Advanced Fantasy and Carcass Crawler classes are DERIVED from the nearest
 * archetype (fighter, cleric, magic-user, thief, dwarf, elf, or halfling)
 * because those supplements are not part of the freely available SRD.
 * The XP thresholds are scaled by the ratio of each class's published
 * nextLevel (XP to reach level 2) against the archetype's level-2 XP.
 *
 * Spell slots are derived similarly:
 *  - divine / druidSpells → Cleric progression
 *  - arcaneSpells / illusionistSpells / necromancerSpells → Magic-User progression
 *  - runesmithSpells → Magic-User progression (approximation)
 *  - arcane/divine without a specific spell type flag → no slots
 *    (covers Paladin, Ranger, Half-Elf whose supplement rules are not in the SRD)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * A named table of spell slot counts, shared across all classes that follow
 * the same progression pattern (e.g. all clerics, all magic-users).
 */
export interface SpellSlotTable {
  /** Unique identifier (e.g. 'cleric', 'magic-user', 'elf'). */
  id: string;
  /** Human-readable name. */
  name: string;
  /**
   * slots[levelIndex] = slot counts per spell level (index 0 = 1st-level spells).
   * Length of outer array = number of class levels this table covers.
   */
  slots: number[][];
}

export interface LevelEntry {
  /** 1-based level number. */
  level: number;
  /** XP required to reach this level. */
  xp: number;
  /**
   * Number of hit dice at this level. Stops increasing at the "cap" level
   * (typically level 9); above the cap this equals the maximum dice count
   * and hdBonus increases instead.
   */
  hdDice: number;
  /**
   * Fixed HP bonus added above the hit-dice cap (0 at and below the cap).
   * Increases by a class-specific amount per level beyond the cap
   * (e.g. +2/level for Fighter, +1/level for Cleric and Magic-User,
   * +3/level for Dwarf).
   */
  hdBonus: number;
  /** THAC0 at this level (lower is better; 19 = attack bonus 0). */
  thac0: number;
  /** Saving throw targets: [Death/Poison, Wands, Paralysis/Petrify, Breath, Spells]. */
  saves: [number, number, number, number, number];
}

export interface ClassProgression {
  /** All level entries, one per level from 1 to maxLevel. */
  levels: LevelEntry[];
  /**
   * ID of the spell slot table used by this class.
   * Undefined for non-spellcasting classes.
   */
  spellSlotTableId?: string;
}

// ── Helper: build level-entry arrays ─────────────────────────────────────────

type SaveTuple = [number, number, number, number, number];

export function buildLevels(
  entries: Array<{
    level: number;
    xp: number;
    hdDice: number;
    hdBonus: number;
    thac0: number;
    saves: SaveTuple;
  }>
): LevelEntry[] {
  return entries.map(e => ({
    level: e.level,
    xp: e.xp,
    hdDice: e.hdDice,
    hdBonus: e.hdBonus,
    thac0: e.thac0,
    saves: e.saves,
  }));
}

// ── Basic Classes (verbatim from OSE SRD) ────────────────────────────────────

export const fighter: ClassProgression = {
  levels: buildLevels([
    { level:  1, xp:       0, hdDice: 1, hdBonus:  0, thac0: 19, saves: [12,13,14,15,16] },
    { level:  2, xp:    2000, hdDice: 2, hdBonus:  0, thac0: 19, saves: [12,13,14,15,16] },
    { level:  3, xp:    4000, hdDice: 3, hdBonus:  0, thac0: 19, saves: [12,13,14,15,16] },
    { level:  4, xp:    8000, hdDice: 4, hdBonus:  0, thac0: 17, saves: [10,11,12,13,14] },
    { level:  5, xp:   16000, hdDice: 5, hdBonus:  0, thac0: 17, saves: [10,11,12,13,14] },
    { level:  6, xp:   32000, hdDice: 6, hdBonus:  0, thac0: 17, saves: [10,11,12,13,14] },
    { level:  7, xp:   64000, hdDice: 7, hdBonus:  0, thac0: 14, saves: [ 8, 9,10,10,12] },
    { level:  8, xp:  120000, hdDice: 8, hdBonus:  0, thac0: 14, saves: [ 8, 9,10,10,12] },
    { level:  9, xp:  240000, hdDice: 9, hdBonus:  0, thac0: 14, saves: [ 8, 9,10,10,12] },
    { level: 10, xp:  360000, hdDice: 9, hdBonus:  2, thac0: 12, saves: [ 6, 7, 8, 8,10] },
    { level: 11, xp:  480000, hdDice: 9, hdBonus:  4, thac0: 12, saves: [ 6, 7, 8, 8,10] },
    { level: 12, xp:  600000, hdDice: 9, hdBonus:  6, thac0: 12, saves: [ 6, 7, 8, 8,10] },
    { level: 13, xp:  720000, hdDice: 9, hdBonus:  8, thac0: 10, saves: [ 4, 5, 6, 5, 8] },
    { level: 14, xp:  840000, hdDice: 9, hdBonus: 10, thac0: 10, saves: [ 4, 5, 6, 5, 8] },
  ]),
};

export const cleric: ClassProgression = {
  levels: buildLevels([
    { level:  1, xp:       0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [11,12,14,16,15] },
    { level:  2, xp:    1500, hdDice: 2, hdBonus: 0, thac0: 19, saves: [11,12,14,16,15] },
    { level:  3, xp:    3000, hdDice: 3, hdBonus: 0, thac0: 19, saves: [11,12,14,16,15] },
    { level:  4, xp:    6000, hdDice: 4, hdBonus: 0, thac0: 19, saves: [11,12,14,16,15] },
    { level:  5, xp:   12000, hdDice: 5, hdBonus: 0, thac0: 17, saves: [ 9,10,12,14,12] },
    { level:  6, xp:   25000, hdDice: 6, hdBonus: 0, thac0: 17, saves: [ 9,10,12,14,12] },
    { level:  7, xp:   50000, hdDice: 7, hdBonus: 0, thac0: 17, saves: [ 9,10,12,14,12] },
    { level:  8, xp:  100000, hdDice: 8, hdBonus: 0, thac0: 17, saves: [ 9,10,12,14,12] },
    { level:  9, xp:  200000, hdDice: 9, hdBonus: 0, thac0: 14, saves: [ 6, 7, 9,11, 9] },
    { level: 10, xp:  300000, hdDice: 9, hdBonus: 1, thac0: 14, saves: [ 6, 7, 9,11, 9] },
    { level: 11, xp:  400000, hdDice: 9, hdBonus: 2, thac0: 14, saves: [ 6, 7, 9,11, 9] },
    { level: 12, xp:  500000, hdDice: 9, hdBonus: 3, thac0: 14, saves: [ 6, 7, 9,11, 9] },
    { level: 13, xp:  600000, hdDice: 9, hdBonus: 4, thac0: 12, saves: [ 3, 5, 7, 8, 7] },
    { level: 14, xp:  700000, hdDice: 9, hdBonus: 5, thac0: 12, saves: [ 3, 5, 7, 8, 7] },
  ]),
  spellSlotTableId: 'cleric',
};

export const magicUser: ClassProgression = {
  levels: buildLevels([
    { level:  1, xp:        0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  2, xp:     2500, hdDice: 2, hdBonus: 0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  3, xp:     5000, hdDice: 3, hdBonus: 0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  4, xp:    10000, hdDice: 4, hdBonus: 0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  5, xp:    20000, hdDice: 5, hdBonus: 0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  6, xp:    40000, hdDice: 6, hdBonus: 0, thac0: 17, saves: [11,12,11,14,12] },
    { level:  7, xp:    80000, hdDice: 7, hdBonus: 0, thac0: 17, saves: [11,12,11,14,12] },
    { level:  8, xp:   150000, hdDice: 8, hdBonus: 0, thac0: 17, saves: [11,12,11,14,12] },
    { level:  9, xp:   300000, hdDice: 9, hdBonus: 0, thac0: 17, saves: [11,12,11,14,12] },
    { level: 10, xp:   450000, hdDice: 9, hdBonus: 1, thac0: 17, saves: [11,12,11,14,12] },
    { level: 11, xp:   600000, hdDice: 9, hdBonus: 2, thac0: 14, saves: [ 8, 9, 8,11, 8] },
    { level: 12, xp:   750000, hdDice: 9, hdBonus: 3, thac0: 14, saves: [ 8, 9, 8,11, 8] },
    { level: 13, xp:   900000, hdDice: 9, hdBonus: 4, thac0: 14, saves: [ 8, 9, 8,11, 8] },
    { level: 14, xp:  1050000, hdDice: 9, hdBonus: 5, thac0: 14, saves: [ 8, 9, 8,11, 8] },
  ]),
  spellSlotTableId: 'magic-user',
};

export const thief: ClassProgression = {
  levels: buildLevels([
    { level:  1, xp:       0, hdDice: 1, hdBonus:  0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  2, xp:    1200, hdDice: 2, hdBonus:  0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  3, xp:    2400, hdDice: 3, hdBonus:  0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  4, xp:    4800, hdDice: 4, hdBonus:  0, thac0: 19, saves: [13,14,13,16,15] },
    { level:  5, xp:    9600, hdDice: 5, hdBonus:  0, thac0: 17, saves: [12,13,11,14,13] },
    { level:  6, xp:   20000, hdDice: 6, hdBonus:  0, thac0: 17, saves: [12,13,11,14,13] },
    { level:  7, xp:   40000, hdDice: 7, hdBonus:  0, thac0: 17, saves: [12,13,11,14,13] },
    { level:  8, xp:   80000, hdDice: 8, hdBonus:  0, thac0: 17, saves: [12,13,11,14,13] },
    { level:  9, xp:  160000, hdDice: 9, hdBonus:  0, thac0: 14, saves: [10,11, 9,12,10] },
    { level: 10, xp:  280000, hdDice: 9, hdBonus:  2, thac0: 14, saves: [10,11, 9,12,10] },
    { level: 11, xp:  400000, hdDice: 9, hdBonus:  4, thac0: 14, saves: [10,11, 9,12,10] },
    { level: 12, xp:  520000, hdDice: 9, hdBonus:  6, thac0: 14, saves: [10,11, 9,12,10] },
    { level: 13, xp:  640000, hdDice: 9, hdBonus:  8, thac0: 12, saves: [ 8, 9, 7,10, 8] },
    { level: 14, xp:  760000, hdDice: 9, hdBonus: 10, thac0: 12, saves: [ 8, 9, 7,10, 8] },
  ]),
};

export const dwarf: ClassProgression = {
  levels: buildLevels([
    { level:  1, xp:       0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [ 8, 9,10,13,12] },
    { level:  2, xp:    2200, hdDice: 2, hdBonus: 0, thac0: 19, saves: [ 8, 9,10,13,12] },
    { level:  3, xp:    4400, hdDice: 3, hdBonus: 0, thac0: 19, saves: [ 8, 9,10,13,12] },
    { level:  4, xp:    8800, hdDice: 4, hdBonus: 0, thac0: 17, saves: [ 6, 7, 8,10,10] },
    { level:  5, xp:   17000, hdDice: 5, hdBonus: 0, thac0: 17, saves: [ 6, 7, 8,10,10] },
    { level:  6, xp:   35000, hdDice: 6, hdBonus: 0, thac0: 17, saves: [ 6, 7, 8,10,10] },
    { level:  7, xp:   70000, hdDice: 7, hdBonus: 0, thac0: 14, saves: [ 4, 5, 6, 7, 8] },
    { level:  8, xp:  140000, hdDice: 8, hdBonus: 0, thac0: 14, saves: [ 4, 5, 6, 7, 8] },
    { level:  9, xp:  270000, hdDice: 9, hdBonus: 0, thac0: 14, saves: [ 4, 5, 6, 7, 8] },
    { level: 10, xp:  400000, hdDice: 9, hdBonus: 3, thac0: 12, saves: [ 2, 3, 4, 4, 6] },
    { level: 11, xp:  530000, hdDice: 9, hdBonus: 6, thac0: 12, saves: [ 2, 3, 4, 4, 6] },
    { level: 12, xp:  660000, hdDice: 9, hdBonus: 9, thac0: 12, saves: [ 2, 3, 4, 4, 6] },
  ]),
};

export const elf: ClassProgression = {
  levels: buildLevels([
    { level:  1, xp:       0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [12,13,13,15,15] },
    { level:  2, xp:    4000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [12,13,13,15,15] },
    { level:  3, xp:    8000, hdDice: 3, hdBonus: 0, thac0: 19, saves: [12,13,13,15,15] },
    { level:  4, xp:   16000, hdDice: 4, hdBonus: 0, thac0: 17, saves: [10,11,11,13,12] },
    { level:  5, xp:   32000, hdDice: 5, hdBonus: 0, thac0: 17, saves: [10,11,11,13,12] },
    { level:  6, xp:   64000, hdDice: 6, hdBonus: 0, thac0: 17, saves: [10,11,11,13,12] },
    { level:  7, xp:  120000, hdDice: 7, hdBonus: 0, thac0: 14, saves: [ 8, 9, 9,10,10] },
    { level:  8, xp:  250000, hdDice: 8, hdBonus: 0, thac0: 14, saves: [ 8, 9, 9,10,10] },
    { level:  9, xp:  400000, hdDice: 9, hdBonus: 0, thac0: 14, saves: [ 8, 9, 9,10,10] },
    { level: 10, xp:  600000, hdDice: 9, hdBonus: 2, thac0: 12, saves: [ 6, 7, 8, 8, 8] },
  ]),
  spellSlotTableId: 'elf',
};

export const halfling: ClassProgression = {
  levels: buildLevels([
    { level: 1, xp:      0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [ 8, 9,10,13,12] },
    { level: 2, xp:   2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [ 8, 9,10,13,12] },
    { level: 3, xp:   4000, hdDice: 3, hdBonus: 0, thac0: 19, saves: [ 8, 9,10,13,12] },
    { level: 4, xp:   8000, hdDice: 4, hdBonus: 0, thac0: 17, saves: [ 6, 7, 8,10,10] },
    { level: 5, xp:  16000, hdDice: 5, hdBonus: 0, thac0: 17, saves: [ 6, 7, 8,10,10] },
    { level: 6, xp:  32000, hdDice: 6, hdBonus: 0, thac0: 17, saves: [ 6, 7, 8,10,10] },
    { level: 7, xp:  64000, hdDice: 7, hdBonus: 0, thac0: 14, saves: [ 4, 5, 6, 7, 8] },
    { level: 8, xp: 120000, hdDice: 8, hdBonus: 0, thac0: 14, saves: [ 4, 5, 6, 7, 8] },
  ]),
};

// ── Archetype builders ────────────────────────────────────────────────────────
//
// Generate a ClassProgression by scaling an archetype's XP values and
// applying the same saves/thac0/spellSlots pattern, capped at maxLevel.


/**
 * Build a derived ClassProgression from archetype data.
 * Uses the full source archetype level entries up to maxLevel.
 * If nextLevelXp differs from archetype's level-2 XP, scales all XP values.
 * Pass spellSlotTableId to assign a spell slot table to the result;
 * spell slots are NOT inherited from the archetype automatically.
 */
export function deriveFromArchetype(
  archetype: ClassProgression,
  maxLevel: number,
  nextLevelXp: number,
  spellSlotTableId?: string,
): ClassProgression {
  const archetypeL2Xp = archetype.levels[1]?.xp ?? nextLevelXp;
  const ratio = nextLevelXp / archetypeL2Xp;

  const levels: LevelEntry[] = [];
  for (let i = 0; i < maxLevel; i++) {
    const sourceIdx = Math.min(i, archetype.levels.length - 1);
    const src = archetype.levels[sourceIdx];
    const xp = i === 0 ? 0 : Math.round(archetype.levels[sourceIdx].xp * ratio / 500) * 500;

    levels.push({
      level: i + 1,
      xp,
      hdDice: src.hdDice,
      hdBonus: src.hdBonus,
      thac0: src.thac0,
      saves: src.saves,
    });
  }
  return {
    levels,
    ...(spellSlotTableId !== undefined ? { spellSlotTableId } : {}),
  };
}

// ── Canonical spell slot tables ───────────────────────────────────────────────

export const DEFAULT_SPELL_SLOT_TABLES: SpellSlotTable[] = [
  {
    id: 'cleric',
    name: 'Cleric',
    slots: [
      [0,0,0,0,0],   // level 1
      [1,0,0,0,0],   // level 2
      [2,0,0,0,0],   // level 3
      [2,1,0,0,0],   // level 4
      [2,2,0,0,0],   // level 5
      [2,2,1,1,0],   // level 6
      [2,2,2,1,1],   // level 7
      [3,3,2,2,1],   // level 8
      [3,3,3,2,2],   // level 9
      [4,4,3,3,2],   // level 10
      [4,4,4,3,3],   // level 11
      [5,5,4,4,3],   // level 12
      [5,5,5,4,4],   // level 13
      [6,5,5,5,4],   // level 14
    ],
  },
  {
    id: 'magic-user',
    name: 'Magic-User',
    slots: [
      [1,0,0,0,0,0],  // level 1
      [2,0,0,0,0,0],  // level 2
      [2,1,0,0,0,0],  // level 3
      [2,2,0,0,0,0],  // level 4
      [2,2,1,0,0,0],  // level 5
      [2,2,2,0,0,0],  // level 6
      [3,2,2,1,0,0],  // level 7
      [3,3,2,2,0,0],  // level 8
      [3,3,3,2,1,0],  // level 9
      [3,3,3,3,2,0],  // level 10
      [4,3,3,3,2,1],  // level 11
      [4,4,3,3,3,2],  // level 12
      [4,4,4,3,3,3],  // level 13
      [4,4,4,4,3,3],  // level 14
    ],
  },
  {
    id: 'elf',
    name: 'Elf',
    slots: [
      [1,0,0,0,0],  // level 1
      [2,0,0,0,0],  // level 2
      [2,1,0,0,0],  // level 3
      [2,2,0,0,0],  // level 4
      [2,2,1,0,0],  // level 5
      [2,2,2,0,0],  // level 6
      [3,2,2,1,0],  // level 7
      [3,3,2,2,0],  // level 8
      [3,3,3,2,1],  // level 9
      [3,3,3,3,2],  // level 10
    ],
  },
];
