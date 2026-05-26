import { PDFDocument } from 'pdf-lib'
import {
  CHARACTER_SHEET_PURIST_DAC_URL,
  CHARACTER_SHEET_PURIST_URL,
  CHARACTER_SHEET_UNDERGROUND_URL,
} from '../constants/constants'
import classOptionsData from '../data/classOptionsData'
import { applyFieldData } from '../containers/character/PDFExport'
import { buildFieldData } from '../containers/character/buildFieldData'
import type { StoredCharacterData } from '../types'
import type { AliasMap } from '../containers/character/buildFieldData'

export enum SheetFormat {
  PuristAAC = 'purist-aac',
  PuristDAC = 'purist-dac',
  UndergroundAAC = 'underground-aac',
}

export const SHEET_FORMAT_LABELS: Record<SheetFormat, string> = {
  [SheetFormat.PuristAAC]: 'Purist (AAC)',
  [SheetFormat.PuristDAC]: 'Purist (DAC)',
  [SheetFormat.UndergroundAAC]: 'Underground (AAC)',
}

interface SheetConfig {
  url: string
  aliases: AliasMap
  label: string
}

const SHEET_CONFIGS: Record<SheetFormat, SheetConfig> = {
  [SheetFormat.PuristAAC]: {
    url: CHARACTER_SHEET_PURIST_URL,
    aliases: {
      'AC': 'Ascending AC',
      'Unarmoured AC': 'Ascending Unarmoured AC',
    },
    label: 'Purist (AAC)',
  },
  [SheetFormat.PuristDAC]: {
    url: CHARACTER_SHEET_PURIST_DAC_URL,
    aliases: {
      'AC': 'Descending AC',
      'Unarmoured AC': 'Descending Unarmoured AC',
    },
    label: 'Purist (DAC)',
  },
  [SheetFormat.UndergroundAAC]: {
    url: CHARACTER_SHEET_UNDERGROUND_URL,
    aliases: {
      'Dex Missile Mod 2': 'DEX Missile Mod',
      'STR Melee Mod 2': 'STR Melee Mod',
      'untitled6': null,
      'Move': 'Exploration Movement',
      'AC': 'Ascending AC',
      'Unarmoured AC': 'Ascending Unarmoured AC',
    },
    label: 'Underground (AAC)',
  },
}

/**
 * Fills, flattens, and merges character sheet PDFs for all given characters
 * into a single PDF document, then opens it in a new browser tab.
 *
 * Does nothing if `characters` is empty.
 */
export async function exportPartyAsPDF(
  characters: StoredCharacterData[],
  format: SheetFormat
): Promise<void> {
  if (characters.length === 0) return

  const { url, aliases, label } = SHEET_CONFIGS[format]

  const templateBytes = await fetch(url).then(res => res.arrayBuffer())
  const mergedPdf = await PDFDocument.create()

  for (const storedChar of characters) {
    // Re-hydrate characterClass: JSON deserialization strips methods from the
    // stored plain object. Look up the live ClassOptions instance by name,
    // falling back to the stored value if no match is found (e.g. campaign class).
    const liveClass = classOptionsData.find(c => c.name === storedChar.characterClass.name)
      ?? storedChar.characterClass
    const charWithLiveClass: StoredCharacterData = { ...storedChar, characterClass: liveClass }
    const fieldData = buildFieldData(charWithLiveClass)

    const pdfDoc = await PDFDocument.load(templateBytes)
    const form = pdfDoc.getForm()
    applyFieldData(form, form.getFields(), fieldData, aliases)
    form.flatten()

    const filledBytes = await pdfDoc.save()
    const filledDoc = await PDFDocument.load(filledBytes)
    const pages = await mergedPdf.copyPages(filledDoc, filledDoc.getPageIndices())
    pages.forEach(page => mergedPdf.addPage(page))
  }

  const mergedBytes = await mergedPdf.save()
  const n = characters.length
  const fileName = `Party (${n} character${n === 1 ? '' : 's'}) — ${label}.pdf`
  const file = new File([mergedBytes as BlobPart], fileName, { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(file)
  window.open(objectUrl, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
}
