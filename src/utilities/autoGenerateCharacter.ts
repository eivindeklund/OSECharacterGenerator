import { v4 as uuidv4 } from 'uuid';
import { firstNames, lastNames, DEFAULT_CAMPAIGN_ID } from '../constants/constants';
import type { AbilityScores, ClassOptionsData, SpellDefinition, StoredCharacterData } from '../types';
import { generateDescriptionTemplate, renderDescriptionTemplate } from './DescriptionUtils';
import { detectGender } from './GenderUtils';
import { allItemsById, getOptimalEquipmentPack } from './PackUtils';
import { calculateArmourClass, deriveCharacterModifiers, hpSeedToRoll } from './utilities';

export interface AutoGenerateOptions {
  getSpellListsForClass: (cls: ClassOptionsData) => SpellDefinition[][];
  getClassSpellSlots: (cls: ClassOptionsData, level: number) => number[];
  campaignId?: string;
  /** Optional seeded RNG — useful for deterministic tests. Defaults to Math.random. */
  random?: () => number;
}

/** Parses a raw XP modifier string (e.g. "+10%", "0", "+5%") to a plain integer. */
export function parseXpBonus(raw: string): number {
  return parseInt(raw) || 0;
}

/** Picks a random alignment weighted 50% lawful / 35% neutral / 15% chaotic. */
export function rollAlignment(random: () => number): string {
  const r = random();
  if (r < 0.50) return 'lawful';
  if (r < 0.85) return 'neutral';
  return 'chaotic';
}

/**
 * Selects the basic class with the highest XP bonus for the given ability scores.
 * If multiple classes tie, one is chosen at random.
 * Falls back to all eligible classes if no basic classes qualify.
 */
export function selectBestClass(
  availableClasses: ClassOptionsData[],
  abilityScores: AbilityScores,
  random: () => number,
): ClassOptionsData {
  const basicEligible = availableClasses.filter(
    (cls) => cls.category === 'basic' && cls.checkAbilityScoreRequirements(abilityScores),
  );
  const pool = basicEligible.length > 0
    ? basicEligible
    : availableClasses.filter((cls) => cls.checkAbilityScoreRequirements(abilityScores));

  if (pool.length === 0) {
    return availableClasses.find((cls) => cls.category === 'basic') ?? availableClasses[0];
  }

  const maxBonus = Math.max(...pool.map((cls) => parseXpBonus(cls.xpModifierPercentage(abilityScores))));
  const topClasses = pool.filter((cls) => parseXpBonus(cls.xpModifierPercentage(abilityScores)) === maxBonus);
  return topClasses[Math.floor(random() * topClasses.length)];
}

/** Rolls 3d6 using the provided RNG. */
function roll3d6(random: () => number): number {
  return (
    Math.floor(random() * 6) + 1 +
    Math.floor(random() * 6) + 1 +
    Math.floor(random() * 6) + 1
  );
}

/**
 * Auto-generates a complete, ready-to-save character from scratch.
 *
 * The character will be a basic class with the highest achievable XP bonus
 * for the rolled stats, a random name, auto-detected gender, a random description,
 * an optimal equipment pack, and (if the class requires spell selection) a random
 * starting spell.
 */
export function autoGenerateCharacter(
  availableClasses: ClassOptionsData[],
  options: AutoGenerateOptions,
): StoredCharacterData {
  const {
    getSpellListsForClass,
    getClassSpellSlots,
    campaignId = DEFAULT_CAMPAIGN_ID,
  } = options;
  const random = options.random ?? Math.random;

  // 1. Roll ability scores
  const abilityScores: AbilityScores = {
    strength: roll3d6(random),
    intelligence: roll3d6(random),
    wisdom: roll3d6(random),
    dexterity: roll3d6(random),
    constitution: roll3d6(random),
    charisma: roll3d6(random),
  };

  // 2. Select the best basic class
  const characterClass = selectBestClass(availableClasses, abilityScores, random);

  // 3. Derive modifiers
  const baseModifiers = deriveCharacterModifiers(abilityScores);
  const characterModifiers = {
    ...baseModifiers,
    xpModifierPercentage: characterClass.xpModifierPercentage(abilityScores),
  } as typeof baseModifiers & { xpModifierPercentage: string };

  // 4. Roll HP via seed (1–120, maps to any hit-die size without rounding error)
  const hpSeed = Math.floor(random() * 120) + 1;
  const hpResult = hpSeedToRoll(hpSeed, characterClass.hd);
  const conMod = parseInt(String(characterModifiers.constitutionMod ?? '0')) || 0;
  const hitPoints = Math.max(1, hpResult + conMod);

  // 5. Roll starting gold (3d6 × 10 GP)
  const gold = roll3d6(random) * 10;

  // 6. Build equipment and split into categories
  const equipPack = getOptimalEquipmentPack(characterClass, gold, true, random);
  const armour: string[] = [];
  const weapons: string[] = [];
  const adventuringGear: string[] = [];
  let equipmentCost = 0;

  for (const { id, quantity } of equipPack) {
    const item = allItemsById[id];
    const category = item?.category ?? 'gear';
    const target = category === 'armour' ? armour : category === 'weapon' ? weapons : adventuringGear;
    for (let i = 0; i < quantity; i++) target.push(id);
    equipmentCost += (item?.price ?? 0) * quantity;
  }

  const remainingGold = gold - equipmentCost;

  // 7. Compute AC
  const dexModAC = characterModifiers.dexterityModAC ?? '0';
  const [unarmouredAC, armourClass] = calculateArmourClass(dexModAC, armour);

  // 8. Select a spell if the class requires limited spell selection
  const spells: string[] = [];
  if (characterClass.spellListId && characterClass.limitedSpellSelection === true) {
    const spellSlots = getClassSpellSlots(characterClass, 1);
    const numSpells = Math.max(1, spellSlots[0] ?? 1);
    const spellLists = getSpellListsForClass(characterClass);
    const level1Spells = spellLists[0] ?? [];

    const available = [...level1Spells];
    for (let i = 0; i < numSpells && available.length > 0; i++) {
      const idx = Math.floor(random() * available.length);
      spells.push(available[idx].id);
      available.splice(idx, 1);
    }
  }

  // 9. Random name and gender
  const firstName = firstNames[Math.floor(random() * firstNames.length)];
  const lastName = lastNames[Math.floor(random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const gender = detectGender(name);

  // 10. Alignment (50% lawful, 35% neutral, 15% chaotic)
  const alignment = rollAlignment(random);

  // 11. Generate description
  const descTemplate = generateDescriptionTemplate({ className: characterClass.name, abilityScores });
  const description = renderDescriptionTemplate(descTemplate, name, gender);

  return {
    character: {
      id: uuidv4(),
      name,
      alignment,
      description,
      gender,
      languages: [],
      hasLanguages: false,
      personality: null,
      misfortune: null,
      appearance: null,
      backgroundSkill: null,
    },
    abilityScores,
    characterModifiers: {
      ...characterModifiers,
      xpModifierPercentage: characterClass.xpModifierPercentage(abilityScores),
      strengthModMelee: characterModifiers.strengthModMelee ?? '0',
      strengthModDoors: characterModifiers.strengthModDoors ?? '0',
      intelligenceModLanguages: characterModifiers.intelligenceModLanguages ?? '0',
      intelligenceModLiteracy: characterModifiers.intelligenceModLiteracy ?? '',
      intelligenceModExtraLanguageCount: characterModifiers.intelligenceModExtraLanguageCount ?? '0',
      wisdomMod: characterModifiers.wisdomMod ?? '0',
      dexterityModAC: characterModifiers.dexterityModAC ?? '0',
      dexterityModMissiles: characterModifiers.dexterityModMissiles ?? '0',
      dexterityModInitiative: characterModifiers.dexterityModInitiative ?? '0',
      constitutionMod: characterModifiers.constitutionMod ?? '0',
      charismaModNPCReactions: characterModifiers.charismaModNPCReactions ?? '0',
      charismaModRetainersMax: characterModifiers.charismaModRetainersMax ?? '0',
      charismaModLoyalty: characterModifiers.charismaModLoyalty ?? '0',
    },
    characterStatistics: {
      hitPoints,
      hpRolls: 1,
      hpResult,
      hpSeed,
      armourClass,
      unarmouredAC,
      hasSpells: spells.length > 0,
      level: 1,
      spells,
    },
    characterClass,
    characterEquipment: {
      armour,
      weapons,
      adventuringGear,
      gold: remainingGold,
    },
    campaignId,
  };
}
