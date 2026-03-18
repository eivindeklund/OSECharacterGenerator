import armourData, { ARMOUR_ID } from '../../data/armourData'
import { ABILITY_ID } from '../../data/classOptionsData'
import { COMBAT_USE, allSpellsById } from '../../data/spells'
import weaponsData from '../../data/weaponsData'
import type {
  AbilityScores,
  Character,
  CharacterEquipment,
  CharacterModifiers,
  CharacterStatistics,
  ClassAbility,
  ClassOptionsData,
} from '../../types'
import { allItemsById, dualListedWeaponIds } from '../../utilities/PackUtils'
import { consolidateDuplicates } from '../../utilities/utilities'

export type PDFExportProps = {
  character: Character
  characterStatistics: CharacterStatistics
  characterClass: ClassOptionsData
  characterEquipment: CharacterEquipment
  characterModifiers: CharacterModifiers
  abilityScores: AbilityScores
}

// INITIAL_LEVEL removed — use characterStatistics.level
const INITIAL_ATTACK_BONUS = '0'
const DAC_BASE = 19
// B/X rule: miscellaneous adventuring gear counts as 80 gp weight
const MISC_GEAR_WEIGHT_GP = 80

const THAC_AT_LEVEL_1: Record<string, string> = {
  'THAC9': '10',
  'THAC8': '11',
  'THAC7': '12',
  'THAC6': '13',
  'THAC5': '14',
  'THAC4': '15',
  'THAC3': '16',
  'THAC2': '17',
  'THAC1': '18',
  'THAC0': '19',
}

export type FieldData = Record<string, string | number | boolean | null | undefined>
export type AliasMap = Record<string, string | null>

function getAbilityDescription(ability: ClassAbility, level: number): string {
  return ability.getDescription?.(level) ?? ability.description ?? ''
}

/** Derives all PDF/sheet field values from character state. Pure — no side effects. */
export function buildFieldData(props: PDFExportProps): FieldData {
  const {
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores
  } = props

  const alignmentCapitalized = character.alignment
    ? character.alignment.charAt(0).toUpperCase() + character.alignment.slice(1)
    : ''

  const languageText = character.hasLanguages
    ? `${alignmentCapitalized}, Common, ${character.languages.join(', ')}`
    : `${alignmentCapitalized}, Common`

  const level = characterStatistics.level ?? 1

  // ── Abilities, Skills, Weapons box ──────────────────────────────────────────
  // Section 1: Class abilities with full descriptions
  const abilitiesLines = characterClass.abilities
    .filter(a => (a.minLevel ?? 1) <= level && a.shownInList !== false)
    .map(a => {
      const desc = getAbilityDescription(a, level)
      return desc ? `${a.name}: ${desc}` : a.name
    })

  // Section 2: All equipped weapons (including dual-use gear) with damage for quick reference
  const weaponItems = consolidateDuplicates(characterEquipment.weapons)
  const weaponsQuickRefLines = weaponItems.map(({ id, count }) => {
    const w = weaponsData.find(x => x.id === id)
    const name = w?.name ?? allItemsById[id]?.name ?? id
    const dmg = w?.damage ?? '?'
    const countStr = count > 1 ? ` ×${count}` : ''
    return `${name}${countStr} (${dmg})`
  })

  // Section 3: Combat spells with dice/save summaries
  // Only show spells that are relevant both in and out of combat, or primarily combat-focused
  // (combatUse >= BOTH === 3). Pure utility spells are omitted here.
  const combatSpellLines: string[] = []
  if (characterStatistics.hasSpells && characterStatistics.spells.length > 0) {
    for (const spellId of characterStatistics.spells) {
      const spellDef = allSpellsById[spellId]
      const spellName = spellDef?.name ?? spellId
      const info = spellDef?.shortDesc
      const combatUse = spellDef?.combatUse ?? COMBAT_USE.BOTH
      if (info && combatUse >= COMBAT_USE.BOTH) combatSpellLines.push(`${spellName}: ${info}`)
    }
    // Fall back to listing all spell names if none match the combat threshold
    if (combatSpellLines.length === 0) {
      combatSpellLines.push(characterStatistics.spells.map(id => allSpellsById[id]?.name ?? id).join(', '))
    }
  }

  const abilitiesSections: string[] = []
  if (abilitiesLines.length > 0) abilitiesSections.push('ABILITIES\n' + abilitiesLines.join('\n'))
  if (weaponsQuickRefLines.length > 0) abilitiesSections.push('WEAPONS\n' + weaponsQuickRefLines.join(', '))
  if (combatSpellLines.length > 0) abilitiesSections.push('COMBAT SPELLS\n' + combatSpellLines.join('\n'))
  const abilitiesInfo = abilitiesSections.join('\n\n')

  // ── Weapons and Armour box ───────────────────────────────────────────────────
  // Full combat stats for dedicated weapons only; dual-use gear items are excluded
  const realWeaponLines = consolidateDuplicates(characterEquipment.weapons)
    .filter(({ id }) => !dualListedWeaponIds.has(id))
    .map(({ id, count }) => {
      const w = weaponsData.find(x => x.id === id)
      const name = w?.name ?? allItemsById[id]?.name ?? id
      const dmg = w?.damage ?? '?'
      const countStr = count > 1 ? ` ×${count}` : ''
      const qualParts = (w?.qualities ?? [])
        .map(q => q.startsWith('Missile (') ? `Range ${q.slice(8)}` : q)
        .filter(q => q !== 'Melee')
        .join(', ')
      return qualParts
        ? `${name}${countStr}: ${dmg}, ${qualParts}`
        : `${name}${countStr}: ${dmg}`
    })

  const armourNames = characterEquipment.armour.map(id => allItemsById[id]?.name ?? id)
  const weaponsInfoSections: string[] = []
  if (realWeaponLines.length > 0) weaponsInfoSections.push(realWeaponLines.join('\n'))
  if (armourNames.length > 0) weaponsInfoSections.push('Armour: ' + armourNames.join(', '))
  const weaponsInfo = weaponsInfoSections.join('\n\n')

  // ── Equipment box ────────────────────────────────────────────────────────────
  // Adventuring gear plus any dual-use weapon items (consumables the player tracks)
  const gearEntries = consolidateDuplicates(characterEquipment.adventuringGear).map(({ id, count }) => {
    const name = allItemsById[id]?.name ?? id
    return count > 1 ? `${name} ×${count}` : name
  })
  const dualUseEntries = consolidateDuplicates(characterEquipment.weapons)
    .filter(({ id }) => dualListedWeaponIds.has(id))
    .map(({ id, count }) => {
      const name = allItemsById[id]?.name ?? id
      return count > 1 ? `${name} ×${count}` : name
    })
  const equipmentInfo = [...gearEntries, ...dualUseEntries].join(', ')

  const spellText = characterStatistics.hasSpells
    ? `Spells: ${characterStatistics.spells.map(id => allSpellsById[id]?.name ?? id).join(', ')}`
    : ''

  const baseMovement = (() => {
    const armour = characterEquipment.armour
    if (armour.some(a => a === ARMOUR_ID.plateMail || a === ARMOUR_ID.chainmail)) return 60
    if (armour.some(a => a === ARMOUR_ID.leather)) return 90
    return 120
  })()

  const listenAtDoor = characterClass.abilities.some((a) => a.id === ABILITY_ID.listeningAtDoors) ? '2-in-6' : '1-in-6'
  const findSecretDoor = characterClass.abilities.some((a) => a.id === ABILITY_ID.detectSecretDoors) ? '2-in-6' : '1-in-6'
  const findRoomTrap = characterClass.abilities.some((a) => a.id === ABILITY_ID.detectRoomTraps) ? '2-in-6' : '1-in-6'

  const equipmentEncumbrance = (() => {
    // TODO: This does not check for missing ids; missing ids are errors.
    const armourWeight = characterEquipment.armour.reduce((sum, id) => {
      const entry = armourData.find(a => a.id === id)
      return sum + (entry?.weight ?? 0)
    }, 0)
    // TODO: This does not check for missing ids; missing ids are errors.
    const weaponWeight = consolidateDuplicates(characterEquipment.weapons).reduce((sum, { id, count }) => {
      const entry = weaponsData.find(w => w.id === id)
      return sum + (entry?.weight ?? 0) * count
    }, 0)
    return armourWeight + weaponWeight + MISC_GEAR_WEIGHT_GP
  })()

  const descriptionInfo = `
    ${character.description && `${character.description}`}
    ${character.appearance && `Appearance: ${character.appearance}`}
    ${character.background && `Background: ${character.background}`}
    ${character.personality && `Personality: ${character.personality}`}
    ${character.misfortune && `Misfortune: ${character.misfortune}`}
    `

  // Central field data shared by all page builders.
  // Keys match the canonical PDF field names used by the purist sheets.
  // Variant values (e.g. DAC AC) live alongside the originals for use via aliases.
  return {
    'Name': character.name,
    'Alignment': alignmentCapitalized,
    'Character Class': characterClass.name,
    'Level': String(characterStatistics.level ?? 1),
    'STR': abilityScores.strength,
    'INT': abilityScores.intelligence,
    'DEX': abilityScores.dexterity,
    'WIS': abilityScores.wisdom,
    'CON': abilityScores.constitution,
    'CHA': abilityScores.charisma,

    'Death Save': characterClass.getSavingThrowsAtLevel(characterStatistics.level ?? 1)[0],
    'Wands Save': characterClass.getSavingThrowsAtLevel(characterStatistics.level ?? 1)[1],
    'Paralysis Save': characterClass.getSavingThrowsAtLevel(characterStatistics.level ?? 1)[2],
    'Breath Save': characterClass.getSavingThrowsAtLevel(characterStatistics.level ?? 1)[3],
    'Spells Save': characterClass.getSavingThrowsAtLevel(characterStatistics.level ?? 1)[4],

    'Magic Save Mod': characterModifiers.wisdomMod,
    'HP': characterStatistics.hitPoints,
    'Current HP': characterStatistics.hitPoints,
    'Max HP': characterStatistics.hitPoints,
    'CON HP Mod': characterModifiers.constitutionMod,
    'DEX AC Mod': characterModifiers.dexterityModAC,
    'STR Melee Mod': characterModifiers.strengthModMelee,
    'DEX Missile Mod': characterModifiers.dexterityModMissiles,
    'Abilities, Skills, Weapons': abilitiesInfo,
    'Abilities': abilitiesInfo,
    'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
    'Equipment': equipmentInfo,
    'Weapons and Armour': weaponsInfo,
    'GP': characterEquipment.gold,
    'Description': descriptionInfo,
    'XP for Next Level': characterClass.nextLevel,
    'PR XP Bonus': characterModifiers.primeReqMod,
    'Attack Bonus': INITIAL_ATTACK_BONUS,
    'Notes': spellText,
    'Languages': languageText,
    'Initiative DEX Mod': characterModifiers.dexterityModInitiative,
    'Listen at Door': listenAtDoor,
    'Open Stuck Door': characterModifiers.strengthModDoors,
    'Find Secret Door': findSecretDoor,
    'Find Room Trap': findRoomTrap,
    'Overland Movement': String(baseMovement / 5),
    'Exploration Movement': String(baseMovement),
    'Encounter Movement': String(baseMovement / 3),
    'Equipment Encumbrance': String(equipmentEncumbrance),
    'Portrait': character.appearance,
    'Literacy': abilityScores.intelligence > 8,
    ...THAC_AT_LEVEL_1,
    // Ascending AC variants; used in the purist & underground sheets via aliases
    'Ascending AC': characterStatistics.armourClass,
    'Ascending Unarmoured AC': characterStatistics.unarmouredAC,
    // Descending AC variants: DAC = 19 - ascending AC; used by DAC sheet via aliases
    'Descending AC': DAC_BASE - characterStatistics.armourClass,
    'Descending Unarmoured AC': DAC_BASE - characterStatistics.unarmouredAC,
    // Fields for use during play — not filled at character creation (level 1).
    'Title': null,
    'Magic Items': null,
    'Treasure': null,
    'PP': null,
    'EP': null,
    'SP': null,
    'CP': null,
    'XP': null,
    'Treasure Encumbrance': null,
    'Total Encumbrance': null,
  }
}
