import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAMPAIGNS_STORAGE, DEFAULT_CAMPAIGN_ID } from '../constants/constants';
import type { Campaign } from '../types';
import { useCampaignManager } from './useCampaignManager';

// ── localStorage stub ─────────────────────────────────────────────────────────

function makeLocalStorageStub(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
    _store: store,
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeLocalStorageStub());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCampaign(partial: Partial<Campaign> & { id: string; name: string }): Campaign {
  return {
    notes: '',
    allowedClassNames: null,
    allowedEquipmentIds: null,
    allowedWeaponIds: null,
    allowedSpellIds: {},
    allowAdvancedClasses: null,
    allowCarcassClasses: null,
    allowNonBxEquipment: null,
    customClasses: [],
    customSpellLists: [],
    customEquipment: [],
    customWeapons: [],
    customSpells: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  };
}

function seedStorage(campaigns: Campaign[]) {
  localStorage.setItem(CAMPAIGNS_STORAGE, JSON.stringify(campaigns));
}

// ── campaigns state ───────────────────────────────────────────────────────────

describe('useCampaignManager — campaigns list', () => {
  it('initialises with at least the default campaign', () => {
    const { result } = renderHook(() => useCampaignManager());
    expect(result.current.campaigns.some((c) => c.id === DEFAULT_CAMPAIGN_ID)).toBe(true);
  });

  it('createCampaign appends a new campaign', () => {
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.createCampaign('New Campaign'); });
    expect(result.current.campaigns.some((c) => c.name === 'New Campaign')).toBe(true);
  });

  it('updateCampaign persists name change', () => {
    seedStorage([makeCampaign({ id: 'camp-1', name: 'Old Name' })]);
    const { result } = renderHook(() => useCampaignManager());
    const updated = { ...result.current.campaigns.find((c) => c.id === 'camp-1')!, name: 'New Name' };
    act(() => { result.current.updateCampaign(updated); });
    expect(result.current.campaigns.find((c) => c.id === 'camp-1')?.name).toBe('New Name');
  });

  it('deleteCampaign removes a non-default campaign', () => {
    seedStorage([makeCampaign({ id: 'camp-1', name: 'To Delete' })]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.deleteCampaign('camp-1'); });
    expect(result.current.campaigns.some((c) => c.id === 'camp-1')).toBe(false);
  });
});

// ── active campaign ───────────────────────────────────────────────────────────

describe('useCampaignManager — activeCampaign', () => {
  it('activeCampaign is the default campaign initially', () => {
    const { result } = renderHook(() => useCampaignManager());
    expect(result.current.activeCampaign.id).toBe(DEFAULT_CAMPAIGN_ID);
  });

  it('setActiveCampaign updates activeCampaign and activeCampaignId', () => {
    seedStorage([makeCampaign({ id: 'camp-1', name: 'My Campaign' })]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    expect(result.current.activeCampaignId).toBe('camp-1');
    expect(result.current.activeCampaign.name).toBe('My Campaign');
  });

  it('activeCharacterCampaignId falls back to DEFAULT_CAMPAIGN_ID when nothing is active', () => {
    const { result } = renderHook(() => useCampaignManager());
    expect(result.current.activeCharacterCampaignId).toBe(DEFAULT_CAMPAIGN_ID);
  });

  it('activeCharacterCampaignId reflects the active campaign when set', () => {
    seedStorage([makeCampaign({ id: 'camp-1', name: 'Active' })]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    expect(result.current.activeCharacterCampaignId).toBe('camp-1');
  });

  it('deleteCampaign clears activeCampaignId when the active campaign is deleted', () => {
    seedStorage([makeCampaign({ id: 'camp-1', name: 'Will Delete' })]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    act(() => { result.current.deleteCampaign('camp-1'); });
    expect(result.current.activeCampaignId).toBeNull();
  });
});

// ── availableClasses ─────────────────────────────────────────────────────────

describe('useCampaignManager — availableClasses', () => {
  it('returns the full standard class list when no campaign is active', () => {
    const { result } = renderHook(() => useCampaignManager());
    const classes = result.current.availableClasses();
    expect(classes.length).toBeGreaterThan(0);
    expect(classes.some((c) => c.name === 'Fighter')).toBe(true);
  });

  it('includes all standard classes when no allowedClassNames restriction is set', () => {
    seedStorage([makeCampaign({ id: 'camp-1', name: 'Open', allowedClassNames: null })]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    const classes = result.current.availableClasses();
    expect(classes.some((c) => c.name === 'Fighter')).toBe(true);
    expect(classes.some((c) => c.name === 'Magic-User')).toBe(true);
  });

  it('filters classes by allowedClassNames', () => {
    seedStorage([
      makeCampaign({ id: 'camp-1', name: 'Restricted', allowedClassNames: ['Fighter', 'Cleric'] }),
    ]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    const classes = result.current.availableClasses();
    expect(classes.map((c) => c.name)).toEqual(expect.arrayContaining(['Fighter', 'Cleric']));
    expect(classes.every((c) => ['Fighter', 'Cleric'].includes(c.name))).toBe(true);
  });

  it('applies name override from customClasses', () => {
    const camp = makeCampaign({
      id: 'camp-1',
      name: 'Renamed',
      customClasses: [{ type: 'override', baseName: 'Fighter', name: 'Warrior' }],
    });
    seedStorage([camp]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    const classes = result.current.availableClasses();
    expect(classes.some((c) => c.name === 'Warrior')).toBe(true);
    expect(classes.some((c) => c.name === 'Fighter')).toBe(false);
  });
});

// ── availableEquipment ────────────────────────────────────────────────────────

describe('useCampaignManager — availableEquipment', () => {
  it('returns standard equipment when no campaign is active', () => {
    const { result } = renderHook(() => useCampaignManager());
    const equipment = result.current.availableEquipment();
    expect(equipment.length).toBeGreaterThan(0);
  });

  it('filters by allowedEquipmentIds when set', () => {
    // Get some real equipment ids first
    const { result: baseResult } = renderHook(() => useCampaignManager());
    const firstId = baseResult.current.availableEquipment()[0]?.id;
    if (!firstId) return; // Nothing to test

    const camp = makeCampaign({
      id: 'camp-1',
      name: 'Filtered',
      allowedEquipmentIds: [firstId],
    });
    seedStorage([camp]);
    const { result } = renderHook(() => useCampaignManager());
    act(() => { result.current.setActiveCampaign('camp-1'); });
    const filtered = result.current.availableEquipment();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(firstId);
  });
});

// ── getSpellListsForClass / getClassSpellSlots ────────────────────────────────

describe('useCampaignManager — spell helpers', () => {
  it('getSpellListsForClass returns an array of spell arrays for a spellcasting class', () => {
    const { result } = renderHook(() => useCampaignManager());
    const classes = result.current.availableClasses();
    const mu = classes.find((c) => c.name === 'Magic-User')!;
    const lists = result.current.getSpellListsForClass(mu);
    expect(Array.isArray(lists)).toBe(true);
    expect(lists.length).toBeGreaterThan(0);
    expect(Array.isArray(lists[0])).toBe(true);
  });

  it('getSpellListsForClass returns empty arrays for a non-spellcasting class', () => {
    const { result } = renderHook(() => useCampaignManager());
    const classes = result.current.availableClasses();
    const fighter = classes.find((c) => c.name === 'Fighter')!;
    const lists = result.current.getSpellListsForClass(fighter);
    // Either empty outer array or all inner arrays are empty
    const hasSpells = lists.some((tier) => tier.length > 0);
    expect(hasSpells).toBe(false);
  });

  it('getClassSpellSlots returns correct slots using campaign spellSlotTables', () => {
    const { result } = renderHook(() => useCampaignManager());
    const classes = result.current.availableClasses();
    const mu = classes.find((c) => c.name === 'Magic-User')!;
    const slots = result.current.getClassSpellSlots(mu, 1);
    expect(slots).toEqual(mu.getSpellSlotsAtLevel(1, result.current.spellSlotTables));
  });
});
