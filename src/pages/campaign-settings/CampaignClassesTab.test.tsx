import { describe, expect, it } from 'vitest';
import type { CampaignClassOverride, CampaignLevelEntry, CampaignNewClass } from '../../types';
import {
    EMPTY_NEW_CLASS_FORM,
    EMPTY_OVERRIDE_FORM,
    formStateToNewClass,
    formStateToOverride,
    newClassToFormState,
    overrideToFormState,
} from './CampaignClassesTab';
import type { LevelRowState } from './LevelProgressionEditor';

// ── Sample helpers ────────────────────────────────────────────────────────────

const twoLevels: CampaignLevelEntry[] = [
  { level: 1, xp: 0, hdDice: 1, hdBonus: 0, thac0: 19, saves: [12, 13, 14, 15, 16] },
  { level: 2, xp: 2000, hdDice: 2, hdBonus: 0, thac0: 19, saves: [12, 13, 14, 15, 16] },
];

const twoRows: LevelRowState[] = [
  { level: '1', xp: '0', hdDice: '1', hdBonus: '0', thac0: '19',
    save0: '12', save1: '13', save2: '14', save3: '15', save4: '16' },
  { level: '2', xp: '2000', hdDice: '2', hdBonus: '0', thac0: '19',
    save0: '12', save1: '13', save2: '14', save3: '15', save4: '16' },
];

// ── overrideToFormState — levels handling ─────────────────────────────────────

describe('overrideToFormState — levels handling', () => {
  it('sets levelsOverrideEnabled=false and empty levelRows when levels is absent', () => {
    const override: CampaignClassOverride = { type: 'override', baseName: 'Fighter' };
    const form = overrideToFormState(override);
    expect(form.levelsOverrideEnabled).toBe(false);
    expect(form.levelRows).toEqual([]);
  });

  it('sets levelsOverrideEnabled=true and converts levelRows when levels are present', () => {
    const override: CampaignClassOverride = {
      type: 'override',
      baseName: 'Fighter',
      levels: twoLevels,
    };
    const form = overrideToFormState(override);
    expect(form.levelsOverrideEnabled).toBe(true);
    expect(form.levelRows).toHaveLength(2);
    expect(form.levelRows[0].xp).toBe('0');
    expect(form.levelRows[1].xp).toBe('2000');
  });
});

// ── formStateToOverride — levels handling ─────────────────────────────────────

describe('formStateToOverride — levels handling', () => {
  it('omits levels when levelsOverrideEnabled=false', () => {
    const form = {
      ...EMPTY_OVERRIDE_FORM,
      baseName: 'Fighter',
      levelsOverrideEnabled: false,
      levelRows: twoRows,
    };
    const override = formStateToOverride(form);
    expect(override.levels).toBeUndefined();
  });

  it('includes levels[] when levelsOverrideEnabled=true', () => {
    const form = {
      ...EMPTY_OVERRIDE_FORM,
      baseName: 'Fighter',
      levelsOverrideEnabled: true,
      levelRows: twoRows,
    };
    const override = formStateToOverride(form);
    expect(override.levels).toHaveLength(2);
    expect(override.levels![0]).toEqual(twoLevels[0]);
    expect(override.levels![1]).toEqual(twoLevels[1]);
  });

  it('emits an empty levels[] when levelsOverrideEnabled=true but levelRows is empty', () => {
    const form = {
      ...EMPTY_OVERRIDE_FORM,
      baseName: 'Fighter',
      levelsOverrideEnabled: true,
      levelRows: [],
    };
    const override = formStateToOverride(form);
    expect(override.levels).toEqual([]);
  });
});

// ── newClassToFormState / formStateToNewClass ─────────────────────────────────

describe('newClassToFormState', () => {
  it('reads levelsMode=custom and levelRows from a CampaignNewClass with levels', () => {
    const cls: CampaignNewClass = {
      type: 'new',
      name: 'Custom Hero',
      category: 'custom',
      description: 'A hero',
      armour: 'Any',
      weapons: 'Any',
      languages: '',
      hd: 8,
      maxLevel: 10,
      requirements: null,
      primeReqs: ['strength'],
      abilities: [],
      levels: twoLevels,
    };
    const form = newClassToFormState(cls);
    expect(form.levelsMode).toBe('custom');
    expect(form.levelRows).toHaveLength(2);
    expect(form.levelRows[0].xp).toBe('0');
    expect(form.name).toBe('Custom Hero');
    expect(form.hd).toBe('8');
  });

  it('reads levelsMode=inherit and inheritFromName from a CampaignNewClass with baseLevelProgressionId', () => {
    const cls: CampaignNewClass = {
      type: 'new',
      name: 'Copy Cat',
      category: 'custom',
      description: '',
      armour: 'Any',
      weapons: 'Any',
      languages: '',
      hd: 6,
      maxLevel: 14,
      requirements: null,
      primeReqs: [],
      abilities: [],
      baseLevelProgressionId: 'Fighter',
    };
    const form = newClassToFormState(cls);
    expect(form.levelsMode).toBe('inherit');
    expect(form.inheritFromName).toBe('Fighter');
  });
});

describe('formStateToNewClass', () => {
  it('produces a CampaignNewClass with levelsMode=inherit', () => {
    const form = {
      ...EMPTY_NEW_CLASS_FORM,
      name: 'Test Class',
      category: 'custom',
      hd: '8',
      maxLevel: '10',
      levelsMode: 'inherit' as const,
      inheritFromName: 'Fighter',
    };
    const cls = formStateToNewClass(form);
    expect(cls.type).toBe('new');
    expect(cls.name).toBe('Test Class');
    expect(cls.baseLevelProgressionId).toBe('Fighter');
    expect(cls.levels).toBeUndefined();
  });

  it('produces a CampaignNewClass with levelsMode=custom and levels[]', () => {
    const form = {
      ...EMPTY_NEW_CLASS_FORM,
      name: 'Custom Class',
      category: 'custom',
      hd: '6',
      maxLevel: '14',
      levelsMode: 'custom' as const,
      levelRows: twoRows,
    };
    const cls = formStateToNewClass(form);
    expect(cls.levels).toHaveLength(2);
    expect(cls.levels![0]).toEqual(twoLevels[0]);
    expect(cls.baseLevelProgressionId).toBeUndefined();
  });
});
