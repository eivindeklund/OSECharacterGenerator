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

function buildLevels(
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

const fighter: ClassProgression = {
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

const cleric: ClassProgression = {
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

const magicUser: ClassProgression = {
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

const thief: ClassProgression = {
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

const dwarf: ClassProgression = {
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

const elf: ClassProgression = {
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

const halfling: ClassProgression = {
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

/** XP progression lists for each archetype (level-2 XP first, index 0 = level 2). */
const archetypeXp = {
  fighter:   [2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000],
  cleric:    [1500, 3000, 6000, 12000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
  magicUser: [2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 450000, 600000, 750000, 900000, 1050000],
  thief:     [1200, 2400, 4800, 9600, 20000, 40000, 80000, 160000, 280000, 400000, 520000, 640000, 760000],
  dwarf:     [2200, 4400, 8800, 17000, 35000, 70000, 140000, 270000, 400000, 530000, 660000],
  elf:       [4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 600000],
  halfling:  [2000, 4000, 8000, 16000, 32000, 64000, 120000],
};

function scaleXp(archetype: keyof typeof archetypeXp, nextLevelXp: number, maxLevel: number): number[] {
  const base = archetypeXp[archetype];
  const level2Xp = base[0];
  const ratio = nextLevelXp / level2Xp;
  const scaled = [0, ...base.map(xp => Math.round(xp * ratio / 500) * 500)];
  return scaled.slice(0, maxLevel);
}

/**
 * Build a derived ClassProgression from archetype data.
 * Uses the full source archetype level entries up to maxLevel.
 * If nextLevelXp differs from archetype's level-2 XP, scales all XP values.
 * Pass spellSlotTableId to assign a spell slot table to the result;
 * spell slots are NOT inherited from the archetype automatically.
 */
function deriveFromArchetype(
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

// ── Advanced Fantasy classes ──────────────────────────────────────────────────
// Derived from the archetype nearest to the published class role and HD.

// Fighter archetype (d8, max 14)
export const barbarian  = deriveFromArchetype(fighter, 14, 2500);
export const knight     = deriveFromArchetype(fighter, 14, 2500);
export const paladin    = deriveFromArchetype(fighter, 14, 2750); // divine flag but no specific spell type → no spell slots
export const ranger     = deriveFromArchetype(fighter, 14, 2250); // arcane+divine but no specific type → no slots

// Thief archetype (d4, max 14)
export const acrobat   = deriveFromArchetype(thief, 14, 1200);
export const assassin  = deriveFromArchetype(thief, 14, 1500);

// Cleric archetype (d6)
export const bard          = deriveFromArchetype(cleric, 14, 2000, 'cleric');
export const drow          = deriveFromArchetype(cleric, 14, 4000, 'cleric');
export const druid         = deriveFromArchetype(cleric, 14, 2000, 'cleric');
export const halfOrc       = deriveFromArchetype(halfling, 8, 1800);
export const duergar       = deriveFromArchetype(dwarf, 10, 2800);
export const halfElf       = deriveFromArchetype(elf, 12, 2500, 'elf'); // elf spell slots capped at 12 levels

// MU archetype (d4, max varies)
export const illusionist   = deriveFromArchetype(magicUser, 14, 2500, 'magic-user');
export const necromancer   = deriveFromArchetype(magicUser, 14, 2500, 'magic-user');
export const gnome         = deriveFromArchetype(magicUser,  8, 3000, 'magic-user');  // d4, max 8

// Dwarf archetype
export const svirfneblin   = deriveFromArchetype(dwarf, 8, 2400);

// ── Carcass Crawler classes ───────────────────────────────────────────────────

// Cleric archetype (d6)
export const acolyte          = deriveFromArchetype(cleric, 14, 1500, 'cleric');
export const beastMaster      = deriveFromArchetype(cleric, 14, 1800);
export const goblin           = deriveFromArchetype(halfling, 8, 2000);
export const hephaestan       = deriveFromArchetype(cleric, 10, 3000);
export const kineticist       = deriveFromArchetype(cleric, 14, 2000);
export const ratling          = deriveFromArchetype(halfling, 8, 2000);
export const mutoid           = deriveFromArchetype(halfling, 8, 1750);
export const changeling       = deriveFromArchetype(cleric, 10, 2500);
export const tiefling         = deriveFromArchetype(cleric, 10, 2500);
export const halflingHearthsinger = deriveFromArchetype(halfling, 8, 2000);
export const halflingReeve    = deriveFromArchetype(halfling, 8, 2500, 'cleric'); // divine → cleric spell slots (capped at 8)

// Arcane casters (d6, MU-like spell slots)
export const mage             = deriveFromArchetype(cleric, 14, 2800, 'magic-user'); // d6 fighter-like stats but arcane spells
export const arcaneBard       = deriveFromArchetype(cleric, 14, 2000, 'magic-user');
export const phaseElf         = deriveFromArchetype(elf, 10, 2800, 'elf');   // arcaneSpells → elf slots
export const woodElf          = deriveFromArchetype(elf, 10, 3000, 'cleric'); // druidSpells → cleric slots

// Dwarf archetype (d8)
export const dwarfBrewmaster  = deriveFromArchetype(dwarf, 10, 2500);
export const dwarfRunesmith   = deriveFromArchetype(dwarf, 10, 2800, 'magic-user'); // runesmithSpells → MU slots (approximation)

// Fighter archetype (d8)
export const dragonborn  = deriveFromArchetype(fighter, 10, 3000);

// Special
export const gargantua = (() => {
  // d10, max 10, fighter saves/thac0 — custom HD values
  const base = fighter.levels;
  const ratio = 2500 / 2000;
  return {
    levels: buildLevels([
      { level:  1, xp:      0, hdDice: 1, hdBonus: 0, thac0: base[0].thac0, saves: base[0].saves },
      { level:  2, xp:   2500, hdDice: 2, hdBonus: 0, thac0: base[1].thac0, saves: base[1].saves },
      { level:  3, xp:   5000, hdDice: 3, hdBonus: 0, thac0: base[2].thac0, saves: base[2].saves },
      { level:  4, xp:  10000, hdDice: 4, hdBonus: 0, thac0: base[3].thac0, saves: base[3].saves },
      { level:  5, xp:  20000, hdDice: 5, hdBonus: 0, thac0: base[4].thac0, saves: base[4].saves },
      { level:  6, xp:  40000, hdDice: 6, hdBonus: 0, thac0: base[5].thac0, saves: base[5].saves },
      { level:  7, xp:  80000, hdDice: 7, hdBonus: 0, thac0: base[6].thac0, saves: base[6].saves },
      { level:  8, xp: 150000, hdDice: 8, hdBonus: 0, thac0: base[7].thac0, saves: base[7].saves },
      { level:  9, xp: 300000, hdDice: 9, hdBonus: 0, thac0: base[8].thac0, saves: base[8].saves },
      { level: 10, xp: 450000, hdDice: 9, hdBonus: 2, thac0: base[9].thac0, saves: base[9].saves },
    ]),
  };
})();

export const mycelian = (() => {
  // d8, max 6, fighter saves/thac0
  const base = fighter.levels;
  const ratio = 3000 / 2000;
  return {
    levels: buildLevels([
      { level: 1, xp:     0, hdDice: 1, hdBonus: 0, thac0: base[0].thac0, saves: base[0].saves },
      { level: 2, xp:  3000, hdDice: 2, hdBonus: 0, thac0: base[1].thac0, saves: base[1].saves },
      { level: 3, xp:  6000, hdDice: 3, hdBonus: 0, thac0: base[2].thac0, saves: base[2].saves },
      { level: 4, xp: 12000, hdDice: 4, hdBonus: 0, thac0: base[3].thac0, saves: base[3].saves },
      { level: 5, xp: 24000, hdDice: 5, hdBonus: 0, thac0: base[4].thac0, saves: base[4].saves },
      { level: 6, xp: 48000, hdDice: 6, hdBonus: 0, thac0: base[5].thac0, saves: base[5].saves },
    ]),
  };
})();

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

// ── Main export: class name → ClassProgression ────────────────────────────────

const levelProgressionData: Record<string, ClassProgression> = {
  // Basic classes
  'Fighter':       fighter,
  'Cleric':        cleric,
  'Magic-User':    magicUser,
  'Thief':         thief,
  'Dwarf':         dwarf,
  'Elf':           elf,
  'Halfling':      halfling,

  // Advanced Fantasy classes
  'Acrobat':       acrobat,
  'Assassin':      assassin,
  'Barbarian':     barbarian,
  'Bard':          bard,
  'Drow':          drow,
  'Druid':         druid,
  'Duergar':       duergar,
  'Gnome':         gnome,
  'Half-Elf':      halfElf,
  'Half-Orc':      halfOrc,
  'Illusionist':   illusionist,
  'Knight':        knight,
  'Necromancer':   necromancer,
  'Paladin':       paladin,
  'Ranger':        ranger,
  'Svirfneblin':   svirfneblin,

  // Carcass Crawler classes
  'Acolyte':                  acolyte,
  'Gargantua':                gargantua,
  'Goblin':                   goblin,
  'Hephaestan':               hephaestan,
  'Kineticist':               kineticist,
  'Mage':                     mage,
  'Phase Elf':                phaseElf,
  'Wood Elf':                 woodElf,
  'Beast Master':             beastMaster,
  'Dragonborn':               dragonborn,
  'Mutoid':                   mutoid,
  'Mycelian':                 mycelian,
  'Tiefling':                 tiefling,
  'Halfling Hearthsinger':    halflingHearthsinger,
  'Halfling Reeve':           halflingReeve,
  'Arcane Bard':              arcaneBard,
  'Ratling':                  ratling,
  'Changeling':               changeling,
  'Dwarf Brewmaster':         dwarfBrewmaster,
  'Dwarf Runesmith':          dwarfRunesmith,
};

export default levelProgressionData;

/**
 * Look up the progression entry for a class at a given level.
 * Falls back to a safe default entry if the class or level is unknown.
 */
export function getLevelEntry(className: string, level: number): LevelEntry {
  const progression = levelProgressionData[className];
  if (!progression) {
    // Fallback: use level 1 of a generic fighter-like class
    return fighter.levels[Math.max(0, Math.min(level, fighter.levels.length) - 1)];
  }
  const idx = Math.max(0, Math.min(level, progression.levels.length) - 1);
  return progression.levels[idx];
}
