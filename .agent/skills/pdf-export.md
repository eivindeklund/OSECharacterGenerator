---
name: pdf-export
description: >
  Understand and modify the PDF character sheet export pipeline, including
  template fetching, field mapping, and pdf-lib form filling.
---

# Skill: PDF Export

## Architecture

The PDF export pipeline:

1. **Fetch template** — A pre-built fillable PDF is fetched from a remote URL (see `src/constants/constants.tsx`):
   - `CHARACTER_SHEET_PURIST_URL` — standard AC sheet (hosted on `matthewfee.github.io`)
   - `CHARACTER_SHEET_PURIST_DAC_URL` — descending AC sheet (served locally as `/DAC.pdf`)
   - `CHARACTER_SHEET_UNDERGROUND_URL` — Underground edition sheet

2. **Fill fields** — `pdf-lib` loads the fetched bytes, finds AcroForm fields by name, and sets their values.

3. **Deliver** — The filled PDF bytes are handed to `downloadjs` for browser download or shown in an iframe.

The filling code lives in a container under `src/containers/character/` (or nearby). Locate the file that imports `PDFDocument` from `pdf-lib`.

## Key gotchas

- **Remote dependency**: The purist template is hosted externally. If the remote server is unavailable, export silently fails. Local fallback is tracked in TODO.md.
- **Field names are case-sensitive** and come from the PDF's AcroForm. To discover field names, load the PDF in a PDF editor (e.g. Adobe Acrobat) and inspect the form fields, or use `pdf-lib`'s `getForm().getFields().map(f => f.getName())`.
- **`downloadjs` filename**: Currently the PDF is shown in the browser rather than downloaded with a nice filename — this is a known bug in TODO.md.
- **Scribus source files** for the character sheet live in `temp/` (`.sla` files). They are not built by the project; they are designer source files.

## Adding a new field

1. Identify the AcroForm field name from the PDF template.
2. Locate the fill function in the export code.
3. Map the character state value → the field:
   ```ts
   form.getTextField('FieldName').setText(characterData.someValue ?? '')
   ```
4. For checkboxes: `form.getCheckBox('FieldName').check()` / `.uncheck()`.
5. Test by running the app locally, completing a character, and exporting.

## Character sheet variants

| Constant | Sheet type | Source |
|---|---|---|
| `CHARACTER_SHEET_PURIST_URL` | Standard (ascending AC) | Remote (matthewfee.github.io) |
| `CHARACTER_SHEET_PURIST_DAC_URL` | Descending AC | Local `/DAC.pdf` |
| `CHARACTER_SHEET_UNDERGROUND_URL` | Underground edition | Remote (matthewfee.github.io) |
