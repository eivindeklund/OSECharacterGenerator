
// ── Ability Scores ────────────────────────────────────────────────────────────

export interface AbilityScores {
  strength: number | null;
  intelligence: number | null;
  wisdom: number | null;
  dexterity: number | null;
  constitution: number | null;
  charisma: number | null;
  [key: string]: number | null;
}

// ── Ability Scores That Can Decrease ────────────────────────────────────────────

export interface AbilityScoresThatCanDecrease {
  strength: boolean;
  intelligence: boolean;
  wisdom: boolean;
  dexterity: boolean;
  constitution: boolean;
  charisma: boolean;
  [key: string]: boolean;
}

// ── Character Modifiers ───────────────────────────────────────────────────────

export interface CharacterModifiers {
  xpModifierPercentage: string;
  strengthModMelee: string;
  strengthModDoors: string;
  intelligenceModLanguages: string;
  intelligenceModLiteracy: string;
  intelligenceModExtraLanguageCount: string;
  extraLanguageCount?: string;
  wisdomMod: string;
  dexterityModAC: string;
  dexterityModMissiles: string;
  dexterityModInitiative: string;
  constitutionMod: string;
  charismaModNPCReactions: string;
  charismaModRetainersMax: string;
  charismaModLoyalty: string;
  [key: string]: string | undefined;
}

// ── Character Statistics ──────────────────────────────────────────────────────

export interface CharacterStatistics {
  hitPoints: number | null;
  hpRolls: number;
  hpResult: number | null;
  /** Canonical seed (1–120) used to derive hpResult for any hit die size. */
  hpSeed: number | null;
  armourClass: number | null;
  hasSpells: boolean;
  unarmouredAC: number | null;
  /** Current character level (1-based). */
  level: number;
  /** All spells known by the character (spell book entries for arcane casters). */
  spells: string[];
}

// ── Character ─────────────────────────────────────────────────────────────────

export interface Character {
  id: string | null;
  name: string | null;
  languages: string[];
  hasLanguages: boolean | null;
  personality: string | null;
  misfortune: string | null;
  appearance: string | null;
  backgroundSkill: string | null;
  alignment: string | null;
  background?: string | null;
  description?: string | null;
  gender?: "male" | "female" | "neutral";
}

// ── Ability Requirement ───────────────────────────────────────────────────────

export interface AbilityRequirement {
  ability: string;
  minimum: number;
}

// ── Spell Definition ─────────────────────────────────────────────────────────

export interface SpellDefinition {
  name: string;
  /**
   * Compact at-the-table combat reference (damage dice, target, save, key effect).
   * Absent for non-combat utility spells.
   */
  combatInfo?: string;
}

// ── Class Ability ─────────────────────────────────────────────────────────────

export interface ClassAbility {
  id?: string;
  name: string;
  description?: string;
  /** Level-aware description; overrides `description` when present. */
  getDescription?: (level: number) => string;
  /** Only show this ability at or above this level (default: 1). */
  minLevel?: number;
  /** Set to false to keep in data for logic checks (e.g. PDF export) but hide from displayed lists. Default: true. */
  shownInList?: boolean;
}

// ── Class Options ─────────────────────────────────────────────────────────────

export interface ClassOptionsData {
  name: string;
  category: string;
  requirements: string | null;
  primeReqs: string[];
  hd: number;
  maxLevel: number;
  armour: string;
  // TODO: This should be typed in a way that only allow the appropriate armour ids.
  allowedArmour: string[];
  weapons: string;
  canUseThiefTools?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canUseWeapon: (w?: any) => boolean;
  languages: string;
  description: string;
  savingThrows: number[];
  nextLevel: number;
  abilities: ClassAbility[];
  link: string;
  arcane: boolean;
  divine: boolean;
  arcaneSpells?: boolean;
  druidSpells?: boolean;
  illusionistSpells?: boolean;
  necromancerSpells?: boolean;
  runesmithSpells?: boolean;
  divineSpells?: boolean;
  xpBonusRule?: string;
  xpModifierPercentage: (abilityScoreValues: AbilityScores) => string;
  checkAbilityScoreRequirements: (abilityScores: AbilityScores) => boolean;
  getSavingThrowsAtLevel: (level: number) => [number, number, number, number, number];
  getThac0AtLevel: (level: number) => number;
  getSpellSlotsAtLevel: (level: number) => number[];
  isHdRollLevel: (level: number) => boolean;
  getHpBonusAtLevel: (level: number) => number;
}

// ── Character Equipment ───────────────────────────────────────────────────────

export interface CharacterEquipment {
  armour: string[];
  weapons: string[];
  adventuringGear: string[];
  gold: number | null;
}

// ── Stored Character ──────────────────────────────────────────────────────────

export interface StoredCharacterData {
  character: Character;
  characterStatistics: CharacterStatistics;
  characterClass: ClassOptionsData;
  characterEquipment: CharacterEquipment;
  characterModifiers: CharacterModifiers;
  abilityScores: AbilityScores;
  /** True for in-progress characters that haven't been saved to the tavern yet */
  partial?: boolean;
}

// ── Score Actions ─────────────────────────────────────────────────────────────

export interface ScoreActions {
  rollAttribute: (
    attrOrEvent: string | React.ChangeEvent<HTMLInputElement>,
    optionalInput?: string
  ) => void;
  scoreIncrease: (key: string) => void;
  scoreDecrease: (key: string) => void;
}

// ── Dice ──────────────────────────────────────────────────────────────────────

export interface DiceState {
  diceEnabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diceService: any;
}
