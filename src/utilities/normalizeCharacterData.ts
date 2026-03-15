import type { CharacterStatistics, StoredCharacterData } from "../types";

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
  const spells: string[] = (rest.spells && rest.spells.length > 0)
    ? rest.spells
    : (spell ? [spell] : []);
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
