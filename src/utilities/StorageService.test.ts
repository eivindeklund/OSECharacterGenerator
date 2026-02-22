import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHARACTER_STORAGE } from '../constants/constants';
import { StorageService } from './StorageService';

describe('StorageService', () => {
  const mockCharacters = [
    { character: { id: '1', name: 'Aragorn' } },
    { character: { id: '2', name: 'Legolas' } }
  ];

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    });
    vi.clearAllMocks();
  });

  it('should load characters from localStorage', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify(mockCharacters));
    const result = StorageService.loadCharacters();
    expect(result).toEqual(mockCharacters);
    expect(localStorage.getItem).toHaveBeenCalledWith(CHARACTER_STORAGE);
  });

  it('should return empty array if no characters in storage', () => {
    localStorage.getItem.mockReturnValue(null);
    const result = StorageService.loadCharacters();
    expect(result).toEqual([]);
  });

  it('should save characters to localStorage', () => {
    StorageService.saveCharacters(mockCharacters);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      CHARACTER_STORAGE,
      JSON.stringify(mockCharacters)
    );
  });

  it('should append new character if not exists', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([mockCharacters[0]]));
    const newChar = mockCharacters[1];
    
    StorageService.saveCharacter(newChar);
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      CHARACTER_STORAGE,
      JSON.stringify(mockCharacters)
    );
  });

  it('should not append duplicate character', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([mockCharacters[0]]));
    const duplicate = mockCharacters[0];
    
    StorageService.saveCharacter(duplicate);
    
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should delete character by id', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify(mockCharacters));
    
    StorageService.deleteCharacter('1');
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      CHARACTER_STORAGE,
      JSON.stringify([mockCharacters[1]])
    );
  });
});
