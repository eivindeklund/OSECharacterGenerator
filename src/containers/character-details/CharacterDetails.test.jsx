import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CharacterDetails from './CharacterDetails';

describe('CharacterDetails', () => {
  const mockSetCharacter = vi.fn();
  const mockDiceService = {
    show: vi.fn().mockReturnThis(),
    roll: vi.fn().mockResolvedValue([{ value: 50 }]),
  };

  const defaultProps = {
    screen: { detailsScreen: true },
    setScreen: vi.fn(),
    character: {
        name: '',
        alignment: '',
        languages: [],
    },
    setCharacter: mockSetCharacter,
    characterClass: {
        name: 'Fighter',
        languages: 'Common',
    },
    characterModifiers: {
        intelligenceModExtraLanguageCount: "0",
        extraLanguageCount: "0",
    },
    dice: { diceEnabled: true, diceService: mockDiceService },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should update name input', () => {
    render(<CharacterDetails {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Choose Name:/i);
    fireEvent.change(nameInput, { target: { value: 'Aragorn' } });
    expect(nameInput.value).toBe('Aragorn');
  });

  test('should select alignment', () => {
    render(<CharacterDetails {...defaultProps} />);
    const lawfulButton = screen.getByRole('button', { name: /Lawful/i });
    fireEvent.click(lawfulButton);
    expect(lawfulButton).toHaveClass('button--alignment--selected');
  });

  test('should trigger background roll via diceService', async () => {
    render(<CharacterDetails {...defaultProps} />);
    const backgroundButton = screen.getByRole('button', { name: /Background \(d100\)/i });
    
    await act(async () => {
      fireEvent.click(backgroundButton);
    });

    expect(mockDiceService.show).toHaveBeenCalled();
    expect(mockDiceService.roll).toHaveBeenCalledWith('1d100');
    
    // Check if result is displayed (mock returns 50 which maps to something in backgrounds)
    // We'd need to mock characterBackgrounds or wait for the update
    // For now, verifying the service call is a good start for decoupling check
  });
});
