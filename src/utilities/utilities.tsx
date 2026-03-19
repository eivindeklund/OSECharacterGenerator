// generates the appropriate modifier for an ability value
import React from 'react';
import abilityScoreMods from '../data/abilityScoreMods';
import { ARMOUR_ID } from '../data/armourData';
import type { AbilityScores, CharacterModifiers } from '../types';

interface LinkTextProps {
  href?: string;
  children?: React.ReactNode;
}

export const LinkText = ({ href, children }: LinkTextProps) => {
  return (
    <a href={href || ''} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

export const deriveCharacterModifiers = (abilityScoreValues: AbilityScores): Partial<CharacterModifiers> => {
  const { strength, intelligence, dexterity, wisdom, constitution, charisma } = abilityScoreValues
  return {
    strengthModMelee: abilityScoreMods.abilityMod[strength],
    strengthModDoors: abilityScoreMods.openDoors[strength],
    intelligenceModLanguages: abilityScoreMods.spokenLanguages[intelligence],
    intelligenceModLiteracy: abilityScoreMods.literacy[intelligence],
    intelligenceModExtraLanguageCount: abilityScoreMods.extraLanguageCount[intelligence],
    dexterityModAC: abilityScoreMods.abilityMod[dexterity],
    dexterityModMissiles: abilityScoreMods.abilityMod[dexterity],
    dexterityModInitiative: abilityScoreMods.initiative[dexterity],
    wisdomMod: abilityScoreMods.abilityMod[wisdom],
    constitutionMod: abilityScoreMods.abilityMod[constitution],
    charismaModNPCReactions: abilityScoreMods.npcReactions[charisma],
    charismaModRetainersMax: abilityScoreMods.retainersMax[charisma],
    charismaModLoyalty: abilityScoreMods.loyalty[charisma],
  }
}

export const getRndInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const d = (howMany: number, sides: number): number => {
  let total = 0;
  for (let i = 0; i < howMany; i++) {
    total += getRndInteger(1, sides)
  }
  return total
}

/**
 * Generate a canonical HP seed in the range [1, 120].
 * 120 = 2² × 2 × 3 × 5 is divisible by every valid hit-die size
 * (d4, d6, d8, d10, d12, d20), so the seed can be converted to any
 * die result without rounding error.
 */
export const generateHpSeed = (): number => getRndInteger(1, 120);

/**
 * Convert a canonical HP seed to a die roll result for the given hit die.
 *
 * Formula: ⌈seed / (120 / hd)⌉
 *   d4  = ⌈seed / 30⌉   (range 1–4)
 *   d6  = ⌈seed / 20⌉   (range 1–6)
 *   d8  = ⌈seed / 15⌉   (range 1–8)
 *   d10 = ⌈seed / 12⌉   (range 1–10)
 *   d12 = ⌈seed / 10⌉   (range 1–12)
 *   d20 = ⌈seed /  6⌉   (range 1–20)
 *
 * @param seed - integer in [1, 120] produced by generateHpSeed()
 * @param hd   - hit die size (4 | 6 | 8 | 10 | 12 | 20)
 */
export const hpSeedToRoll = (seed: number, hd: number): number =>
  Math.ceil(seed / (120 / hd));

/**
 * Reverse of hpSeedToRoll — compute the canonical seed for a known die result.
 *
 * Given a die result r on a hd-sided die, the canonical seed is the smallest
 * value that maps to r: (r − 1) × (120 / hd) + 1
 *
 * Used by the animated-dice path to store a seed so that later class changes
 * can rescale the roll consistently.
 *
 * @param result - die roll result in [1, hd]
 * @param hd     - hit die size (4 | 6 | 8 | 10 | 12 | 20)
 */
export const hpRollToSeed = (result: number, hd: number): number =>
  (result - 1) * (120 / hd) + 1;


export const chooseRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const getWeightedValue = (weightedList: Record<number, string>, diceResult: number, listLength: number): string | undefined => {
  for (let i = diceResult; i <= listLength; i++) {
    if (Object.prototype.hasOwnProperty.call(weightedList, i)) {
      return weightedList[i]
    }
  }
}

export const consolidateDuplicates = (array: string[]): { id: string; count: number }[] => {
  const itemCounts: Record<string, number> = {}
  for (const item of array) {
    itemCounts[item] = (itemCounts[item] || 0) + 1
  }
  return Object.entries(itemCounts).map(([id, count]) => ({ id, count }))
}

// TODO: The types passed to this should be cleaned up.
export const calculateArmourClass = (dexMod: string, armour: string | string[]) => {
  // parseInt handles a leading '+' natively, so no stripping is needed.
  const unarmouredAC = 10 + parseInt(dexMod)
  let armourClass = unarmouredAC

  if (!armour) {
    return [unarmouredAC, armourClass]
  }

  // Only one main armour type is worn at a time; highest bonus wins.
  if (armour.includes(ARMOUR_ID.plateMail)) {
    armourClass = unarmouredAC + 6
  } else if (armour.includes(ARMOUR_ID.chainmail)) {
    armourClass = unarmouredAC + 4
  } else if (armour.includes(ARMOUR_ID.leather)) {
    armourClass = unarmouredAC + 2
  }
  if (armour.includes(ARMOUR_ID.shield)) {
    armourClass += 1
  }

  return [unarmouredAC, armourClass]
}
