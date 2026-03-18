import { ClassOptions, type CharacterClassInput } from "../data/classOptionsData";
import type {
  CampaignClassDefinition,
  CampaignClassOverride,
  CampaignNewClass,
  ClassOptionsData,
} from "../types";

// ── Subclass for entirely new campaign-defined classes ────────────────────────

class CampaignNewClassOptions extends ClassOptions {
  constructor(def: CampaignNewClass) {
    super({
      name: def.name,
      category: def.category,
      description: def.description,
      armour: def.armour,
      weapons: def.weapons,
      hd: def.hd,
      maxLevel: def.maxLevel,
      requirements: def.requirements,
      primeReqs: def.primeReqs,
      xpBonusRule: def.xpBonusRule,
      spellListId: def.spellListId,
      magicTypeId: def.magicTypeId,
      limitedSpellSelection: def.limitedSpellSelection,
      abilities: def.abilities,
      languages: "",
      savingThrows: (def.levels[0]?.saves ?? [15, 16, 17, 18, 19]) as number[],
      nextLevel: def.levels[1]?.xp ?? 2000,
      link: "",
      levelProgression: { levels: def.levels, spellSlotTableId: def.spellSlotTableId },
    } as CharacterClassInput);
  }
}

// ── Override wrapper for existing campaign classes ────────────────────────────

function buildOverrideClass(
  base: ClassOptionsData,
  def: CampaignClassOverride,
): ClassOptionsData {
  // Prototypally extend the base so all existing method implementations are
  // inherited. Own instance properties (set by ClassOptions constructor) are
  // looked up through the prototype chain before ClassOptions.prototype.
  const obj = Object.create(base) as ClassOptionsData;

  // Apply plain-data overrides as own properties on obj.
  const patch: Partial<ClassOptionsData> = {};
  if (def.name !== undefined) patch.name = def.name;
  if (def.category !== undefined) patch.category = def.category;
  if (def.description !== undefined) patch.description = def.description;
  if (def.armour !== undefined) patch.armour = def.armour;
  if (def.weapons !== undefined) patch.weapons = def.weapons;
  if (def.hd !== undefined) patch.hd = def.hd;
  if (def.maxLevel !== undefined) patch.maxLevel = def.maxLevel;
  if (def.requirements !== undefined) patch.requirements = def.requirements;
  if (def.primeReqs !== undefined) patch.primeReqs = def.primeReqs;
  if (def.xpBonusRule !== undefined) patch.xpBonusRule = def.xpBonusRule;
  if (def.spellListId !== undefined) patch.spellListId = def.spellListId;
  if (def.magicTypeId !== undefined) patch.magicTypeId = def.magicTypeId;
  if (def.limitedSpellSelection !== undefined) patch.limitedSpellSelection = def.limitedSpellSelection;
  if (def.abilities !== undefined) patch.abilities = def.abilities;
  Object.assign(obj, patch);

  // Override the spell slot table ID if a custom table is requested.
  if (def.spellSlotTableId !== undefined) {
    obj.levelProgression = { ...base.levelProgression, spellSlotTableId: def.spellSlotTableId };
  }

  return obj;
}

// ── Public factory ────────────────────────────────────────────────────────────

/**
 * Build a `ClassOptionsData`-compatible object from a campaign class definition.
 *
 * For `CampaignNewClass`: returns a fully functional subclass of `ClassOptions`
 * whose level-entry methods read from the inline `levels[]` array stored in
 * `levelProgression`. Spell slots are looked up at call time by passing
 * `spellSlotTables` to `getSpellSlotsAtLevel`.
 *
 * For `CampaignClassOverride`: returns an object that prototypally inherits
 * from the base class, with patched fields; if `spellSlotTableId` is given,
 * `levelProgression.spellSlotTableId` is updated so that callers who pass
 * `spellSlotTables` to `getSpellSlotsAtLevel` get the custom table.
 *
 * Returns `null` when a `CampaignClassOverride` references an unknown base class.
 */
export function buildCampaignClass(
  def: CampaignClassDefinition,
  baseClasses: ClassOptionsData[],
): ClassOptionsData | null {
  if (def.type === "new") {
    return new CampaignNewClassOptions(def);
  }
  const base = baseClasses.find((c) => c.name === def.baseName);
  if (!base) return null;
  return buildOverrideClass(base, def);
}