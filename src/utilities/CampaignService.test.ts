import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAMPAIGNS_STORAGE, DEFAULT_CAMPAIGN_ID } from '../constants/constants';
import { CampaignService } from './CampaignService';

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

// ── loadAll ───────────────────────────────────────────────────────────────────

describe('CampaignService.loadAll', () => {
  it('returns the default campaign when storage is empty', () => {
    const campaigns = CampaignService.loadAll();
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0].id).toBe(DEFAULT_CAMPAIGN_ID);
    expect(campaigns[0].name).toBe('Default');
  });

  it('inserts the default campaign at index 0 when it is missing', () => {
    const custom = { id: 'camp-1', name: 'My Campaign', notes: '', allowedClassNames: null, allowedEquipmentIds: null, allowedWeaponIds: null, allowedSpellIds: {}, allowAdvancedClasses: null, allowCarcassClasses: null, allowNonBxEquipment: null, customClasses: [], customSpellLists: [], customEquipment: [], customWeapons: [], customSpells: {}, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    localStorage.setItem(CAMPAIGNS_STORAGE, JSON.stringify([custom]));
    const campaigns = CampaignService.loadAll();
    expect(campaigns[0].id).toBe(DEFAULT_CAMPAIGN_ID);
    expect(campaigns[1].id).toBe('camp-1');
  });

  it('does not duplicate the default campaign when it already exists', () => {
    const defaultCamp = CampaignService.loadAll();
    CampaignService.saveAll(defaultCamp);
    const second = CampaignService.loadAll();
    expect(second.filter((c) => c.id === DEFAULT_CAMPAIGN_ID)).toHaveLength(1);
  });

  it('returns just the default campaign when JSON in storage is corrupted', () => {
    localStorage.setItem(CAMPAIGNS_STORAGE, 'not-valid-json{{{');
    const campaigns = CampaignService.loadAll();
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0].id).toBe(DEFAULT_CAMPAIGN_ID);
  });
});

// ── save ──────────────────────────────────────────────────────────────────────

describe('CampaignService.save', () => {
  it('updates an existing campaign in place', () => {
    const campaign = CampaignService.create('Alpha');
    const updated = { ...campaign, name: 'Alpha Renamed' };
    CampaignService.save(updated);
    const result = CampaignService.loadById(campaign.id);
    expect(result?.name).toBe('Alpha Renamed');
  });

  it('appends a new campaign when it does not exist yet', () => {
    const before = CampaignService.loadAll().length;
    const now = new Date().toISOString();
    const newCamp = { id: 'brand-new', name: 'New', notes: '', allowedClassNames: null, allowedEquipmentIds: null, allowedWeaponIds: null, allowedSpellIds: {}, allowAdvancedClasses: null, allowCarcassClasses: null, allowNonBxEquipment: null, customClasses: [], customSpellLists: [], customEquipment: [], customWeapons: [], customSpells: {}, customSpellSlotTables: [], customMagicTypes: [], createdAt: now, updatedAt: now };
    CampaignService.save(newCamp);
    expect(CampaignService.loadAll()).toHaveLength(before + 1);
  });

  it('updates the updatedAt timestamp to the current time when saving', () => {
    const campaign = CampaignService.create('Beta');
    // Manually set an old updatedAt in storage so we can detect the update.
    const camps = CampaignService.loadAll();
    const idx = camps.findIndex((c) => c.id === campaign.id);
    camps[idx] = { ...camps[idx], updatedAt: '2000-01-01T00:00:00.000Z' };
    CampaignService.saveAll(camps);

    CampaignService.save({ ...campaign, name: 'Beta 2' });
    const result = CampaignService.loadById(campaign.id)!;
    expect(result.updatedAt).not.toBe('2000-01-01T00:00:00.000Z');
  });
});

// ── create ────────────────────────────────────────────────────────────────────

describe('CampaignService.create', () => {
  it('creates a campaign with the given name', () => {
    const campaign = CampaignService.create('Greyhawk');
    expect(campaign.name).toBe('Greyhawk');
  });

  it('persists the new campaign so loadAll returns it', () => {
    const campaign = CampaignService.create('Forgotten Realms');
    const all = CampaignService.loadAll();
    expect(all.some((c) => c.id === campaign.id)).toBe(true);
  });

  it('initialises all fields to safe defaults', () => {
    const campaign = CampaignService.create('Test');
    expect(campaign.allowedClassNames).toBeNull();
    expect(campaign.allowedEquipmentIds).toBeNull();
    expect(campaign.allowedSpellIds).toEqual({});
    expect(campaign.customClasses).toEqual([]);
    expect(campaign.customEquipment).toEqual([]);
  });
});

// ── loadById ──────────────────────────────────────────────────────────────────

describe('CampaignService.loadById', () => {
  it('returns the campaign when found', () => {
    const campaign = CampaignService.create('My World');
    expect(CampaignService.loadById(campaign.id)).not.toBeNull();
    expect(CampaignService.loadById(campaign.id)?.name).toBe('My World');
  });

  it('returns null when the id does not exist', () => {
    expect(CampaignService.loadById('nonexistent-id')).toBeNull();
  });
});

// ── delete ────────────────────────────────────────────────────────────────────

describe('CampaignService.delete', () => {
  it('removes a campaign by id', () => {
    const campaign = CampaignService.create('To Delete');
    CampaignService.delete(campaign.id);
    expect(CampaignService.loadById(campaign.id)).toBeNull();
  });

  it('does not delete the default campaign', () => {
    CampaignService.delete(DEFAULT_CAMPAIGN_ID);
    expect(CampaignService.loadById(DEFAULT_CAMPAIGN_ID)).not.toBeNull();
  });

  it('returns all remaining campaigns after deletion', () => {
    const c1 = CampaignService.create('Keep');
    const c2 = CampaignService.create('Remove');
    const remaining = CampaignService.delete(c2.id);
    expect(remaining.some((c) => c.id === c1.id)).toBe(true);
    expect(remaining.some((c) => c.id === c2.id)).toBe(false);
  });
});
