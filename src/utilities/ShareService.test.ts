import { describe, expect, it } from 'vitest'
import ShareService from './ShareService'

describe('ShareService', () => {
  const mockCharacterData = {
    character: { name: 'Test Char', id: '123' },
    characterClass: { name: 'Fighter' },
    abilityScores: { strength: 18, dexterity: 12 },
    characterModifiers: {},
    characterStatistics: { hitPoints: 10, level: 1, spells: [] },
    characterEquipment: { gold: 100 }
  }

  it('should compress and decompress character data correctly', () => {
    const compressed = ShareService.compressCharacter(mockCharacterData)
    expect(compressed).toBeDefined()
    expect(typeof compressed).toBe('string')
    expect(compressed.length).toBeGreaterThan(0)

    const decompressed = ShareService.decompressCharacter(compressed)
    expect(decompressed).toEqual(mockCharacterData)
  })

  it('should return null for invalid compressed string', () => {
    // LZString might return null or empty string for invalid input, or JSON.parse might fail
    // If we pass something that doesn't decompress to valid JSON
    const result = ShareService.decompressCharacter('invalid-string')
    // Depending on implementation it returns null or throws. 
    // ShareService catches errors and returns null.
    expect(result).toBeNull()
  })

  it('should generate a valid share URL', () => {
    // Save original location
    const originalLocation = window.location

    // Mock window.location
    // @ts-ignore — deleting window.location is valid in jsdom test environments
    delete window.location
    // @ts-ignore — assigning partial location object is intentional in this mock
    window.location = { origin: 'http://localhost', pathname: '/' }

    try {
      const url = ShareService.generateShareUrl(mockCharacterData)
      expect(url).toContain('http://localhost/?data=')
      
      const param = url.split('?data=')[1]
      const decompressed = ShareService.decompressCharacter(param)
      expect(decompressed).toEqual(mockCharacterData)
    } finally {
      // Restore window.location
      // @ts-ignore — restoring original location object
      window.location = originalLocation
    }
  })
})
