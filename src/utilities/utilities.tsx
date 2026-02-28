// generates the appropriate modifier for an ability value
import React from 'react';
import {
  armourTypes,
} from '../constants/constants';
import abilityScoreMods from '../data/abilityScoreMods';
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
  
export const chooseRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

export const getWeightedValue = (weightedList, diceResult, listLength) => {
  for (let i = diceResult; i <= listLength; i++) {
    if (Object.prototype.hasOwnProperty.call(weightedList, i)) {
      return weightedList[i]
    }
  }
}

export const consolidateDuplicates = (array) => {
  const itemCounts = {}
  for (let i = 0; i < array.length; i++) {
    if (Object.prototype.hasOwnProperty.call(itemCounts, array[i])) {
      itemCounts[array[i]] += 1
    } else {
      itemCounts[array[i]] = 1
    }
  }
  const consolidated = []
  const keys = Object.keys(itemCounts)
  for (const key of keys) {
    if (itemCounts[key] > 1) {
      consolidated.push(`${key} (x${itemCounts[key]})`)
    } else {
      consolidated.push(key)
    }
  }

  return consolidated
}

// TODO: The types passed to this should be cleaned up.
export const calculateArmourClass = (dexMod: string, armour: string | string[]) => {
  let baseArmour = 10
  let armourClass = baseArmour

  /* TODO: Should this be startWith rather than includes? */
  if (dexMod.includes('+')) {
    dexMod = dexMod.substring(1)
  }
  baseArmour += parseInt(dexMod)

  if (!armour) {
    return [baseArmour, armourClass]
  }

  if (armour.includes(armourTypes.leather)) {
    armourClass = baseArmour + 2
  }
  if (armour.includes(armourTypes.chainMail)) {
    armourClass = baseArmour + 4
  }
  if (armour.includes(armourTypes.plateMail)) {
    armourClass = baseArmour + 6
  }
  if (armour.includes(armourTypes.shield)) {
    armourClass += 1
  }

  return [baseArmour, armourClass]
}
