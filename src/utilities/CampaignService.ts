import { CAMPAIGNS_STORAGE, DEFAULT_CAMPAIGN_ID } from "../constants/constants";
import type { Campaign } from "../types";

function createDefaultCampaign(): Campaign {
  const now = new Date().toISOString();
  return {
    id: DEFAULT_CAMPAIGN_ID,
    name: "Default",
    notes: "",
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
    customMagicTypes: [],
    createdAt: now,
    updatedAt: now,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClassDef(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const out = { ...raw };
  if (out.spellListId === undefined && out.magicTypeId === undefined) {
    if (out.runesmithSpells) {
      out.spellListId = 'runesmith'; out.magicTypeId = 'rune'; out.limitedSpellSelection = true;
    } else if (out.illusionistSpells) {
      out.spellListId = 'illusionist'; out.magicTypeId = 'arcane'; out.limitedSpellSelection = true;
    } else if (out.necromancerSpells) {
      out.spellListId = 'necromancer'; out.magicTypeId = 'arcane'; out.limitedSpellSelection = true;
    } else if (out.druidSpells) {
      out.spellListId = 'druid'; out.magicTypeId = 'divine'; out.limitedSpellSelection = true;
    } else if (out.divineSpells) {
      out.spellListId = 'cleric'; out.magicTypeId = 'divine'; out.limitedSpellSelection = false;
    } else if (out.arcaneSpells) {
      out.spellListId = 'magic-user'; out.magicTypeId = 'arcane'; out.limitedSpellSelection = true;
    } else if (out.arcane) {
      out.magicTypeId = 'arcane'; out.limitedSpellSelection ??= false;
    } else if (out.divine) {
      out.magicTypeId = 'divine'; out.limitedSpellSelection ??= false;
    }
  }
  delete out.arcane; delete out.divine;
  delete out.arcaneSpells; delete out.druidSpells;
  delete out.illusionistSpells; delete out.necromancerSpells;
  delete out.runesmithSpells; delete out.divineSpells;
  delete out.customSpellListId;
  return out;
}

function normalizeCampaign(raw: Campaign): Campaign {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out = { ...raw } as any;
  out.customClasses = (out.customClasses ?? []).map(normalizeClassDef);
  out.customMagicTypes ??= [];
  if (out.allowedSpellIds && 'magicUser' in out.allowedSpellIds) {
    out.allowedSpellIds = { ...out.allowedSpellIds, 'magic-user': out.allowedSpellIds.magicUser };
    delete out.allowedSpellIds.magicUser;
  }
  if (out.customSpells && 'magicUser' in out.customSpells) {
    out.customSpells = { ...out.customSpells, 'magic-user': out.customSpells.magicUser };
    delete out.customSpells.magicUser;
  }
  return out as Campaign;
}

export const CampaignService = {
  loadAll(): Campaign[] {
    try {
      const data = window.localStorage.getItem(CAMPAIGNS_STORAGE);
      const campaigns: Campaign[] = data ? (JSON.parse(data) as Campaign[]).map(normalizeCampaign) : [];
      // Always ensure the default campaign exists at index 0.
      if (!campaigns.some((c) => c.id === DEFAULT_CAMPAIGN_ID)) {
        campaigns.unshift(createDefaultCampaign());
        CampaignService.saveAll(campaigns);
      }
      return campaigns;
    } catch (e) {
      console.error("Failed to load campaigns from storage", e);
      return [createDefaultCampaign()];
    }
  },

  saveAll(campaigns: Campaign[]): void {
    try {
      window.localStorage.setItem(CAMPAIGNS_STORAGE, JSON.stringify(campaigns));
    } catch (e) {
      console.error("Failed to save campaigns to storage", e);
    }
  },

  loadById(id: string): Campaign | null {
    return CampaignService.loadAll().find((c) => c.id === id) ?? null;
  },

  save(campaign: Campaign): Campaign[] {
    const campaigns = CampaignService.loadAll();
    const idx = campaigns.findIndex((c) => c.id === campaign.id);
    const updated: Campaign = { ...campaign, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      campaigns[idx] = updated;
    } else {
      campaigns.push(updated);
    }
    CampaignService.saveAll(campaigns);
    return campaigns;
  },

  create(name: string): Campaign {
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      notes: "",
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
      customMagicTypes: [],
      createdAt: now,
      updatedAt: now,
    };
    CampaignService.save(campaign);
    return campaign;
  },

  /** Delete a campaign by id. The Default campaign cannot be deleted. */
  delete(id: string): Campaign[] {
    if (id === DEFAULT_CAMPAIGN_ID) return CampaignService.loadAll();
    const campaigns = CampaignService.loadAll().filter((c) => c.id !== id);
    CampaignService.saveAll(campaigns);
    return campaigns;
  },
};
