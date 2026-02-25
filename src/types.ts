
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
  armourClass: number | null;
  spell: string | null;
  hasSpells: boolean;
  unarmouredAC: number | null;
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

// ── Class Options ─────────────────────────────────────────────────────────────

export interface ClassOptionsData {
  name: string;
  category: string;
  requirements: string | null;
  primeReqs: string[];
  hd: number;
  maxLevel: number;
  armour: string;
  weapons: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isStandardWeapon: (w?: any) => boolean;
  languages: string;
  description: string;
  savingThrows: number[];
  nextLevel: number;
  abilities: string[];
  link: string;
  arcane: boolean;
  divine: boolean;
  arcaneSpells?: boolean;
  druidSpells?: boolean;
  illusionistSpells?: boolean;
  necromancerSpells?: boolean;
  runesmithSpells?: boolean;
  divineSpells?: boolean;
  xpBonusFromPrimeRequirements?: (a: number, b: number) => number;
  xpModifierPercentage: (abilityScoreValues: AbilityScores) => string;
  checkAbilityScoreRequirements: (abilityScores: AbilityScores) => boolean;
}

// ── Screen State ──────────────────────────────────────────────────────────────

export interface ScreenState {
  equipmentScreen: boolean;
  abilityScreen: boolean;
  classScreen: boolean;
  detailsScreen: boolean;
  characterSheetScreen: boolean;
  characterStorageScreen: boolean;
  [key: string]: boolean;
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
