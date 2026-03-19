import { ClassOptions, type CharacterClassInput } from "../data/classOptionsData";
import type { LevelEntry } from "../data/levelProgressionData";
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
      spellSlotTableId: def.spellSlotTableId,
      canUseThiefTools: def.canUseThiefTools,
      abilities: def.abilities,
      languages: def.languages,
      link: "",
      levelProgression: { levels: def.levels },
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

  // Auto-spread all defined override fields (except structural keys) onto obj.
  const { type: _type, baseName: _base, levels: _lvls, ...fields } = def;
  const patch = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined),
  );
  Object.assign(obj, patch);

  // Override the level progression when custom levels are provided.
  if (def.levels !== undefined) {
    obj.levelProgression = { ...base.levelProgression, levels: def.levels as LevelEntry[] };
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