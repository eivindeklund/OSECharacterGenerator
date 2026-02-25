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
