import LZString from 'lz-string'
import { normalizeStoredCharacter } from './normalizeCharacterData'

const ShareService = {
  compressCharacter: (characterData) => {
    try {
      const jsonString = JSON.stringify(characterData)
      const compressed = LZString.compressToEncodedURIComponent(jsonString)
      return compressed
    } catch (error) {
      console.error('Error compressing character data:', error)
      return null
    }
  },

  decompressCharacter: (compressedString) => {
    try {
      const decompressedString = LZString.decompressFromEncodedURIComponent(compressedString)
      if (!decompressedString) return null
      const characterData = JSON.parse(decompressedString)
      return normalizeStoredCharacter(characterData)
    } catch (error) {
      console.error('Error decompressing character data:', error)
      return null
    }
  },

  generateShareUrl: (characterData) => {
    const compressed = ShareService.compressCharacter(characterData)
    if (!compressed) return null
    return `${window.location.origin}${window.location.pathname}?data=${compressed}`
  }
}

export default ShareService
