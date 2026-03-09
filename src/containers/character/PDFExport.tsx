import { PDFDocument } from 'pdf-lib'
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

type PDFExportProps = {
  character: Character
  characterStatistics: CharacterStatistics
  characterClass: ClassOptionsData
  characterEquipment: CharacterEquipment
  characterModifiers: CharacterModifiers
  abilityScores: AbilityScores
}

function openPdfInBrowser(pdfBytes: Uint8Array, fileName: string) {
  const file = new File([pdfBytes as BlobPart], fileName, { type: 'application/pdf' })
  const url = URL.createObjectURL(file)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export default function PDFExport(props: PDFExportProps) {
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

  async function fillForm() {
    const formUrl = CHARACTER_SHEET_PURIST_URL
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(formPdfBytes)

    const form = pdfDoc.getForm()

    const formFieldKeysOfficialSheet = {
      // matches the PDF Form labels with correct data

      'Name': character.name,
      'Alignment': alignmentCapitalized,
      'Character Class': characterClass.name,
      'Level': '1',
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
      'Max HP': characterStatistics.hitPoints,
      'AC': characterStatistics.armourClass,
      'CON HP Mod': characterModifiers.constitutionMod,
      'Unarmoured AC': characterStatistics.unarmouredAC,
      'DEX AC Mod': characterModifiers.dexterityModAC,
      'STR Melee Mod': characterModifiers.strengthModMelee,
      'DEX Missile Mod': characterModifiers.dexterityModMissiles,
      // TODO: Improve formatting
      'Abilities, Skills, Weapons': abilitiesInfo,
      'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
      // TODO: Improve formatting
      Equipment: equipmentInfo,
      'Weapons and Armour': weaponsInfo,
      GP: characterEquipment.gold,
      // TODO: Improve formatting
      Description: descriptionInfo,
      'XP for Next Level': characterClass.nextLevel,
      'PR XP Bonus': characterModifiers.primeReqMod,
      'Attack Bonus': '0',
      Notes: spellText,
      'Languages': languageText,
      'Initiative DEX Mod': characterModifiers.dexterityModInitiative,
      'Listen at Door': listenAtDoor,
      'Open Stuck Door': characterModifiers.strengthModDoors,
      'Find Secret Door': findSecretDoor,
      'Find Room Trap': findRoomTrap,
      'Overland Travel': String(baseMovement / 5),
      'Exploration Movement': String(baseMovement),
      'Encounter Movement': String(baseMovement / 3),
      'Equipment Encumbrance': String(equipmentEncumbrance)
   }
   //
   // Fields for use during play, doesn't need filling per now (since we're only doing L1 characters.)
   //
   // (Title)
   // (Magic Items)
   // (Treasure)  -- Doesn't need filling, as it's for in-game use rather than character info
   // (PP)
   // (EP)
   // (SP)
   // (CP)
   // (XP)
   // (Treasure Encumbrance)  -- Always zero at start
   // (Total Encumbrance)


    for (const key in formFieldKeysOfficialSheet) {
      let value = formFieldKeysOfficialSheet[key]

      if (value != null) {
        value = value.toString()
      } else {
        value = ''
      }

      form.getTextField(key).setText(value)
    }

    const literacyField = form.getCheckBox('Literacy')
    if (abilityScores.intelligence > 8) {
      literacyField.check()
    }

    const pdfBytes = await pdfDoc.save()

    const fileName = `${character.name} the ${characterClass.name}.pdf`

    openPdfInBrowser(pdfBytes, fileName)
  }

  async function fillFormDAC() {
    const formUrl = CHARACTER_SHEET_PURIST_DAC_URL
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(formPdfBytes)

    const form = pdfDoc.getForm()

	const fields = form.getFields()
	fields.forEach(field => {
		const type = field.constructor.name
		const name = field.getName()
		console.log(`${type}: ${name}`)
	})

    const formFieldKeysOfficialSheet = {
      // matches the PDF Form labels with correct data

      'Name': character.name,
      'Alignment': alignmentCapitalized,
      'Character Class': characterClass.name,
      'Level': '1',
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
      'Max HP': characterStatistics.hitPoints,
      'AC': 19 - characterStatistics.armourClass,
      'CON HP Mod': characterModifiers.constitutionMod,
      'Unarmoured AC': 19 - characterStatistics.unarmouredAC,
      'DEX AC Mod': characterModifiers.dexterityModAC,
      'STR Melee Mod': characterModifiers.strengthModMelee,
      'Dex Missile Mod': characterModifiers.dexterityModMissiles,
      'Abilities, Skills, Weapons': abilitiesInfo,
      'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
      Equipment: equipmentInfo,
      'Weapons and Armour': weaponsInfo,
      GP: characterEquipment.gold,
      // Description: descriptionInfo,
      'XP for Next Level': characterClass.nextLevel,
      'PR XP Bonus': characterModifiers.primeReqMod,
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
      Notes: spellText,
      'Languages': languageText
    }

    for (const key in formFieldKeysOfficialSheet) {
      let value = formFieldKeysOfficialSheet[key]

      if (value != null) {
        value = value.toString()
      } else {
        value = ''
      }

      form.getTextField(key).setText(value)
    }

    const literacyField = form.getCheckBox('Literacy')
    if (abilityScores.intelligence > 8) {
      literacyField.check()
    }

    const pdfBytes = await pdfDoc.save()

    const fileName = `${character.name} the ${characterClass.name}.pdf`

    openPdfInBrowser(pdfBytes, fileName)
  }

  async function fillFormUnderground() {
    const formUrl = CHARACTER_SHEET_UNDERGROUND_URL

    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(formPdfBytes)

    const form = pdfDoc.getForm()

    const formFieldKeysUndergroundSheet = {
      // matches the PDF Form labels with correct data
      Name: character.name,
      Alignment: alignmentCapitalized,
      'Character Class': characterClass.name,
      Level: '1',
      STR: abilityScores.strength,
      INT: abilityScores.intelligence,
      DEX: abilityScores.dexterity,
      WIS: abilityScores.wisdom,
      CON: abilityScores.constitution,
      CHA: abilityScores.charisma,

      'Death Save': characterClass.savingThrows[0],
      'Wands Save': characterClass.savingThrows[1],
      'Paralysis Save': characterClass.savingThrows[2],
      'Breath Save': characterClass.savingThrows[3],
      'Spells Save': characterClass.savingThrows[4],

      'Magic Save Mod': characterModifiers.wisdomMod,
      'Current HP': characterStatistics.hitPoints,
      'Max HP': characterStatistics.hitPoints,
      AC: characterStatistics.armourClass,
      'CON HP Mod': characterModifiers.constitutionMod,

      'STR Melee Mod': characterModifiers.strengthModMelee,
      'STR Melee Mod 2': characterModifiers.strengthModMelee,
      'DEX Missile Mod': characterModifiers.dexterityModMissiles,
      'Dex Missile Mod 2': characterModifiers.dexterityModMissiles,
      Abilities: abilitiesInfo,
      'Reactions CHA Mod': characterModifiers.charismaModNPCReactions,
      Equipment: equipmentInfo,
      'Weapons and Armour': weaponsInfo,
      GP: characterEquipment.gold,
      Description: descriptionInfo,
      'Attack Bonus': '0',
      Portrait: character.appearance
    }

    for (const key in formFieldKeysUndergroundSheet) {
      let value = formFieldKeysUndergroundSheet[key]
      if (value != null) {
        value = value.toString()
      } else {
        value = ''
      }

      form.getTextField(key).setText(value)
    }

    const pdfBytes = await pdfDoc.save()

    const fileName = `${character.name} the ${characterClass.name}.pdf`

    openPdfInBrowser(pdfBytes, fileName)
  }

  return (
    <div className='pdf-export-container'>
      <button onClick={() => fillForm()}>Purist</button>

      <button onClick={() => fillFormDAC()}>Purist (DAC)</button>

      <button onClick={() => fillFormUnderground()}>Underground</button>
    </div>
  )
}


