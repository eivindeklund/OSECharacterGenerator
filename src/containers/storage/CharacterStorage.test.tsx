import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShareService from '../../utilities/ShareService';
import CharacterStorage from './CharacterStorage';

// Mock ShareService
vi.mock('../../utilities/ShareService', () => ({
  default: {
    generateShareUrl: vi.fn(),
  }
}));

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
    screen: { characterStorageScreen: true } as any,
    setScreen: vi.fn(),
    loadCharacter: vi.fn(),
    storedCharacters: mockCharacters as any[],
    deleteStoredCharacter: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render all stored characters', () => {
    render(<CharacterStorage {...defaultProps} />);
    expect(screen.getByText('Aragorn')).toBeInTheDocument();
    expect(screen.getByText('Legolas')).toBeInTheDocument();
  });

  it('should trigger selection callbacks when character button is clicked', () => {
    render(<CharacterStorage {...defaultProps} />);
    fireEvent.click(screen.getByText('Aragorn'));
    
    expect(defaultProps.loadCharacter).toHaveBeenCalledWith(mockCharacters[0]);
  });

  it('should call loadCharacter with the full stored character data when a character is selected', () => {
    render(<CharacterStorage {...defaultProps} />);
    fireEvent.click(screen.getByText('Aragorn'));

    expect(defaultProps.loadCharacter).toHaveBeenCalledWith(mockCharacters[0]);
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
    
    expect(defaultProps.loadCharacter).not.toHaveBeenCalled();
  });

  it('should copy share URL to clipboard when share button is clicked', async () => {
    const mockUrl = 'http://share.url?data=123';
    vi.mocked(ShareService.generateShareUrl).mockReturnValue(mockUrl);
    
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<CharacterStorage {...defaultProps} />);
    
    const shareButtons = screen.getAllByTitle('Share');
    expect(shareButtons.length).toBeGreaterThan(0);
    fireEvent.click(shareButtons[0]);
    
    expect(ShareService.generateShareUrl).toHaveBeenCalled();
    expect(writeTextMock).toHaveBeenCalledWith(mockUrl);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Character URL copied to clipboard!');
    });
  });
});

// ── Modal warning when loading a saved character while a partial is in progress ──

const partialInProgress = {
  character: { id: 'partial-id', name: null, languages: [], hasLanguages: null, personality: null, misfortune: null, appearance: null, backgroundSkill: null, alignment: null },
  characterClass: { name: 'Elf' } as any,
  characterStatistics: { hitPoints: null, hpRolls: 0, hpResult: null, armourClass: null, spell: null, hasSpells: false, unarmouredAC: null },
  characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: null },
  characterModifiers: { xpModifierPercentage: '0', strengthModMelee: '0', strengthModDoors: '0', intelligenceModLanguages: '0', intelligenceModLiteracy: '', intelligenceModExtraLanguageCount: '0', wisdomMod: '0', dexterityModAC: '0', dexterityModMissiles: '0', dexterityModInitiative: '0', constitutionMod: '0', charismaModNPCReactions: '0', charismaModRetainersMax: '0', charismaModLoyalty: '0' },
  abilityScores: { strength: 10, intelligence: 10, wisdom: 10, dexterity: 10, constitution: 10, charisma: 10 },
  partial: true as const,
};

describe('CharacterStorage — confirmation modal when partial is in progress', () => {
  const propsWithPartial = {
    loadCharacter: vi.fn(),
    storedCharacters: [{ character: { id: '1', name: 'Aragorn' }, characterClass: { name: 'Fighter' }, characterStatistics: {}, characterEquipment: {}, characterModifiers: {}, abilityScores: {} }] as any[],
    deleteStoredCharacter: vi.fn(),
    partialCharacter: partialInProgress as any,
    clearPartialCharacter: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('does NOT call loadCharacter immediately when a saved character is clicked', () => {
    render(<CharacterStorage {...propsWithPartial} />);
    fireEvent.click(screen.getByText('Aragorn'));
    expect(propsWithPartial.loadCharacter).not.toHaveBeenCalled();
  });

  it('shows a confirmation modal when a saved character is clicked', () => {
    render(<CharacterStorage {...propsWithPartial} />);
    fireEvent.click(screen.getByText('Aragorn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal body warns about the in-progress character', () => {
    render(<CharacterStorage {...propsWithPartial} />);
    fireEvent.click(screen.getByText('Aragorn'));
    expect(screen.getByRole('dialog')).toHaveTextContent(/in.progress/i);
  });

  it('confirming calls clearPartialCharacter and loadCharacter, then closes the modal', () => {
    render(<CharacterStorage {...propsWithPartial} />);
    fireEvent.click(screen.getByText('Aragorn'));
    fireEvent.click(screen.getByRole('button', { name: /Load Character/i }));
    expect(propsWithPartial.clearPartialCharacter).toHaveBeenCalledTimes(1);
    expect(propsWithPartial.loadCharacter).toHaveBeenCalledWith(propsWithPartial.storedCharacters[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cancelling does not call loadCharacter and closes the modal', () => {
    render(<CharacterStorage {...propsWithPartial} />);
    fireEvent.click(screen.getByText('Aragorn'));
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(propsWithPartial.loadCharacter).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clicking the partial card resumes directly without showing the modal', () => {
    render(<CharacterStorage {...propsWithPartial} />);
    const partialCard = screen.getByText(/In Progress/i).closest('.character-button--partial') as HTMLElement;
    fireEvent.click(partialCard);
    expect(propsWithPartial.loadCharacter).toHaveBeenCalledWith(partialInProgress);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
