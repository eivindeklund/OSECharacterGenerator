import { CHARACTER_STORAGE, PARTIAL_CHARACTER_KEY } from "../constants/constants";

export const StorageService = {
  loadCharacters: () => {
    try {
      const data = window.localStorage.getItem(CHARACTER_STORAGE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load characters from storage", e);
      return [];
    }
  },

  saveCharacters: (characters) => {
    try {
      window.localStorage.setItem(CHARACTER_STORAGE, JSON.stringify(characters));
    } catch (e) {
      console.error("Failed to save characters to storage", e);
    }
  },

  deleteCharacter: (id) => {
    const characters = StorageService.loadCharacters();
    const updated = characters.filter((c) => c.character.id !== id);
    StorageService.saveCharacters(updated);
    return updated;
  },

  saveCharacter: (characterData) => {
    const characters = StorageService.loadCharacters();
    const id = characterData.character.id;
    
    if (characters.some((c) => c.character.id === id)) {
      return characters;
    }
    
    characters.push(characterData);
    StorageService.saveCharacters(characters);
    return characters;
  },

  savePartialCharacter: (characterData) => {
    try {
      window.localStorage.setItem(PARTIAL_CHARACTER_KEY, JSON.stringify(characterData));
    } catch (e) {
      console.error("Failed to save partial character", e);
    }
  },

  loadPartialCharacter: () => {
    try {
      const data = window.localStorage.getItem(PARTIAL_CHARACTER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load partial character", e);
      return null;
    }
  },

  clearPartialCharacter: () => {
    try {
      window.localStorage.removeItem(PARTIAL_CHARACTER_KEY);
    } catch (e) {
      console.error("Failed to clear partial character", e);
    }
  },
};
