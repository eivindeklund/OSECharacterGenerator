import { spellNameToId } from "../data/spells";
import type { CharacterStatistics, StoredCharacterData } from "../types";

/**
 * Converts a spell string that may be either a spell name (legacy) or a spell id (current)
 * into the canonical spell id. If the value is already a known id, it is returned unchanged.
 * If it matches a known name, the corresponding id is returned. Otherwise the value is
 * returned as-is so that unknown/custom values are not silently discarded.
 */
function toSpellId(value: string): string {
  // Already an id (all lowercase, no spaces) that exists in our id map
  // — check via the inverse name map to avoid importing allSpellsById separately.
  if (spellNameToId[value] === undefined && /^[a-z0-9-]+$/.test(value)) {
    // Looks like an id already; keep it.
    return value;
  }
  return spellNameToId[value] ?? value;
}

/**
 * The raw shape that may arrive from localStorage or a URL-share param —
 * mirrors StoredCharacterData but allows missing / legacy fields that
 * existed in older save formats.
 */
type RawCharacterStatistics = Omit<CharacterStatistics, 'level'> & {
  /** @deprecated Singular spell field from saves before the spells[] array existed. */
  spell?: string | null;
  /** Missing in very old saves; defaults to 1. */
  level?: number;
  /** May be missing in saves predating the spells[] array. */
  spells?: string[];
};

type RawStoredCharacterData = Omit<StoredCharacterData, 'characterStatistics'> & {
  characterStatistics: RawCharacterStatistics;
};

/**
 * Normalises a raw `CharacterStatistics` object (as stored on disk) to the
 * current canonical in-memory format.
 *
 * Migrations applied:
 * - `spell` (string | null) → migrated into `spells[0]` when `spells` is empty.
 * - `level` (missing / undefined) → defaulted to `1`.
 *
 * Add future migrations here. Downstream code can assume it will never see
 * legacy fields after data passes through this function.
 */
export function normalizeCharacterStatistics(raw: RawCharacterStatistics): CharacterStatistics {
  const { spell, ...rest } = raw;
  const rawSpells: string[] = (rest.spells && rest.spells.length > 0)
    ? rest.spells
    : (spell ? [spell] : []);
  // Migrate each spell: convert names from old saves to canonical ids.
  const spells = rawSpells.map(toSpellId);
  return {
    ...rest,
    level: rest.level ?? 1,
    spells,
  };
}

/**
 * Normalises a full `StoredCharacterData` record loaded from an external
 * source (localStorage, URL share param) to the current canonical format.
 *
 * This is the single entry-point for all save-format migrations. Call it
 * at every point where character data re-enters the application from
 * outside (storage services, share URL decompression). Do NOT add
 * migration logic elsewhere.
 */
export function normalizeStoredCharacter(raw: RawStoredCharacterData): StoredCharacterData {
  return {
    ...raw,
    characterStatistics: normalizeCharacterStatistics(raw.characterStatistics),
  } as StoredCharacterData;
}
