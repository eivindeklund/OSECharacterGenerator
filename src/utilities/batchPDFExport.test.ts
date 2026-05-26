import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoredCharacterData } from '../types'

// ── pdf-lib mock (hoisted to avoid TDZ issues with vi.mock) ───────────────────

const mocks = vi.hoisted(() => {
  const flattenFn = vi.fn()
  const getFormFn = vi.fn(() => ({ flatten: flattenFn, getFields: vi.fn().mockReturnValue([]) }))
  const saveFn = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
  const copyPagesFn = vi.fn().mockResolvedValue([{ _page: 'page1' }])
  const addPageFn = vi.fn()
  const getPageIndicesFn = vi.fn().mockReturnValue([0])

  const filledPdfDoc = {
    getForm: getFormFn,
    save: saveFn,
    getPageIndices: getPageIndicesFn,
  }
  const mergedPdfDoc = {
    copyPages: copyPagesFn,
    addPage: addPageFn,
    save: saveFn,
  }

  return {
    flattenFn,
    getFormFn,
    saveFn,
    copyPagesFn,
    addPageFn,
    getPageIndicesFn,
    filledPdfDoc,
    mergedPdfDoc,
    PDFDocumentLoad: vi.fn().mockResolvedValue(filledPdfDoc),
    PDFDocumentCreate: vi.fn().mockResolvedValue(mergedPdfDoc),
    buildFieldDataFn: vi.fn().mockReturnValue({ Name: 'Test Character' }),
    applyFieldDataFn: vi.fn(),
  }
})

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: mocks.PDFDocumentLoad,
    create: mocks.PDFDocumentCreate,
  },
}))

vi.mock('../containers/character/buildFieldData', () => ({
  buildFieldData: mocks.buildFieldDataFn,
}))

// PDFExport re-exports applyFieldData from buildFieldData; mock it here too
vi.mock('../containers/character/PDFExport', () => ({
  applyFieldData: mocks.applyFieldDataFn,
  buildFieldData: mocks.buildFieldDataFn,
}))

import { exportPartyAsPDF, SheetFormat } from './batchPDFExport'

// ── fetch mock ────────────────────────────────────────────────────────────────

const mockArrayBuffer = new ArrayBuffer(8)
global.fetch = vi.fn().mockResolvedValue({
  arrayBuffer: () => Promise.resolve(mockArrayBuffer),
})

// ── URL / window mock ─────────────────────────────────────────────────────────

const mockObjectUrl = 'blob:http://localhost/mock-url'
global.URL.createObjectURL = vi.fn().mockReturnValue(mockObjectUrl)
global.URL.revokeObjectURL = vi.fn()

const mockOpen = vi.fn()
vi.stubGlobal('window', { open: mockOpen })

// ── Fixture ───────────────────────────────────────────────────────────────────

function makeCharacter(id: string, name: string): StoredCharacterData {
  return {
    character: {
      id,
      name,
      languages: [],
      hasLanguages: false,
      personality: null,
      misfortune: null,
      appearance: null,
      backgroundSkill: null,
      alignment: 'neutral',
    },
    characterStatistics: {
      hitPoints: 8,
      hpRolls: 1,
      hpResult: 8,
      hpSeed: 1,
      armourClass: 10,
      hasSpells: false,
      unarmouredAC: 10,
      level: 1,
      spells: [],
    },
    characterClass: {
      name: 'Fighter',
      category: 'basic',
      description: '',
      armour: 'Any',
      weapons: 'Any',
      languages: '',
      hd: 8,
      maxLevel: 14,
      requirements: null,
      primeReqs: ['strength'],
      abilities: [],
      link: '',
      allowedArmour: [],
      levelProgression: null as any,
      xpModifierPercentage: () => '0%',
      checkAbilityScoreRequirements: () => true,
      getSavingThrowsAtLevel: () => [12, 13, 14, 15, 16] as [number, number, number, number, number],
      getThac0AtLevel: () => 19,
      getSpellSlotsAtLevel: () => [],
      isHdRollLevel: () => false,
      getHpBonusAtLevel: () => 0,
      canUseWeapon: () => true,
    },
    characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 50 },
    characterModifiers: {
      xpModifierPercentage: '0%',
      strengthModMelee: '+0',
      strengthModDoors: '1-in-6',
      intelligenceModLanguages: '0',
      intelligenceModLiteracy: '',
      intelligenceModExtraLanguageCount: '0',
      wisdomMod: '+0',
      dexterityModAC: '+0',
      dexterityModMissiles: '+0',
      dexterityModInitiative: '+0',
      constitutionMod: '+0',
      charismaModNPCReactions: '+0',
      charismaModRetainersMax: '4',
      charismaModLoyalty: '7',
      primeReqMod: '0%',
    },
    abilityScores: {
      strength: 10, intelligence: 10, wisdom: 10,
      dexterity: 10, constitution: 10, charisma: 10,
    },
    campaignId: 'default',
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('exportPartyAsPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.saveFn.mockResolvedValue(new Uint8Array([1, 2, 3]))
    mocks.copyPagesFn.mockResolvedValue([{ _page: 'page1' }])
    mocks.PDFDocumentLoad.mockResolvedValue(mocks.filledPdfDoc)
    mocks.PDFDocumentCreate.mockResolvedValue(mocks.mergedPdfDoc)
    mocks.buildFieldDataFn.mockReturnValue({ Name: 'Test Character' })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      arrayBuffer: () => Promise.resolve(mockArrayBuffer),
    })
    ;(global.URL.createObjectURL as ReturnType<typeof vi.fn>).mockReturnValue(mockObjectUrl)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing when given an empty array', async () => {
    await exportPartyAsPDF([], SheetFormat.PuristAAC)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockOpen).not.toHaveBeenCalled()
  })

  it('fetches the Purist AAC template URL for PuristAAC format', async () => {
    const char = makeCharacter('1', 'Thorin')
    await exportPartyAsPDF([char], SheetFormat.PuristAAC)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('OSE-purist-fixed.pdf')
    )
  })

  it('fetches the DAC template URL for PuristDAC format', async () => {
    const char = makeCharacter('1', 'Thorin')
    await exportPartyAsPDF([char], SheetFormat.PuristDAC)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('DAC.pdf')
    )
  })

  it('fetches the Underground template URL for UndergroundAAC format', async () => {
    const char = makeCharacter('1', 'Thorin')
    await exportPartyAsPDF([char], SheetFormat.UndergroundAAC)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('OSE-underground.pdf')
    )
  })

  it('calls buildFieldData for each character', async () => {
    const chars = [makeCharacter('1', 'Thorin'), makeCharacter('2', 'Gimli')]
    await exportPartyAsPDF(chars, SheetFormat.PuristAAC)
    expect(mocks.buildFieldDataFn).toHaveBeenCalledTimes(2)
  })

  it('flattens each filled PDF before merging', async () => {
    const char = makeCharacter('1', 'Thorin')
    await exportPartyAsPDF([char], SheetFormat.PuristAAC)
    expect(mocks.flattenFn).toHaveBeenCalledTimes(1)
  })

  it('copies pages from each filled PDF into the merged document', async () => {
    const chars = [makeCharacter('1', 'Thorin'), makeCharacter('2', 'Gimli')]
    await exportPartyAsPDF(chars, SheetFormat.PuristAAC)
    expect(mocks.copyPagesFn).toHaveBeenCalledTimes(2)
    expect(mocks.addPageFn).toHaveBeenCalled()
  })

  it('opens the merged PDF in a new browser tab', async () => {
    const char = makeCharacter('1', 'Thorin')
    await exportPartyAsPDF([char], SheetFormat.PuristAAC)
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalledWith(
      mockObjectUrl,
      '_blank',
      'noopener,noreferrer'
    )
  })
})
