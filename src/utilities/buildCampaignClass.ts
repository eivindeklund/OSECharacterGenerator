import { ClassOptions } from "../data/classOptionsData";
import { getLevelEntry } from "../data/levelProgressionData";
import type {
    CampaignClassDefinition,
    CampaignClassOverride,
    CampaignLevelEntry,
    CampaignNewClass,
    ClassOptionsData,
} from "../types";

// ── Subclass for entirely new campaign-defined classes ────────────────────────

class CampaignNewClassOptions extends ClassOptions {
  private readonly _levels: CampaignLevelEntry[];

  constructor(def: CampaignNewClass) {
    // ClassOptionsInput is not exported; use cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    this._levels = def.levels;
  }

  private _entry(level: number): CampaignLevelEntry {
    const idx = Math.max(0, Math.min(level, this._levels.length) - 1);
    return (
      this._levels[idx] ??
      this._levels[0] ?? {
        level: 1,
        xp: 0,
        hdDice: 1,
        hdBonus: 0,
        thac0: 19,
        saves: [15, 16, 17, 18, 19] as [number, number, number, number, number],
      }
    );
  }

  getSavingThrowsAtLevel(level: number): [number, number, number, number, number] {
    return this._entry(level).saves;
  }

  getThac0AtLevel(level: number): number {
    return this._entry(level).thac0;
  }

  getSpellSlotsAtLevel(level: number): number[] {
    return this._entry(level).spellSlots ?? [];
  }

  isHdRollLevel(level: number): boolean {
    if (level <= 1) return false;
    return this._entry(level).hdDice > this._entry(level - 1).hdDice;
  }

  getHpBonusAtLevel(level: number): number {
    if (level <= 1) return 0;
    const prev = this._entry(level - 1);
    const curr = this._entry(level);
    if (curr.hdDice > prev.hdDice) return 0;
    return Math.max(0, curr.hdBonus - prev.hdBonus);
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

  // Always override the five level-entry methods to use baseName, so that
  // a renamed class still reads from the correct progression table.
  const baseName = def.baseName;
  const slotOverrides = def.spellSlotOverrides;

  obj.getSavingThrowsAtLevel = (level: number) => {
    const entry = getLevelEntry(baseName, level);
    return entry?.saves ?? base.getSavingThrowsAtLevel(level);
  };

  obj.getThac0AtLevel = (level: number) => {
    return getLevelEntry(baseName, level)?.thac0 ?? 19;
  };

  obj.getSpellSlotsAtLevel = (level: number) => {
    if (slotOverrides) {
      const idx = Math.max(0, level - 1);
      if (idx < slotOverrides.length) return slotOverrides[idx];
    }
    return getLevelEntry(baseName, level)?.spellSlots ?? [];
  };

  obj.isHdRollLevel = (level: number) => {
    if (level <= 1) return false;
    const prev = getLevelEntry(baseName, level - 1);
    const curr = getLevelEntry(baseName, level);
    return curr.hdDice > prev.hdDice;
  };

  obj.getHpBonusAtLevel = (level: number) => {
    if (level <= 1) return 0;
    const prev = getLevelEntry(baseName, level - 1);
    const curr = getLevelEntry(baseName, level);
    if (curr.hdDice > prev.hdDice) return 0;
    return Math.max(0, curr.hdBonus - prev.hdBonus);
  };

  return obj;
}

// ── Public factory ────────────────────────────────────────────────────────────

/**
 * Build a `ClassOptionsData`-compatible object from a campaign class definition.
 *
 * For `CampaignNewClass`: returns a fully functional subclass of `ClassOptions`
 * whose level-entry methods read from the inline `levels[]` array.
 *
 * For `CampaignClassOverride`: returns an object that prototypally inherits
 * from the base class, with patched fields and overridden level-entry methods
 * that look up by `baseName` so renames don't break the progression table.
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
