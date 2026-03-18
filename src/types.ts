
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
  /** Stable kebab-case identifier (e.g. "magic-missile"). Stored in saved character data. */
  id: string;
  name: string;
  /** Compact at-the-table summary (damage, target, save, key effect). Present for all spells. */
  shortDesc?: string;
  /** Spell duration (e.g. "2 turns", "Permanent", "Concentration"). */
  duration?: string;
  /** Spell range (e.g. "120'", "Touch", "0 (self)"). */
  range?: string;
  /**
   * How combat-relevant this spell is, on a 1–5 scale.
   *   1 = out-of-combat only   2 = mostly out of combat
   *   3 = both combat and out-of-combat   4 = mostly combat
   *   5 = combat only
   * Used to filter spell descriptions on cramped sheets and to generate playbooks.
   */
  combatUse?: 1 | 2 | 3 | 4 | 5;
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
  spellListId?: string;
  magicTypeId?: string;
  limitedSpellSelection?: boolean;
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

// ── Equipment Item ────────────────────────────────────────────────────────────

export interface EquipmentItem {
  id: string;
  name: string;
  price: number;
  category: string;
  in_bx_basic?: boolean;
  in_bx_expert?: boolean;
}

// ── Weapon Item ───────────────────────────────────────────────────────────────

export interface WeaponItem {
  id: string;
  name: string;
  category: string;
  price: number;
  weight: number;
  damage: string;
  qualities: string[];
}

// ── Campaign Spell List ───────────────────────────────────────────────────────

export interface CampaignSpellList {
  id: string;
  name: string;
  spells: { [level: number]: SpellDefinition[] };
}

// ── Campaign Level Entry ──────────────────────────────────────────────────────

/** Mirrors LevelEntry from levelProgressionData for use in campaign class definitions. */
export interface CampaignLevelEntry {
  level: number;
  xp: number;
  hdDice: number;
  hdBonus: number;
  thac0: number;
  saves: [number, number, number, number, number];
  spellSlots?: number[];
}

// ── Campaign Class Definitions ────────────────────────────────────────────────

export interface CampaignClassOverride {
  type: 'override';
  /** Exact name of the existing class to override. */
  baseName: string;
  name?: string;
  category?: string;
  description?: string;
  armour?: string;
  weapons?: string;
  hd?: number;
  maxLevel?: number;
  requirements?: string | null;
  primeReqs?: string[];
  xpBonusRule?: string;
  spellListId?: string;
  magicTypeId?: string;
  limitedSpellSelection?: boolean;
  abilities?: ClassAbility[];
  /** Spell slot table override: index = level−1, value = slots per spell level. */
  spellSlotOverrides?: number[][];
}

export interface CampaignNewClass {
  type: 'new';
  name: string;
  category: 'basic' | 'advanced' | 'carcass' | 'custom';
  description: string;
  armour: string;
  weapons: string;
  hd: number;
  maxLevel: number;
  requirements: string | null;
  primeReqs: string[];
  xpBonusRule?: string;
  spellListId?: string;
  magicTypeId?: string;
  limitedSpellSelection?: boolean;
  abilities: ClassAbility[];
  /** Full level progression table (one entry per level, 1-indexed). */
  levels: CampaignLevelEntry[];
}

export type CampaignClassDefinition = CampaignClassOverride | CampaignNewClass;

// ── Campaign ──────────────────────────────────────────────────────────────────

export interface CampaignAllowedSpells {
  [spellListId: string]: string[] | null | undefined;
}

export interface CampaignCustomSpells {
  [spellListId: string]: { [spellLevel: number]: SpellDefinition[] } | undefined;
}

export interface Campaign {
  id: string;
  name: string;
  notes: string;
  allowedClassNames: string[] | null;
  allowedEquipmentIds: string[] | null;
  allowedWeaponIds: string[] | null;
  allowedSpellIds: CampaignAllowedSpells;
  /** null = player controls; false = always deny (section hidden); true = always show (checkbox hidden) */
  allowAdvancedClasses: boolean | null;
  allowCarcassClasses: boolean | null;
  /** null = player controls B/X checkbox; false = force B/X only; true = force all equipment shown */
  allowNonBxEquipment: boolean | null;
  customClasses: CampaignClassDefinition[];
  customSpellLists: CampaignSpellList[];
  customEquipment: EquipmentItem[];
  customWeapons: WeaponItem[];
  customSpells: CampaignCustomSpells;
  createdAt: string;
  updatedAt: string;
}

// ── Stored Character ──────────────────────────────────────────────────────────

export interface StoredCharacterData {
  character: Character;
  characterStatistics: CharacterStatistics;
  characterClass: ClassOptionsData;
  characterEquipment: CharacterEquipment;
  characterModifiers: CharacterModifiers;
  abilityScores: AbilityScores;
  /** Campaign this character belongs to. Defaults to "default". */
  campaignId: string;
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
