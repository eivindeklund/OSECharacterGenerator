import { PDFDocument, PDFField, PDFForm } from 'pdf-lib'
import {
  CHARACTER_SHEET_PURIST_DAC_URL,
  CHARACTER_SHEET_PURIST_URL,
  CHARACTER_SHEET_UNDERGROUND_URL,
} from '../../constants/constants'
import type { AliasMap, FieldData, PDFExportProps } from './buildFieldData'
import { buildFieldData } from './buildFieldData'

// Re-export so that existing imports from './PDFExport' continue to work
export { buildFieldData } from './buildFieldData'
export type { AliasMap, FieldData, PDFExportProps } from './buildFieldData'

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

    const dataKey: string | null = pdfName in aliases ? aliases[pdfName] : pdfName

    if (dataKey === null) continue

    if (!(dataKey in data)) {
      console.warn(`PDF field "${pdfName}" has no data mapping (looked up "${dataKey}")`)
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


export default function PDFExport(props: PDFExportProps) {
  const { character, characterClass } = props
  const fieldData = buildFieldData(props)

  async function fillForm(url: string, aliases: AliasMap) {
    const formPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(formPdfBytes)
    const form = pdfDoc.getForm()
    applyFieldData(form, form.getFields(), fieldData, aliases)
    const pdfBytes = await pdfDoc.save()
    openPdfInBrowser(pdfBytes, `${character.name} the ${characterClass.name}.pdf`)
  }

  // TODO: Each of these could in principle be used with ascending or descending
  // AC; consider allowing the user to choose which variant(s) to use with each
  // sheet, rather than hardcoding it per sheet and relying on aliases to swap
  // between them.

  // TODO: Fix routing so it works to open the web sheet in a new tab
  // To open in the current tab, we'd could replace with
  //   const navigate = useNavigate()       <button onClick={() => navigate('/sheet/purist-web')}>
  // But the intent is to have a new tab so it is still possible to work with the existing tab, and
  // fixing routing would also fix the issue of reloading other wizard URLs
  return (
    <div className='pdf-export-container'>
      <button onClick={() => fillForm(CHARACTER_SHEET_PURIST_URL, {
        // Can be removed by changing the names in the PDF
        'AC': 'Ascending AC',
        'Unarmoured AC': 'Ascending Unarmoured AC',
      })}>Purist (AAC)</button>

      <button onClick={() => fillForm(CHARACTER_SHEET_PURIST_DAC_URL, {
        // Can be removed by changing the names in the PDF
        'AC': 'Descending AC',
        'Unarmoured AC': 'Descending Unarmoured AC',
      })}>Purist (DAC)</button>

      <button onClick={() => fillForm(CHARACTER_SHEET_UNDERGROUND_URL, {
        // Structurally necessary
        'Dex Missile Mod 2': 'DEX Missile Mod',
        'STR Melee Mod 2': 'STR Melee Mod',
        'untitled6': null,  // unnamed field — ignore
        // Can be removed by changing the names in the PDF
        'Move': 'Exploration Movement',
        'AC': 'Ascending AC',
        'Unarmoured AC': 'Ascending Unarmoured AC',
      })}>Underground (AAC)</button>

      <button onClick={() => window.open(`/#/character/${character.id}/sheet/purist-web`, '_blank', 'noopener,noreferrer')}>
        Purist (Web)
      </button>
    </div>
  )
}


