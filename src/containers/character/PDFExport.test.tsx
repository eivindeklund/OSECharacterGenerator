import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { PDFField, PDFForm } from 'pdf-lib'
import { describe, expect, it, vi } from 'vitest'
import type { AliasMap, FieldData, PDFExportProps } from './PDFExport'
import PDFExport, { applyFieldData, buildFieldData } from './PDFExport'

// ── Shared fixture ─────────────────────────────────────────────────────────────

const baseProps: PDFExportProps = {
  character: {
    id: '1',
    name: 'Thorin',
    alignment: 'lawful',
    languages: [],
    hasLanguages: false,
    personality: null,
    misfortune: null,
    appearance: null,
    backgroundSkill: null,
    background: null,
    description: null,
    gender: 'male',
  },
  characterStatistics: {
    hitPoints: 8,
    hpRolls: 1,
    hpResult: 8,
    hpSeed: 1,
    armourClass: 14,
    spell: null,
    hasSpells: false,
    unarmouredAC: 10,
  },
  characterClass: {
    name: 'Fighter',
    category: 'core',
    requirements: null,
    primeReqs: ['strength'],
    hd: 8,
    maxLevel: 14,
    armour: 'Any',
    weapons: 'Any',
    canUseWeapon: () => true,
    allowedArmour: [],
    languages: '',
    description: '',
    savingThrows: [12, 13, 14, 15, 16],
    nextLevel: 2000,
    abilities: [],
    link: '',
    arcane: false,
    divine: false,
    xpModifierPercentage: () => '0%',
    checkAbilityScoreRequirements: () => true,
  },
  characterEquipment: {
    armour: [],
    weapons: [],
    adventuringGear: [],
    gold: 50,
  },
  characterModifiers: {
    xpModifierPercentage: '0%',
    strengthModMelee: '+1',
    strengthModDoors: '1-in-6',
    intelligenceModLanguages: '0',
    intelligenceModLiteracy: 'literate',
    intelligenceModExtraLanguageCount: '0',
    wisdomMod: '+0',
    dexterityModAC: '+0',
    dexterityModMissiles: '+0',
    dexterityModInitiative: '+0',
    constitutionMod: '+1',
    charismaModNPCReactions: '+1',
    charismaModRetainersMax: '4',
    charismaModLoyalty: '7',
    primeReqMod: '+5%',
  },
  abilityScores: {
    strength: 13,
    intelligence: 10,
    wisdom: 10,
    dexterity: 10,
    constitution: 12,
    charisma: 10,
  },
}

// ── applyFieldData helpers ─────────────────────────────────────────────────────

function makeField(name: string): PDFField {
  return { getName: () => name } as unknown as PDFField
}

function makeForm() {
  const textSetters: Record<string, ReturnType<typeof vi.fn>> = {}
  const checkFns: Record<string, ReturnType<typeof vi.fn>> = {}

  const form = {
    getTextField: vi.fn().mockImplementation((name: string) => {
      if (!textSetters[name]) textSetters[name] = vi.fn()
      return { setText: textSetters[name] }
    }),
    getCheckBox: vi.fn().mockImplementation((name: string) => {
      if (!checkFns[name]) checkFns[name] = vi.fn()
      return { check: checkFns[name] }
    }),
    _textSetters: textSetters,
    _checkFns: checkFns,
  }
  return form as unknown as PDFForm & { _textSetters: typeof textSetters; _checkFns: typeof checkFns }
}

// ── applyFieldData ─────────────────────────────────────────────────────────────

describe('applyFieldData', () => {
  it('writes a string value to the matching text field', () => {
    const form = makeForm()
    const fields = [makeField('Name')]
    const data: FieldData = { Name: 'Elric' }

    applyFieldData(form as unknown as PDFForm, fields, data)

    expect(form.getTextField).toHaveBeenCalledWith('Name')
    expect(form._textSetters['Name']).toHaveBeenCalledWith('Elric')
  })

  it('uses alias to look up value under a different key', () => {
    const form = makeForm()
    const fields = [makeField('AC')]
    const data: FieldData = { 'AC': 14, 'Descending AC': 5 }
    const aliases: AliasMap = { 'AC': 'Descending AC' }

    applyFieldData(form as unknown as PDFForm, fields, data, aliases)

    expect(form._textSetters['AC']).toHaveBeenCalledWith('5')
  })

  it('skips a field when its alias is null', () => {
    const form = makeForm()
    const fields = [makeField('untitled6')]
    const data: FieldData = { untitled6: 'ignored' }
    const aliases: AliasMap = { untitled6: null }

    applyFieldData(form as unknown as PDFForm, fields, data, aliases)

    expect(form.getTextField).not.toHaveBeenCalled()
  })

  it('warns and skips when field has no data mapping', () => {
    const form = makeForm()
    const fields = [makeField('UnknownField')]
    const data: FieldData = {}
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    applyFieldData(form as unknown as PDFForm, fields, data)

    expect(consoleSpy).toHaveBeenCalledWith(
      'PDF field "UnknownField" has no data mapping (looked up "UnknownField")'
    )
    expect(form.getTextField).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('checks a checkbox when value is boolean true', () => {
    const form = makeForm()
    const fields = [makeField('Literacy')]
    const data: FieldData = { Literacy: true }

    applyFieldData(form as unknown as PDFForm, fields, data)

    expect(form.getCheckBox).toHaveBeenCalledWith('Literacy')
    expect(form._checkFns['Literacy']).toHaveBeenCalled()
  })

  it('does not check a checkbox when value is boolean false', () => {
    const form = makeForm()
    const fields = [makeField('Literacy')]
    const data: FieldData = { Literacy: false }

    applyFieldData(form as unknown as PDFForm, fields, data)

    expect(form.getCheckBox).toHaveBeenCalledWith('Literacy')
    expect(form._checkFns['Literacy']).not.toHaveBeenCalled()
  })

  it('skips the field when value is null', () => {
    const form = makeForm()
    const fields = [makeField('XP')]
    const data: FieldData = { XP: null }

    applyFieldData(form as unknown as PDFForm, fields, data)

    expect(form.getTextField).not.toHaveBeenCalled()
  })

  it('coerces a numeric value to a string', () => {
    const form = makeForm()
    const fields = [makeField('HP')]
    const data: FieldData = { HP: 8 }

    applyFieldData(form as unknown as PDFForm, fields, data)

    expect(form._textSetters['HP']).toHaveBeenCalledWith('8')
  })
})

// ── buildFieldData ─────────────────────────────────────────────────────────────

describe('buildFieldData', () => {
  // ── base movement ────────────────────────────────────────────────────────────

  it('sets movement to 60 when wearing plate mail', () => {
    const props = { ...baseProps, characterEquipment: { ...baseProps.characterEquipment, armour: ['plate_mail'] } }
    const data = buildFieldData(props)
    expect(data['Exploration Movement']).toBe('60')
    expect(data['Overland Movement']).toBe('12')
    expect(data['Encounter Movement']).toBe('20')
  })

  it('sets movement to 60 when wearing chain mail', () => {
    const props = { ...baseProps, characterEquipment: { ...baseProps.characterEquipment, armour: ['chainmail'] } }
    const data = buildFieldData(props)
    expect(data['Exploration Movement']).toBe('60')
  })

  it('sets movement to 90 when wearing leather armour', () => {
    const props = { ...baseProps, characterEquipment: { ...baseProps.characterEquipment, armour: ['leather'] } }
    const data = buildFieldData(props)
    expect(data['Exploration Movement']).toBe('90')
    expect(data['Overland Movement']).toBe('18')
    expect(data['Encounter Movement']).toBe('30')
  })

  it('sets movement to 120 when wearing no armour', () => {
    const props = { ...baseProps, characterEquipment: { ...baseProps.characterEquipment, armour: [] } }
    const data = buildFieldData(props)
    expect(data['Exploration Movement']).toBe('120')
    expect(data['Overland Movement']).toBe('24')
    expect(data['Encounter Movement']).toBe('40')
  })

  // ── door / trap detection ─────────────────────────────────────────────────────

  it('gives 2-in-6 listen chance when class has Listening at Doors ability', () => {
    const props = { ...baseProps, characterClass: { ...baseProps.characterClass, abilities: [{ id: 'listening_at_doors', name: 'Listening at Doors (2-in-6)' }] } }
    expect(buildFieldData(props)['Listen at Door']).toBe('2-in-6')
  })

  it('gives 1-in-6 listen chance for classes without that ability', () => {
    expect(buildFieldData(baseProps)['Listen at Door']).toBe('1-in-6')
  })

  it('gives 2-in-6 secret door chance when class has Detect Secret Doors ability', () => {
    const props = { ...baseProps, characterClass: { ...baseProps.characterClass, abilities: [{ id: 'detect_secret_doors', name: 'Detect Secret Doors' }] } }
    expect(buildFieldData(props)['Find Secret Door']).toBe('2-in-6')
  })

  it('gives 1-in-6 secret door chance for classes without that ability', () => {
    expect(buildFieldData(baseProps)['Find Secret Door']).toBe('1-in-6')
  })

  it('gives 2-in-6 room trap chance when class has Detect Room Traps ability', () => {
    const props = { ...baseProps, characterClass: { ...baseProps.characterClass, abilities: [{ id: 'detect_room_traps', name: 'Detect Room Traps' }] } }
    expect(buildFieldData(props)['Find Room Trap']).toBe('2-in-6')
  })

  it('gives 1-in-6 room trap chance for classes without that ability', () => {
    expect(buildFieldData(baseProps)['Find Room Trap']).toBe('1-in-6')
  })

  // ── encumbrance ───────────────────────────────────────────────────────────────

  it('calculates encumbrance as armour weight + weapon weight + 80 base', () => {
    // Leather = 200 cn, no weapons → 200 + 0 + 80 = 280
    const props = { ...baseProps, characterEquipment: { ...baseProps.characterEquipment, armour: ['leather'], weapons: [] } }
    expect(buildFieldData(props)['Equipment Encumbrance']).toBe('280')
  })

  it('assigns base encumbrance of 80 when carrying nothing', () => {
    const props = { ...baseProps, characterEquipment: { ...baseProps.characterEquipment, armour: [], weapons: [] } }
    expect(buildFieldData(props)['Equipment Encumbrance']).toBe('80')
  })

  // ──Descending AC values ────────────────────────────────────────────────

  it('computes Descending AC as 19 minus armour class', () => {
    const props = { ...baseProps, characterStatistics: { ...baseProps.characterStatistics, armourClass: 14 } }
    expect(buildFieldData(props)['Descending AC']).toBe(5)
  })

  it('computes DAC Unarmoured AC as 19 minus unarmoured AC', () => {
    const props = { ...baseProps, characterStatistics: { ...baseProps.characterStatistics, unarmouredAC: 10 } }
    expect(buildFieldData(props)['Descending Unarmoured AC']).toBe(9)
  })

  // ── literacy ──────────────────────────────────────────────────────────────────

  it('sets Literacy to true when intelligence > 8', () => {
    const props = { ...baseProps, abilityScores: { ...baseProps.abilityScores, intelligence: 9 } }
    expect(buildFieldData(props)['Literacy']).toBe(true)
  })

  it('sets Literacy to false when intelligence is exactly 8', () => {
    const props = { ...baseProps, abilityScores: { ...baseProps.abilityScores, intelligence: 8 } }
    expect(buildFieldData(props)['Literacy']).toBe(false)
  })

  it('sets Literacy to false when intelligence is below 8', () => {
    const props = { ...baseProps, abilityScores: { ...baseProps.abilityScores, intelligence: 5 } }
    expect(buildFieldData(props)['Literacy']).toBe(false)
  })

  // ── alignment ─────────────────────────────────────────────────────────────────

  it('capitalizes alignment', () => {
    const props = { ...baseProps, character: { ...baseProps.character, alignment: 'chaotic' } }
    expect(buildFieldData(props)['Alignment']).toBe('Chaotic')
  })

  it('returns empty string when alignment is null', () => {
    const props = { ...baseProps, character: { ...baseProps.character, alignment: null } }
    expect(buildFieldData(props)['Alignment']).toBe('')
  })

  // ── languages ─────────────────────────────────────────────────────────────────

  it('includes extra languages when hasLanguages is true', () => {
    const props = {
      ...baseProps,
      character: { ...baseProps.character, alignment: 'neutral', hasLanguages: true, languages: ['Elvish', 'Dwarvish'] },
    }
    expect(buildFieldData(props)['Languages']).toBe('Neutral, Common, Elvish, Dwarvish')
  })

  it('omits extra languages when hasLanguages is false', () => {
    const props = {
      ...baseProps,
      character: { ...baseProps.character, alignment: 'lawful', hasLanguages: false, languages: [] },
    }
    expect(buildFieldData(props)['Languages']).toBe('Lawful, Common')
  })

  // ── spells ────────────────────────────────────────────────────────────────────

  it('populates Notes with spell text when character has spells', () => {
    const props = {
      ...baseProps,
      characterStatistics: { ...baseProps.characterStatistics, hasSpells: true, spell: 'Sleep' },
    }
    expect(buildFieldData(props)['Notes']).toBe('Spells: Sleep')
  })

  it('sets Notes to empty string when character has no spells', () => {
    expect(buildFieldData(baseProps)['Notes']).toBe('')
  })

  // ── THAC0 values ──────────────────────────────────────────────────────────────

  it('includes THAC0 value of "19"', () => {
    expect(buildFieldData(baseProps)['THAC0']).toBe('19')
  })

  it('includes all ten THAC values', () => {
    const data = buildFieldData(baseProps)
    for (let i = 0; i <= 9; i++) {
      expect(data[`THAC${i}`]).toBeDefined()
    }
  })

  // ── null play-time fields ─────────────────────────────────────────────────────

  it('sets play-time fields (XP, GP coins, etc.) to null', () => {
    const data = buildFieldData(baseProps)
    expect(data['XP']).toBeNull()
    expect(data['PP']).toBeNull()
    expect(data['SP']).toBeNull()
    expect(data['Treasure']).toBeNull()
  })
})

// ── PDFExport component ───────────────────────────────────────────────────────

describe('PDFExport component', () => {
  it('renders the three export buttons', () => {
    render(<PDFExport {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Purist (AAC)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Purist (DAC)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Underground (AAC)' })).toBeInTheDocument()
  })
})
