import { PDFDocument, PDFField, PDFForm } from 'pdf-lib'
import {
  CHARACTER_SHEET_PURIST_DAC_URL,
  CHARACTER_SHEET_PURIST_URL,
  CHARACTER_SHEET_UNDERGROUND_URL,
  armourTypes
} from '../../constants/constants'
import armourData from '../../data/armourData'
import weaponsData from '../../data/weaponsData'
import type {
  AbilityScores,
  Character,
  CharacterEquipment,
  CharacterModifiers,
  CharacterStatistics,
  ClassOptionsData,
} from '../../types'
import { consolidateDuplicates } from '../../utilities/utilities'

export type PDFExportProps = {
  character: Character
  characterStatistics: CharacterStatistics
  characterClass: ClassOptionsData
  characterEquipment: CharacterEquipment
  characterModifiers: CharacterModifiers
  abilityScores: AbilityScores
}

const INITIAL_LEVEL = '1'
const INITIAL_ATTACK_BONUS = '0'
const DAC_BASE = 19

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

/**
 * Fill PDF form fields by iterating all fields in the PDF.
 * For each PDF field name, check the aliasMap:
 *   - null  → skip (ignore this field)
 *   - string → use as the key into fieldData instead of the PDF field name
 *   - absent → use PDF field name directly as the key into fieldData
 * If the resolved key is not present in fieldData, the field is logged to the console.
 * Boolean values are written to checkboxes; all other values are written to text fields.
 */
export function applyFieldData(
  form: PDFForm,
  pdfFields: PDFField[],
  data: FieldData,
  aliases: AliasMap = {}
): void {
  for (const field of pdfFields) {
    const pdfName = field.getName()

    let dataKey: string | null
    if (pdfName in aliases) {
      dataKey = aliases[pdfName]
    } else {
      dataKey = pdfName
    }

    if (dataKey === null) continue

    if (!(dataKey in data)) {
      console.log(`PDF field "${pdfName}" has no data mapping (looked up "${dataKey}")`)
      continue
    }

    const value = data[dataKey];
    if (value === null) continue

    if (typeof value === 'boolean') {
      const checkbox = form.getCheckBox(pdfName)
      if (value) checkbox.check()
    } else {
      form.getTextField(pdfName).setText(value != null ? String(value) : '')
    }
  }
}

function openPdfInBrowser(pdfBytes: Uint8Array, fileName: string) {
  const file = new File([pdfBytes as BlobPart], fileName, { type: 'application/pdf' })
  const url = URL.createObjectURL(file)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/** Derives all PDF field values from character state. Pure — no side effects. */
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

  const abilitiesInfo = `
    Weapons: ${consolidateDuplicates(characterEquipment.weapons).join(', ') || ''}
    Abilities: ${characterClass.abilities.join(', ')}`

  const weaponsInfo = `
    Weapons: ${consolidateDuplicates(characterEquipment.weapons).join(', ') || ''}
    Armour: ${characterEquipment.armour.join(', ') || ''}
    `

  const equipmentInfo = `
    ${consolidateDuplicates(characterEquipment.adventuringGear).join(', ') || ''}
    `

  const spellText = characterStatistics.hasSpells ? `Spells: ${characterStatistics.spell}` : ''

  const baseMovement = (() => {
    const armour = characterEquipment.armour
    if (armour.some(a => a === armourTypes.plateMail || a === armourTypes.chainMail)) return 60
    if (armour.some(a => a === armourTypes.leather)) return 90
    return 120
  })()

  const listenAtDoor = characterClass.abilities.some(a => a.includes('Listening at Doors')) ? '2-in-6' : '1-in-6'
  const findSecretDoor = characterClass.abilities.some(a => a.includes('Detect Secret Doors')) ? '2-in-6' : '1-in-6'
  const findRoomTrap = characterClass.abilities.some(a => a.includes('Detect Room Traps')) ? '2-in-6' : '1-in-6'

  const equipmentEncumbrance = (() => {
    const armourWeight = characterEquipment.armour.reduce((sum, name) => {
      const entry = armourData.find(a => a.name === name)
      return sum + (entry?.weight ?? 0)
    }, 0)
    const weaponWeight = consolidateDuplicates(characterEquipment.weapons).reduce((sum, name) => {
      const entry = weaponsData.find(w => w.name === name)
      return sum + (entry?.weight ?? 0)
    }, 0)
    return armourWeight + weaponWeight + 80
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
    'Level': INITIAL_LEVEL,
    'STR': abilityScores.strength,
    'INT': abilityScores.intelligence,
    'DEX': abilityScores.dexterity,
    'WIS': abilityScores.wisdom,
    'CON': abilityScores.constitution,
    'CHA': abilityScores.charisma,

    'Death Save': characterClass.savingThrows[0],
    'Wands Save': characterClass.savingThrows[1],
    'Paralysis Save': characterClass.savingThrows[2],
    'Breath Save': characterClass.savingThrows[3],
    'Spells Save': characterClass.savingThrows[4],

    'Magic Save Mod': characterModifiers.wisdomMod,
    'HP': characterStatistics.hitPoints,
    'Current HP': characterStatistics.hitPoints,
    'Max HP': characterStatistics.hitPoints,
    'AC': characterStatistics.armourClass,
    'CON HP Mod': characterModifiers.constitutionMod,
    'Unarmoured AC': characterStatistics.unarmouredAC,
    'DEX AC Mod': characterModifiers.dexterityModAC,
    'STR Melee Mod': characterModifiers.strengthModMelee,
    'DEX Missile Mod': characterModifiers.dexterityModMissiles,
    // TODO: Improve formatting
    'Abilities, Skills, Weapons': abilitiesInfo,
    'Abilities': abilitiesInfo,
    'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
    // TODO: Improve formatting
    'Equipment': equipmentInfo,
    'Weapons and Armour': weaponsInfo,
    'GP': characterEquipment.gold,
    // TODO: Improve formatting
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
    // Descending AC variants: DAC = 19 - ascending AC; used by DAC sheet via aliases
    'DAC AC': DAC_BASE - characterStatistics.armourClass,
    'DAC Unarmoured AC': DAC_BASE - characterStatistics.unarmouredAC,
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

export default function PDFExport(props: PDFExportProps) {
  const { character, characterClass } = props
  const fieldData = buildFieldData(props)

  async function fillForm() {
    const formPdfBytes = await fetch(CHARACTER_SHEET_PURIST_URL).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(formPdfBytes)
    const form = pdfDoc.getForm()
    const pdfFields = form.getFields()

    const aliasMap: AliasMap = {}

    applyFieldData(form, pdfFields, fieldData, aliasMap)

    const pdfBytes = await pdfDoc.save()
    openPdfInBrowser(pdfBytes, `${character.name} the ${characterClass.name}.pdf`)
  }

  async function fillFormDAC() {
    const formPdfBytes = await fetch(CHARACTER_SHEET_PURIST_DAC_URL).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(formPdfBytes)
    const form = pdfDoc.getForm()
    const pdfFields = form.getFields()

    // DAC sheet uses descending AC (higher = better); redirect to pre-computed DAC values
    const aliasMap: AliasMap = {
      'AC': 'DAC AC',
      'Unarmoured AC': 'DAC Unarmoured AC',
    }

    applyFieldData(form, pdfFields, fieldData, aliasMap)

    const pdfBytes = await pdfDoc.save()
    openPdfInBrowser(pdfBytes, `${character.name} the ${characterClass.name}.pdf`)
  }

  async function fillFormUnderground() {
    const formPdfBytes = await fetch(CHARACTER_SHEET_UNDERGROUND_URL).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(formPdfBytes)
    const form = pdfDoc.getForm()
    const pdfFields = form.getFields()

    // The underground sheet duplicates some values in different places on the sheet
    const aliasMap: AliasMap = {
      'Dex Missile Mod 2': 'DEX Missile Mod',
      'STR Melee Mod 2': 'STR Melee Mod',
      'Move': 'Exploration Movement',
      'untitled6': null,  // unnamed field — ignore
    }

    applyFieldData(form, pdfFields, fieldData, aliasMap)

    const pdfBytes = await pdfDoc.save()
    openPdfInBrowser(pdfBytes, `${character.name} the ${characterClass.name}.pdf`)
  }

  return (
    <div className='pdf-export-container'>
      <button onClick={() => fillForm()}>Purist</button>

      <button onClick={() => fillFormDAC()}>Purist (DAC)</button>

      <button onClick={() => fillFormUnderground()}>Underground</button>
    </div>
  )
}


