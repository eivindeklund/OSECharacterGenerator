import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CharacterStorage from './CharacterStorage';

describe('CharacterStorage', () => {
  const mockCharacters = [
    { 
      character: { id: '1', name: 'Aragorn' },
      characterClass: { name: 'Fighter' },
      characterStatistics: {},
      characterEquipment: {},
      characterModifiers: {},
      abilityScores: {}
    },
    { 
      character: { id: '2', name: 'Legolas' },
      characterClass: { name: 'Elf' },
      characterStatistics: {},
      characterEquipment: {},
      characterModifiers: {},
      abilityScores: {}
    }
  ];

  const defaultProps = {
    screen: { characterStorageScreen: true },
    setScreen: vi.fn(),
    setCharacter: vi.fn(),
    setAbilityScores: vi.fn(),
    setCharacterStatistics: vi.fn(),
    setCharacterClass: vi.fn(),
    setCharacterEquipment: vi.fn(),
    setCharacterModifiers: vi.fn(),
    setCharacterRolled: vi.fn(),
    storedCharacters: mockCharacters,
    deleteStoredCharacter: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all stored characters', () => {
    render(<CharacterStorage {...defaultProps} />);
    expect(screen.getByText('Aragorn')).toBeInTheDocument();
    expect(screen.getByText('Legolas')).toBeInTheDocument();
  });

  it('should trigger selection callbacks when character button is clicked', () => {
    render(<CharacterStorage {...defaultProps} />);
    fireEvent.click(screen.getByText('Aragorn'));
    
    expect(defaultProps.setCharacter).toHaveBeenCalledWith(mockCharacters[0].character);
    expect(defaultProps.setCharacterRolled).toHaveBeenCalledWith(true);
    expect(defaultProps.setScreen).toHaveBeenCalled();
  });

  it('should trigger deleteStoredCharacter when delete button is clicked', () => {
    render(<CharacterStorage {...defaultProps} />);
    const deleteButtons = screen.getAllByText('x');
    fireEvent.click(deleteButtons[0]);
    
    expect(defaultProps.deleteStoredCharacter).toHaveBeenCalledWith('1');
  });

  it('should stop propagation on delete click', () => {
    render(<CharacterStorage {...defaultProps} />);
    const deleteButtons = screen.getAllByText('x');
    fireEvent.click(deleteButtons[0]);
    
    expect(defaultProps.setCharacter).not.toHaveBeenCalled();
  });
});
