// generates the appropriate modifier for an ability value
import React from 'react';
import {
  abilityScoreNames,
  armourTypes,
} from '../constants/constants';
import abilityScoreMods from '../data/abilityScoreMods';
import type { AbilityScores } from '../types';

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

export const getModValue = (abilityScoreName, abilityScore) => {
  let newAbilityModifiers = {}

  switch (abilityScoreName) {
    case 'strength':
      newAbilityModifiers = {
        strengthModMelee: abilityScoreMods.abilityMod[abilityScore],
        strengthModDoors: abilityScoreMods.openDoors[abilityScore]
      }
      break
    case 'intelligence':
      newAbilityModifiers = {
        intelligenceModLanguages:
          abilityScoreMods.spokenLanguages[abilityScore],
        intelligenceModLiteracy: abilityScoreMods.literacy[abilityScore],
        intelligenceModExtraLanguageCount:
          abilityScoreMods.extraLanguageCount[abilityScore]
      }
      break
    case 'dexterity':
      newAbilityModifiers = {
        dexterityModAC: abilityScoreMods.abilityMod[abilityScore],
        dexterityModMissiles: abilityScoreMods.abilityMod[abilityScore],
        dexterityModInitiative: abilityScoreMods.initiative[abilityScore]
      }
      break
    case 'wisdom':
      newAbilityModifiers = {
        wisdomMod: abilityScoreMods.abilityMod[abilityScore]
      }
      break
    case 'constitution':
      newAbilityModifiers = {
        constitutionMod: abilityScoreMods.abilityMod[abilityScore]
      }
      break
    case 'charisma':
      newAbilityModifiers = {
        charismaModNPCReactions: abilityScoreMods.npcReactions[abilityScore],
        charismaModRetainersMax: abilityScoreMods.retainersMax[abilityScore],
        charismaModLoyalty: abilityScoreMods.loyalty[abilityScore]
      }
      break
  }

  return newAbilityModifiers
}

export const updateAbilityModifiers = (abilityScoreValues: AbilityScores): Partial<Record<string, string>> => {
  // updates all ability modifiers and returns an object containing the updates
  const abilityModifiers: Record<string, string> = {}

  abilityScoreNames.forEach((abilityScoreName) => {
    const value = abilityScoreValues[abilityScoreName]
    const newModifiers = getModValue(abilityScoreName, value)

    for (const key in newModifiers) {
      abilityModifiers[key] = newModifiers[key]
    }
  })

  return abilityModifiers
}

export const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const d = (howMany: number, sides: number) => {
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

export const joinDuplicates = (array) => {
  const stuff = {}
  for (let i = 0; i < array.length; i++) {
    if (Object.prototype.hasOwnProperty.call(stuff, array[i])) {
      stuff[array[i]] += 1
    } else {
      stuff[array[i]] = 1
    }
  }
  const consolidated = []
  const keys = Object.keys(stuff)
  for (const key of keys) {
    if (stuff[key] > 1) {
      consolidated.push(`${key} (x${stuff[key]})`)
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
