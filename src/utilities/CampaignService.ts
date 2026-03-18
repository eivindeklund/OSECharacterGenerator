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
    createdAt: now,
    updatedAt: now,
  };
}

export const CampaignService = {
  loadAll(): Campaign[] {
    try {
      const data = window.localStorage.getItem(CAMPAIGNS_STORAGE);
      const campaigns: Campaign[] = data ? JSON.parse(data) : [];
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
