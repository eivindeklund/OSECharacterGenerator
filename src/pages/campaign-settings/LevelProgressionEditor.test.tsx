import { describe, expect, it } from 'vitest';
import type { CampaignLevelEntry } from '../../types';
import { levelEntryToRow, rowToLevelEntry, type LevelRowState } from './LevelProgressionEditor';

// ── Sample data ───────────────────────────────────────────────────────────────

const sampleEntry: CampaignLevelEntry = {
  level: 3,
  xp: 4000,
  hdDice: 3,
  hdBonus: 0,
  thac0: 19,
  saves: [12, 13, 14, 15, 16],
};

const sampleRow: LevelRowState = {
  level: '3',
  xp: '4000',
  hdDice: '3',
  hdBonus: '0',
  thac0: '19',
  save0: '12',
  save1: '13',
  save2: '14',
  save3: '15',
  save4: '16',
};

// ── levelEntryToRow ───────────────────────────────────────────────────────────

describe('levelEntryToRow', () => {
  it('converts a CampaignLevelEntry to a LevelRowState with string fields', () => {
    expect(levelEntryToRow(sampleEntry)).toEqual(sampleRow);
  });

  it('stringifies hdBonus > 0', () => {
    const row = levelEntryToRow({ ...sampleEntry, hdBonus: 5 });
    expect(row.hdBonus).toBe('5');
  });

  it('stringifies all five saves independently', () => {
    const row = levelEntryToRow({
      level: 1, xp: 0, hdDice: 1, hdBonus: 0, thac0: 19,
      saves: [8, 9, 10, 11, 12],
    });
    expect(row.save0).toBe('8');
    expect(row.save1).toBe('9');
    expect(row.save2).toBe('10');
    expect(row.save3).toBe('11');
    expect(row.save4).toBe('12');
  });
});

// ── rowToLevelEntry ───────────────────────────────────────────────────────────

describe('rowToLevelEntry', () => {
  it('parses a LevelRowState back to a CampaignLevelEntry', () => {
    expect(rowToLevelEntry(sampleRow)).toEqual(sampleEntry);
  });

  it('defaults blank strings to 0 for numeric fields', () => {
    const blank: LevelRowState = {
      level: '1',
      xp: '',
      hdDice: '',
      hdBonus: '',
      thac0: '',
      save0: '',
      save1: '',
      save2: '',
      save3: '',
      save4: '',
    };
    expect(rowToLevelEntry(blank)).toEqual({
      level: 1,
      xp: 0,
      hdDice: 0,
      hdBonus: 0,
      thac0: 0,
      saves: [0, 0, 0, 0, 0],
    });
  });

  it('parses level 10 with hdBonus correctly', () => {
    const row: LevelRowState = {
      level: '10',
      xp: '360000',
      hdDice: '9',
      hdBonus: '2',
      thac0: '12',
      save0: '6',
      save1: '7',
      save2: '8',
      save3: '8',
      save4: '10',
    };
    expect(rowToLevelEntry(row)).toEqual({
      level: 10,
      xp: 360000,
      hdDice: 9,
      hdBonus: 2,
      thac0: 12,
      saves: [6, 7, 8, 8, 10],
    });
  });
});

// ── Round-trip ────────────────────────────────────────────────────────────────

describe('round-trip: levelEntryToRow → rowToLevelEntry', () => {
  it('is an identity for typical CampaignLevelEntry values', () => {
    const entries: CampaignLevelEntry[] = [
      sampleEntry,
      { level: 1, xp: 0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [13, 14, 13, 16, 15] },
      { level: 10, xp: 360000, hdDice: 9, hdBonus: 2, thac0: 12, saves: [6, 7, 8, 8, 10] },
      { level: 14, xp: 840000, hdDice: 9, hdBonus: 10, thac0: 10, saves: [4, 5, 6, 5, 8] },
    ];
    for (const entry of entries) {
      expect(rowToLevelEntry(levelEntryToRow(entry))).toEqual(entry);
    }
  });
});
