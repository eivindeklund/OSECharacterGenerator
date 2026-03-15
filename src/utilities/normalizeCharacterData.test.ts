import { describe, expect, it } from 'vitest';
import {
        normalizeCharacterStatistics,
        normalizeStoredCharacter,
} from './normalizeCharacterData';

describe('normalizeCharacterStatistics', () => {
  it('migrates legacy spell field into spells[] when spells is missing', () => {
    const raw = {
      hitPoints: 3, hpRolls: 1, hpResult: 3, hpSeed: null,
      armourClass: 9, hasSpells: true, unarmouredAC: null,
      spell: 'Sleep',
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect(result.spells).toEqual(['Sleep']);
  });

  it('migrates legacy spell field into spells[] when spells is empty', () => {
    const raw = {
      hitPoints: 3, hpRolls: 1, hpResult: 3, hpSeed: null,
      armourClass: 9, hasSpells: true, unarmouredAC: null,
      spell: 'Charm Person', spells: [],
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect(result.spells).toEqual(['Charm Person']);
  });

  it('preserves existing spells[] when it is non-empty (legacy spell field is discarded)', () => {
    const raw = {
      hitPoints: 3, hpRolls: 1, hpResult: 3, hpSeed: null,
      armourClass: 9, hasSpells: true, unarmouredAC: null,
      spell: 'Sleep', spells: ['Magic Missile', 'Web'],
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect(result.spells).toEqual(['Magic Missile', 'Web']);
  });

  it('defaults level to 1 when level is missing', () => {
    const raw = {
      hitPoints: 5, hpRolls: 1, hpResult: 5, hpSeed: null,
      armourClass: 9, hasSpells: false, unarmouredAC: null,
      spells: [],
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect(result.level).toBe(1);
  });

  it('preserves an explicit level value', () => {
    const raw = {
      hitPoints: 10, hpRolls: 2, hpResult: 5, hpSeed: null,
      armourClass: 8, hasSpells: false, unarmouredAC: null,
      level: 3, spells: [],
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect(result.level).toBe(3);
  });

  it('returns empty spells[] when both spell and spells are absent/empty', () => {
    const raw = {
      hitPoints: 4, hpRolls: 1, hpResult: 4, hpSeed: null,
      armourClass: 9, hasSpells: false, unarmouredAC: null,
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect(result.spells).toEqual([]);
  });

  it('does not include the legacy spell key in the output', () => {
    const raw = {
      hitPoints: 3, hpRolls: 1, hpResult: 3, hpSeed: null,
      armourClass: 9, hasSpells: true, unarmouredAC: null,
      spell: 'Sleep', spells: [],
    } as Parameters<typeof normalizeCharacterStatistics>[0];

    const result = normalizeCharacterStatistics(raw);

    expect('spell' in result).toBe(false);
  });
});

describe('normalizeStoredCharacter', () => {
  it('normalizes characterStatistics within a full StoredCharacterData record', () => {
    const raw = {
      character: { name: 'Gandalf', id: 'xyz' },
      abilityScores: { strength: 9, intelligence: 18, wisdom: 12, dexterity: 10, constitution: 10, charisma: 14 },
      characterModifiers: {},
      characterStatistics: {
        hitPoints: 3, hpRolls: 1, hpResult: 3, hpSeed: null,
        armourClass: 9, hasSpells: true, unarmouredAC: null,
        spell: 'Sleep',
        // level and spells intentionally absent to simulate old save
      },
      characterClass: { name: 'Magic-User' },
      characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 30 },
    };

    const result = normalizeStoredCharacter(raw as Parameters<typeof normalizeStoredCharacter>[0]);

    expect(result.characterStatistics.level).toBe(1);
    expect(result.characterStatistics.spells).toEqual(['Sleep']);
    expect('spell' in result.characterStatistics).toBe(false);
  });
});
