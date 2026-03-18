import { useState } from "react";
import { DEFAULT_CAMPAIGN_ID } from "../constants/constants";
import classOptionsData from "../data/classOptionsData";
import equipmentData from "../data/equipmentData";
import weaponsData from "../data/weaponsData";
import type {
        Campaign,
        CampaignClassOverride,
        CampaignNewClass,
        ClassOptionsData,
        EquipmentItem,
        SpellDefinition,
        WeaponItem,
} from "../types";
import { getSpellListById } from "../data/spells";
import { buildCampaignClass } from "../utilities/buildCampaignClass";
import { CampaignService } from "../utilities/CampaignService";

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    CampaignService.loadAll(),
  );
  const [activeCampaignId, setActiveCampaignIdState] = useState<string | null>(
    null,
  );

  const activeCampaign: Campaign = (() => {
    const id = activeCampaignId ?? DEFAULT_CAMPAIGN_ID;
    const found = campaigns.find((c) => c.id === id);
    if (found) return found;
    // The ID is set but does not exist in the campaigns list — return a recovery object.
    const now = new Date().toISOString();
    return {
      id,
      name: "Recovery Campaign",
      notes: "Error: this campaign could not be found. Please select a valid campaign.",
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
  })();

  // ── CRUD actions ───────────────────────────────────────────────────────────

  const setActiveCampaign = (id: string | null) => {
    setActiveCampaignIdState(id);
  };

  const createCampaign = (name: string): Campaign => {
    const created = CampaignService.create(name);
    setCampaigns(CampaignService.loadAll());
    return created;
  };

  const updateCampaign = (campaign: Campaign): void => {
    CampaignService.save(campaign);
    setCampaigns(CampaignService.loadAll());
  };

  const deleteCampaign = (id: string): void => {
    CampaignService.delete(id);
    setCampaigns(CampaignService.loadAll());
    if (activeCampaignId === id) setActiveCampaignIdState(null);
  };

  // ── Derived getters ────────────────────────────────────────────────────────

  /**
   * Returns the list of classes available for character creation in the
   * active campaign. Applies overrides, adds new classes, and filters by
   * allowedClassNames.
   */
  const availableClasses = (): ClassOptionsData[] => {
    const base = classOptionsData as ClassOptionsData[];
    const campaign = activeCampaign;

    const overrides = campaign.customClasses.filter(
      (c): c is CampaignClassOverride => c.type === "override",
    );
    const newClasses = campaign.customClasses.filter(
      (c): c is CampaignNewClass => c.type === "new",
    );

    // Apply overrides to base classes.
    let result: ClassOptionsData[] = base.map((cls) => {
      const override = overrides.find((o) => o.baseName === cls.name);
      if (override) return buildCampaignClass(override, base) ?? cls;
      return cls;
    });

    // Append entirely new classes.
    for (const def of newClasses) {
      const built = buildCampaignClass(def, base);
      if (built) result.push(built);
    }

    // Filter by allowedClassNames (applied after overrides so renamed classes match).
    if (campaign.allowedClassNames !== null) {
      const allowed = new Set(campaign.allowedClassNames);
      result = result.filter((c) => allowed.has(c.name));
    }

    return result;
  };

  /**
   * Returns the equipment available in the active campaign, including custom
   * equipment and filtered by allowedEquipmentIds.
   */
  const availableEquipment = (): EquipmentItem[] => {
    const campaign = activeCampaign;
    let base = equipmentData as EquipmentItem[];

    if (campaign.allowedEquipmentIds !== null) {
      const allowed = new Set(campaign.allowedEquipmentIds);
      base = base.filter((i) => allowed.has(i.id));
    }

    return [...base, ...campaign.customEquipment];
  };

  /**
   * Returns the weapons available in the active campaign, including custom
   * weapons and filtered by allowedWeaponIds.
   */
  const availableWeapons = (): WeaponItem[] => {
    const campaign = activeCampaign;
    let base = weaponsData as WeaponItem[];

    if (campaign.allowedWeaponIds !== null) {
      const allowed = new Set(campaign.allowedWeaponIds);
      base = base.filter((w) => allowed.has(w.id));
    }

    return [...base, ...campaign.customWeapons];
  };

  /**
   * Returns the spell lists (grouped by spell level, 0-indexed) available for
   * the given class in the active campaign.
   *
   * - If a campaign custom spell list matches `cls.spellListId`, it is used as the base.
   * - Otherwise the standard built-in list from the SPELL_LIST_REGISTRY is used.
   * - Spells are filtered by `allowedSpellIds` for that spell list id.
   * - Custom spells from `customSpells` are appended.
   */
  const getSpellListsForClass = (cls: ClassOptionsData): SpellDefinition[][] => {
    const campaign = activeCampaign;

    if (!cls.spellListId) return [];

    const spellListId = cls.spellListId;

    // Determine base spell lists.
    let byLevel: SpellDefinition[][];
    const customList = campaign.customSpellLists.find((l) => l.id === spellListId);
    if (customList) {
      const maxLevel = Math.max(...Object.keys(customList.spells).map(Number), 0);
      byLevel = Array.from({ length: maxLevel }, (_, i) => [
        ...(customList.spells[i + 1] ?? []),
      ]);
    } else {
      const registryEntry = getSpellListById(spellListId);
      if (!registryEntry) {
        throw new Error(`Spell list "${spellListId}" not found in SPELL_LIST_REGISTRY`);
      }
      byLevel = registryEntry.byLevel.map((s) => [...s]) as SpellDefinition[][];
    }

    // Filter by allowedSpellIds.
    const allowed = campaign.allowedSpellIds[spellListId];
    if (allowed !== null && allowed !== undefined) {
      const allowedSet = new Set(allowed);
      byLevel = byLevel.map((spells) => spells.filter((s) => allowedSet.has(s.id)));
    }

    // Append custom spells.
    const customForType = campaign.customSpells[spellListId];
    if (customForType) {
      byLevel = byLevel.map((spells, i) => {
        const extra = customForType[i + 1] ?? [];
        return [...spells, ...(extra as SpellDefinition[])];
      });
    }

    return byLevel;
  };

  /**
   * Returns the spell slot counts for the given class at the given character
   * level, respecting any campaign spell slot overrides applied via
   * `buildCampaignClass`.
   */
  const getClassSpellSlots = (cls: ClassOptionsData, charLevel: number): number[] => {
    return cls.getSpellSlotsAtLevel(charLevel);
  };

  // ── Active campaign convenience properties ─────────────────────────────────

  /** The ID to stamp on newly created characters. */
  const activeCharacterCampaignId = activeCampaign.id;

  return {
    campaigns,
    activeCampaign,
    activeCampaignId,
    activeCharacterCampaignId,
    setActiveCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    availableClasses,
    availableEquipment,
    availableWeapons,
    getSpellListsForClass,
    getClassSpellSlots,
  };
}
