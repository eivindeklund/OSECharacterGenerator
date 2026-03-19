import { describe, expect, it } from 'vitest';
import classOptionsData from '../data/classOptionsData';
import { DEFAULT_SPELL_SLOT_TABLES } from '../data/levelProgressionData';
import type {
  CampaignClassOverride,
  CampaignLevelEntry,
  CampaignNewClass,
  ClassOptionsData,
  SpellSlotTable,
} from '../types';
import { buildCampaignClass } from './buildCampaignClass';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeLevels(count: number): CampaignLevelEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    level: i + 1,
    xp: i === 0 ? 0 : (i + 1) * 2000,
    hdDice: Math.min(i + 1, 9),
    hdBonus: i >= 8 ? (i - 8) * 2 : 0,
    thac0: i < 3 ? 19 : i < 6 ? 17 : i < 9 ? 15 : 12,
    saves: [14, 15, 16, 17, 18] as [number, number, number, number, number],
  }));
}

const baseNewClassDef: CampaignNewClass = {
  type: 'new',
  name: 'Swashbuckler',
  category: 'advanced',
  description: 'A dashing swordsman.',
  armour: 'leather or chainmail',
  weapons: 'any',
  hd: 6,
  maxLevel: 10,
  requirements: null,
  primeReqs: ['dexterity'],
  xpBonusRule: 'primeReq:dexterity:13:5%:16:10%',
  abilities: [{ name: 'Bonus to hit from behind' }],
  languages: '',
  levels: makeLevels(10),
};

const baseClasses = classOptionsData as ClassOptionsData[];

// ── new-class path ──────────────────────────────────────────────────────────

describe('buildCampaignClass — type "new"', () => {
  it('returns a non-null ClassOptionsData', () => {
    const result = buildCampaignClass(baseNewClassDef, baseClasses);
    expect(result).not.toBeNull();
  });

  it('exposes the correct name and category', () => {
    const result = buildCampaignClass(baseNewClassDef, baseClasses)!;
    expect(result.name).toBe('Swashbuckler');
    expect(result.category).toBe('advanced');
  });

  it('returns saving throws from the inline levels array', () => {
    const def: CampaignNewClass = {
      ...baseNewClassDef,
      levels: [
        { level: 1, xp: 0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [11, 12, 13, 14, 15] },
        { level: 2, xp: 2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [10, 11, 12, 13, 14] },
      ],
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.getSavingThrowsAtLevel(1)).toEqual([11, 12, 13, 14, 15]);
    expect(result.getSavingThrowsAtLevel(2)).toEqual([10, 11, 12, 13, 14]);
  });

  it('clamps level reads to the last entry when level exceeds maxLevel', () => {
    const def: CampaignNewClass = {
      ...baseNewClassDef,
      levels: [
        { level: 1, xp: 0,    hdDice: 1, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 2, xp: 2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [14, 15, 16, 17, 18] },
      ],
    };
    const result = buildCampaignClass(def, baseClasses)!;
    // Requesting level 99 should return the last defined level's values.
    expect(result.getSavingThrowsAtLevel(99)).toEqual([14, 15, 16, 17, 18]);
  });

  it('returns thac0 from the inline levels array', () => {
    const def: CampaignNewClass = {
      ...baseNewClassDef,
      levels: [
        { level: 1, xp: 0,    hdDice: 1, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 4, xp: 8000, hdDice: 4, hdBonus: 0, thac0: 16, saves: [13, 14, 15, 16, 17] },
      ],
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.getThac0AtLevel(1)).toBe(19);
    expect(result.getThac0AtLevel(2)).toBe(16); // clamped to last entry at index 1 → wait, idx = min(2,2)-1=1
  });

  it('returns spell slots from the named table when spellSlotTableId is set', () => {
    const customTable: SpellSlotTable = {
      id: 'test-caster',
      name: 'Test Caster',
      slots: [
        [1, 0, 0],  // level 1
        [2, 0, 0],  // level 2
        [2, 1, 0],  // level 3
      ],
    };
    const def: CampaignNewClass = {
      ...baseNewClassDef,
      spellListId: 'magic-user',
      magicTypeId: 'arcane',
      limitedSpellSelection: true,
      spellSlotTableId: 'test-caster',
      levels: [
        { level: 1, xp: 0,    hdDice: 1, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 2, xp: 2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 3, xp: 4000, hdDice: 3, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
      ],
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.getSpellSlotsAtLevel(1, [customTable])).toEqual([1, 0, 0]);
    expect(result.getSpellSlotsAtLevel(3, [customTable])).toEqual([2, 1, 0]);
  });

  it('returns empty spell slots when spellSlots is not defined on a level entry', () => {
    const result = buildCampaignClass(baseNewClassDef, baseClasses)!;
    expect(result.getSpellSlotsAtLevel(1, DEFAULT_SPELL_SLOT_TABLES)).toEqual([]);
  });

  it('isHdRollLevel is false at level 1 and true when hdDice increases', () => {
    const def: CampaignNewClass = {
      ...baseNewClassDef,
      levels: [
        { level: 1, xp: 0,    hdDice: 1, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 2, xp: 2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 3, xp: 4000, hdDice: 3, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
      ],
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.isHdRollLevel(1)).toBe(false);
    expect(result.isHdRollLevel(2)).toBe(true);
    expect(result.isHdRollLevel(3)).toBe(true);
  });

  it('getHpBonusAtLevel reflects hdBonus delta when hdDice is capped', () => {
    // Use a dense levels array so adjacent entries are distinct.
    const def: CampaignNewClass = {
      ...baseNewClassDef,
      levels: [
        { level: 1, xp:      0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 2, xp:   2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [15, 16, 17, 18, 19] },
        { level: 3, xp:   4000, hdDice: 2, hdBonus: 2, thac0: 19, saves: [15, 16, 17, 18, 19] },
      ],
    };
    const result = buildCampaignClass(def, baseClasses)!;
    // level 1: always 0
    expect(result.getHpBonusAtLevel(1)).toBe(0);
    // level 2: hdDice increased (1→2), so returns 0 (not a bonus level)
    expect(result.getHpBonusAtLevel(2)).toBe(0);
    // level 3: hdDice same as level 2 (both 2), hdBonus delta = 2 - 0 = 2
    expect(result.getHpBonusAtLevel(3)).toBe(2);
  });
});

// ── override path ───────────────────────────────────────────────────────────

describe('buildCampaignClass — type "override"', () => {
  it('returns null when baseName is not found in baseClasses', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'NonExistentClass',
    };
    const result = buildCampaignClass(def, baseClasses);
    expect(result).toBeNull();
  });

  it('inherits the base class name when no name override is provided', () => {
    const def: CampaignClassOverride = { type: 'override', baseName: 'Fighter' };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.name).toBe('Fighter');
  });

  it('applies a name override', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      name: 'Warrior',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.name).toBe('Warrior');
  });

  it('applies a description override', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Thief',
      description: 'Custom description',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.description).toBe('Custom description');
  });

  it('returns saving throws from Fighter progression table even after rename', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      name: 'Warrior',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    const fighter = baseClasses.find((c) => c.name === 'Fighter')!;
    // Level 1 saves should match Fighter's table
    expect(result.getSavingThrowsAtLevel(1)).toEqual(fighter.getSavingThrowsAtLevel(1));
    // Level 7 saves should also match Fighter
    expect(result.getSavingThrowsAtLevel(7)).toEqual(fighter.getSavingThrowsAtLevel(7));
  });

  it('returns thac0 from Fighter progression after rename', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      name: 'Warrior',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    const fighter = baseClasses.find((c) => c.name === 'Fighter')!;
    expect(result.getThac0AtLevel(1)).toBe(fighter.getThac0AtLevel(1));
    expect(result.getThac0AtLevel(9)).toBe(fighter.getThac0AtLevel(9));
  });

  it('returns spell slots from Magic-User table when overriding Magic-User', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Magic-User',
      name: 'Wizard',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    const mu = baseClasses.find((c) => c.name === 'Magic-User')!;
    expect(result.getSpellSlotsAtLevel(1, DEFAULT_SPELL_SLOT_TABLES)).toEqual(mu.getSpellSlotsAtLevel(1, DEFAULT_SPELL_SLOT_TABLES));
    expect(result.getSpellSlotsAtLevel(3, DEFAULT_SPELL_SLOT_TABLES)).toEqual(mu.getSpellSlotsAtLevel(3, DEFAULT_SPELL_SLOT_TABLES));
  });

  it('spellSlotTableId replaces the standard table for the override class', () => {
    const customTable: SpellSlotTable = {
      id: 'custom-mu',
      name: 'Custom Magic-User',
      slots: [
        [2, 0, 0, 0, 0, 0],  // level 1
        [3, 1, 0, 0, 0, 0],  // level 2
        [3, 2, 0, 0, 0, 0],  // level 3
      ],
    };
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Magic-User',
      spellSlotTableId: 'custom-mu',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.getSpellSlotsAtLevel(1, [customTable])).toEqual([2, 0, 0, 0, 0, 0]);
    expect(result.getSpellSlotsAtLevel(2, [customTable])).toEqual([3, 1, 0, 0, 0, 0]);
    expect(result.getSpellSlotsAtLevel(3, [customTable])).toEqual([3, 2, 0, 0, 0, 0]);
  });

  it('isHdRollLevel delegates to Fighter progression', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      name: 'Warrior',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    const fighter = baseClasses.find((c) => c.name === 'Fighter')!;
    expect(result.isHdRollLevel(1)).toBe(fighter.isHdRollLevel(1));
    expect(result.isHdRollLevel(2)).toBe(fighter.isHdRollLevel(2));
  });

  it('getHpBonusAtLevel delegates to Fighter progression', () => {
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      name: 'Warrior',
    };
    const result = buildCampaignClass(def, baseClasses)!;
    const fighter = baseClasses.find((c) => c.name === 'Fighter')!;
    // Level 10 is a non-roll level for Fighter (hdBonus increases)
    expect(result.getHpBonusAtLevel(10)).toBe(fighter.getHpBonusAtLevel(10));
  });

  it('does not share level-method mutations between two overrides of the same base', () => {
    const def1: CampaignClassOverride = { type: 'override', baseName: 'Fighter', name: 'Warrior' };
    const def2: CampaignClassOverride = { type: 'override', baseName: 'Fighter', name: 'Knight' };
    const r1 = buildCampaignClass(def1, baseClasses)!;
    const r2 = buildCampaignClass(def2, baseClasses)!;
    expect(r1.name).toBe('Warrior');
    expect(r2.name).toBe('Knight');
    // Both should still read the Fighter progression:
    expect(r1.getSavingThrowsAtLevel(1)).toEqual(r2.getSavingThrowsAtLevel(1));
  });

  it('replaces the level progression table when levels[] is provided', () => {
    const customLevels: CampaignLevelEntry[] = [
      { level: 1, xp:     0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [10, 11, 12, 13, 14] },
      { level: 2, xp:  1000, hdDice: 2, hdBonus: 0, thac0: 17, saves: [9, 10, 11, 12, 13] },
      { level: 3, xp:  2000, hdDice: 3, hdBonus: 0, thac0: 15, saves: [8,  9, 10, 11, 12] },
    ];
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      levels: customLevels,
    };
    const result = buildCampaignClass(def, baseClasses)!;
    expect(result.getSavingThrowsAtLevel(1)).toEqual([10, 11, 12, 13, 14]);
    expect(result.getSavingThrowsAtLevel(2)).toEqual([9, 10, 11, 12, 13]);
    expect(result.getThac0AtLevel(3)).toBe(15);
  });

  it('level override does not mutate the base class progression', () => {
    const customLevels: CampaignLevelEntry[] = [
      { level: 1, xp: 0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [5, 6, 7, 8, 9] },
    ];
    const def: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      levels: customLevels,
    };
    const fighter = baseClasses.find((c) => c.name === 'Fighter')!;
    const originalSaves = fighter.getSavingThrowsAtLevel(1);
    buildCampaignClass(def, baseClasses);
    expect(fighter.getSavingThrowsAtLevel(1)).toEqual(originalSaves);
  });
});
