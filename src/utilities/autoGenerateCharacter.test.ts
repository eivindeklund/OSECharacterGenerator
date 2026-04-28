import { describe, expect, it } from 'vitest';
import classOptionsData from '../data/classOptionsData';
import type { ClassOptionsData, SpellDefinition } from '../types';
import {
  autoGenerateCharacter,
  parseXpBonus,
  rollAlignment,
  selectBestClass,
} from './autoGenerateCharacter';
import { allItemsById } from './PackUtils';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Simple LCG for deterministic test randomness. */
function makeLCG(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const basicClasses = classOptionsData.filter((c) => c.category === 'basic');

/** Mock getSpellListsForClass: returns a small list of dummy spells for any class. */
const mockSpellLists = (cls: ClassOptionsData): SpellDefinition[][] => {
  if (!cls.spellListId) return [];
  return [[
    { id: 'charm-person', name: 'Charm Person' },
    { id: 'magic-missile', name: 'Magic Missile' },
    { id: 'sleep', name: 'Sleep' },
  ]];
};

/** Mock getClassSpellSlots: always returns [2, 0, 0, 0, 0] for level 1. */
const mockSpellSlots = (_cls: ClassOptionsData, _level: number): number[] => [2, 0, 0, 0, 0];

// ── parseXpBonus ───────────────────────────────────────────────────────────────

describe('parseXpBonus', () => {
  it('parses "+10%" to 10', () => expect(parseXpBonus('+10%')).toBe(10));
  it('parses "+5%" to 5', () => expect(parseXpBonus('+5%')).toBe(5));
  it('parses "0" to 0', () => expect(parseXpBonus('0')).toBe(0));
  it('parses "-10%" to -10', () => expect(parseXpBonus('-10%')).toBe(-10));
  it('parses "5%" (no plus sign) to 5', () => expect(parseXpBonus('5%')).toBe(5));
});

// ── rollAlignment ──────────────────────────────────────────────────────────────

describe('rollAlignment', () => {
  it('returns "lawful" when random < 0.50', () => {
    expect(rollAlignment(() => 0.0)).toBe('lawful');
    expect(rollAlignment(() => 0.49)).toBe('lawful');
  });

  it('returns "neutral" when 0.50 ≤ random < 0.85', () => {
    expect(rollAlignment(() => 0.50)).toBe('neutral');
    expect(rollAlignment(() => 0.84)).toBe('neutral');
  });

  it('returns "chaotic" when random ≥ 0.85', () => {
    expect(rollAlignment(() => 0.85)).toBe('chaotic');
    expect(rollAlignment(() => 0.99)).toBe('chaotic');
  });

  it('produces the correct distribution across many samples', () => {
    const counts = { lawful: 0, neutral: 0, chaotic: 0 };
    const rng = makeLCG(42);
    const N = 10_000;
    for (let i = 0; i < N; i++) {
      counts[rollAlignment(rng) as keyof typeof counts]++;
    }
    // 50 ± 3%, 35 ± 3%, 15 ± 3%
    expect(counts.lawful / N).toBeCloseTo(0.50, 1);
    expect(counts.neutral / N).toBeCloseTo(0.35, 1);
    expect(counts.chaotic / N).toBeCloseTo(0.15, 1);
  });
});

// ── selectBestClass ────────────────────────────────────────────────────────────

describe('selectBestClass', () => {
  it('always returns a class with category === "basic"', () => {
    const rng = makeLCG(1);
    for (let i = 1; i <= 20; i++) {
      const scores = { strength: i % 6 + 3, intelligence: i % 6 + 3, wisdom: i % 6 + 3, dexterity: i % 6 + 3, constitution: i % 6 + 3, charisma: i % 6 + 3 };
      const cls = selectBestClass(classOptionsData, scores, rng);
      expect(cls.category).toBe('basic');
    }
  });

  it('returns a class that meets its ability score requirements', () => {
    const rng = makeLCG(7);
    const allScores = { strength: 16, intelligence: 16, wisdom: 16, dexterity: 16, constitution: 16, charisma: 16 };
    const cls = selectBestClass(classOptionsData, allScores, rng);
    expect(cls.checkAbilityScoreRequirements(allScores)).toBe(true);
  });

  it('prefers the class with the highest XP bonus', () => {
    const rng = makeLCG(0);
    // High STR, low everything else → Fighter should win (or Dwarf)
    const highStrScores = { strength: 16, intelligence: 3, wisdom: 3, dexterity: 3, constitution: 3, charisma: 3 };
    const cls = selectBestClass(basicClasses, highStrScores, rng);
    const bonuses = basicClasses
      .filter((c) => c.checkAbilityScoreRequirements(highStrScores))
      .map((c) => parseXpBonus(c.xpModifierPercentage(highStrScores)));
    const maxBonus = Math.max(...bonuses);
    expect(parseXpBonus(cls.xpModifierPercentage(highStrScores))).toBe(maxBonus);
  });

  it('only selects basic classes even when given a full list including advanced classes', () => {
    const rng = makeLCG(13);
    const scores = { strength: 10, intelligence: 10, wisdom: 10, dexterity: 10, constitution: 10, charisma: 10 };
    const cls = selectBestClass(classOptionsData, scores, rng);
    expect(cls.category).toBe('basic');
  });
});

// ── autoGenerateCharacter ──────────────────────────────────────────────────────

describe('autoGenerateCharacter', () => {
  const makeChar = (seed = 42) =>
    autoGenerateCharacter(classOptionsData, {
      getSpellListsForClass: mockSpellLists,
      getClassSpellSlots: mockSpellSlots,
      random: makeLCG(seed),
    });

  it('produces valid ability scores (all in [3, 18])', () => {
    const char = makeChar();
    const { strength, intelligence, wisdom, dexterity, constitution, charisma } = char.abilityScores;
    for (const score of [strength, intelligence, wisdom, dexterity, constitution, charisma]) {
      expect(score).toBeGreaterThanOrEqual(3);
      expect(score).toBeLessThanOrEqual(18);
    }
  });

  it('selects a basic class', () => {
    const char = makeChar();
    expect(char.characterClass.category).toBe('basic');
  });

  it('selects a class that meets ability score requirements', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const char = makeChar(seed);
      expect(char.characterClass.checkAbilityScoreRequirements(char.abilityScores)).toBe(true);
    }
  });

  it('HP is at least 1', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const char = makeChar(seed);
      expect(char.characterStatistics.hitPoints).toBeGreaterThanOrEqual(1);
    }
  });

  it('rolled gold (remaining + equipment cost) is in [30, 180]', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const char = makeChar(seed);
      const equipCost = [
        ...char.characterEquipment.armour,
        ...char.characterEquipment.weapons,
        ...char.characterEquipment.adventuringGear,
      ].reduce((sum, id) => sum + (allItemsById[id]?.price ?? 0), 0);
      const originalRoll = (char.characterEquipment.gold ?? 0) + equipCost;
      expect(originalRoll).toBeGreaterThanOrEqual(30);
      expect(originalRoll).toBeLessThanOrEqual(180);
    }
  });

  it('gold field stores remaining gold after equipment purchase, not original roll', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const char = makeChar(seed);
      const equipCost = [
        ...char.characterEquipment.armour,
        ...char.characterEquipment.weapons,
        ...char.characterEquipment.adventuringGear,
      ].reduce((sum, id) => sum + (allItemsById[id]?.price ?? 0), 0);
      expect(equipCost).toBeGreaterThan(0);
      // remaining gold must be less than the minimum possible original roll (30 gp),
      // because the equipment algorithm exhausts nearly all gold
      expect(char.characterEquipment.gold).toBeGreaterThanOrEqual(0);
      expect(char.characterEquipment.gold).toBeLessThan(30);
    }
  });

  it('alignment is one of lawful / neutral / chaotic', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const char = makeChar(seed);
      expect(['lawful', 'neutral', 'chaotic']).toContain(char.character.alignment);
    }
  });

  it('character name is a non-empty string', () => {
    const char = makeChar();
    expect(typeof char.character.name).toBe('string');
    expect((char.character.name as string).length).toBeGreaterThan(0);
  });

  it('character gender is set', () => {
    const char = makeChar();
    expect(['male', 'female', 'neutral']).toContain(char.character.gender);
  });

  it('description is a non-empty string', () => {
    const char = makeChar();
    expect(typeof char.character.description).toBe('string');
    expect((char.character.description as string).length).toBeGreaterThan(0);
  });

  it('selects spells for a class with limitedSpellSelection', () => {
    // Force magic-user by using a seed that selects it, or just find a magic-user directly
    const muClass = basicClasses.find((c) => c.name === 'Magic-User')!;
    expect(muClass).toBeDefined();

    const char = autoGenerateCharacter([muClass], {
      getSpellListsForClass: mockSpellLists,
      getClassSpellSlots: mockSpellSlots,
      random: makeLCG(1),
    });
    expect(char.characterStatistics.spells.length).toBeGreaterThan(0);
  });

  it('does not add spells for a class without limitedSpellSelection', () => {
    const fighter = basicClasses.find((c) => c.name === 'Fighter')!;
    expect(fighter).toBeDefined();

    const char = autoGenerateCharacter([fighter], {
      getSpellListsForClass: mockSpellLists,
      getClassSpellSlots: mockSpellSlots,
      random: makeLCG(1),
    });
    expect(char.characterStatistics.spells).toHaveLength(0);
  });

  it('does not add spells for a cleric (limitedSpellSelection === false)', () => {
    const cleric = basicClasses.find((c) => c.name === 'Cleric')!;
    expect(cleric).toBeDefined();

    const char = autoGenerateCharacter([cleric], {
      getSpellListsForClass: mockSpellLists,
      getClassSpellSlots: mockSpellSlots,
      random: makeLCG(1),
    });
    expect(char.characterStatistics.spells).toHaveLength(0);
  });

  it('returns a character with all required StoredCharacterData fields', () => {
    const char = makeChar();
    expect(char).toHaveProperty('character');
    expect(char).toHaveProperty('abilityScores');
    expect(char).toHaveProperty('characterModifiers');
    expect(char).toHaveProperty('characterStatistics');
    expect(char).toHaveProperty('characterClass');
    expect(char).toHaveProperty('characterEquipment');
    expect(char).toHaveProperty('campaignId');
    expect(char.character.id).toBeTruthy();
  });

  it('equipment arrays contain only string IDs', () => {
    const char = makeChar();
    for (const item of [
      ...char.characterEquipment.armour,
      ...char.characterEquipment.weapons,
      ...char.characterEquipment.adventuringGear,
    ]) {
      expect(typeof item).toBe('string');
    }
  });

  it('stamped with default campaignId by default', () => {
    const char = makeChar();
    expect(char.campaignId).toBe('default');
  });

  it('accepts a custom campaignId', () => {
    const char = autoGenerateCharacter(classOptionsData, {
      getSpellListsForClass: mockSpellLists,
      getClassSpellSlots: mockSpellSlots,
      campaignId: 'my-campaign',
      random: makeLCG(1),
    });
    expect(char.campaignId).toBe('my-campaign');
  });
});
