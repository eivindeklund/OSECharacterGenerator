import { ClassOptions, type CharacterClassInput } from "../data/classOptionsData";
import type { LevelEntry } from "../data/levelProgressionData";
import type {
  CampaignClassDefinition,
  CampaignNewClass,
  ClassOptionsData
} from "../types";

// ── Level resolution ──────────────────────────────────────────────────────────

/**
 * Resolves the level progression entries for a new campaign class.
 * Uses `def.levels` if provided, otherwise looks up the base class by
 * `def.baseLevelProgressionId`. Throws if neither is set or the id is unknown.
 */
function resolveLevelsForNewClass(
  def: CampaignNewClass,
  baseClasses: ClassOptionsData[],
): LevelEntry[] {
  if (def.levels) return def.levels as LevelEntry[];
  if (def.baseLevelProgressionId !== undefined) {
    const base = baseClasses.find((c) => c.name === def.baseLevelProgressionId);
    if (base) return base.levelProgression.levels;
    throw new Error(
      `baseLevelProgressionId "${def.baseLevelProgressionId}" not found in base classes`,
    );
  }
  throw new Error(
    `CampaignNewClass "${def.name}" must provide either levels or baseLevelProgressionId`,
  );
}

// ── Public factory ────────────────────────────────────────────────────────────

/**
 * Build a `ClassOptionsData`-compatible object from a campaign class definition.
 *
 * For `CampaignNewClass`: constructs a new `ClassOptions` instance using the
 * supplied level table (`levels`) or the progression inherited from `baseLevelProgressionId`.
 * Spell slots are looked up at call time by passing `spellSlotTables` to
 * `getSpellSlotsAtLevel`.
 *
 * For `CampaignClassOverride`: constructs a new `ClassOptions` instance whose
 * data fields are merged from the base class and the override patch. No mutable
 * state is shared with the original base class or sibling overrides.
 *
 * Returns `null` when a `CampaignClassOverride` references an unknown base class.
 */
export function buildCampaignClass(
  def: CampaignClassDefinition,
  baseClasses: ClassOptionsData[],
): ClassOptionsData | null {
  if (def.type === "new") {
    const { type: _type, levels: _levels, baseLevelProgressionId: _bId, ...defData } = def;
    const resolvedLevels = resolveLevelsForNewClass(def, baseClasses);
    return new ClassOptions({
      ...defData,
      link: "",
      levelProgression: { levels: resolvedLevels },
    } as CharacterClassInput);
  }

  const base = baseClasses.find((c) => c.name === def.baseName);
  if (!base) return null;

  const { type: _type, baseName: _base, levels, ...fields } = def;
  const patch = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined),
  );
  const levelProgression =
    levels !== undefined
      ? { ...base.levelProgression, levels: levels as LevelEntry[] }
      : base.levelProgression;

  return new ClassOptions({ ...base, ...patch, levelProgression } as CharacterClassInput);
}