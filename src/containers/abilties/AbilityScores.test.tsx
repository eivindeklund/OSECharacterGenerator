import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AbilityScores from './AbilityScores';

describe('AbilityScores', () => {
  const defaultProps = {
    abilityScores: {
      strength: 12,
      intelligence: 12,
      wisdom: 12,
      dexterity: 12,
      constitution: 12,
      charisma: 12
    },
    originalAbilityScores: {
      strength: 12,
      intelligence: 12,
      wisdom: 12,
      dexterity: 12,
      constitution: 12,
      charisma: 12
    },
    characterClass: { name: 'Fighter', primeReqs: ['strength'] },
    pointBuy: 0,
    characterModifiers: {
      xpModifierPercentage: '0',
      strengthModMelee: '0',
      strengthModDoors: '0',
      intelligenceModLanguages: '0',
      intelligenceModLiteracy: '',
      intelligenceModExtraLanguageCount: '0',
      wisdomMod: '0',
      dexterityModAC: '0',
      dexterityModMissiles: '0',
      dexterityModInitiative: '0',
      constitutionMod: '0',
      charismaModNPCReactions: '0',
      charismaModRetainersMax: '0',
      charismaModLoyalty: '0'
    },
    scoreActions: {
      rollAttribute: vi.fn(),
      scoreIncrease: vi.fn(),
      scoreDecrease: vi.fn(),
    },
    setAbilityScores: vi.fn(),
    setPointBuy: vi.fn(),
    abilityScoresThatCanDecrease: {
      strength: true,
      intelligence: true,
      wisdom: true,
      dexterity: false,
      constitution: false,
      charisma: false
    }
  };

  it('should render all ability scores', () => {
    render(<AbilityScores {...defaultProps} />);
    expect(screen.getByText('STRENGTH')).toBeInTheDocument();
    expect(screen.getByText('DEXTERITY')).toBeInTheDocument();
  });

  it('should show point buy pool if greater than zero', () => {
    const { rerender } = render(<AbilityScores {...defaultProps} />);
    expect(screen.queryByText(/Point Buy:/i)).not.toBeInTheDocument();

    rerender(<AbilityScores {...defaultProps} pointBuy={2} />);
    expect(screen.getByText(/Point Buy: 2/i)).toBeInTheDocument();
  });

  it('should call scoreIncrease when increase button is clicked', () => {
    const { container } = render(<AbilityScores {...defaultProps} pointBuy={1} />);
    const increaseButtons = container.querySelectorAll('.button--ability--increase');
    fireEvent.click(increaseButtons[0]); // Strength
    expect(defaultProps.scoreActions.scoreIncrease).toHaveBeenCalledWith('strength');
  });

  it('should call scoreDecrease when decrease button is clicked', () => {
    const { container } = render(<AbilityScores {...defaultProps} />);
    const decreaseButtons = container.querySelectorAll('.button--ability--decrease');
    fireEvent.click(decreaseButtons[0]); // Strength
    expect(defaultProps.scoreActions.scoreDecrease).toHaveBeenCalledWith('strength');
  });

  it('should call rollAttribute for "all" when Roll All button is clicked', () => {
    render(<AbilityScores {...defaultProps} />);
    const rollAllButton = screen.getByRole('button', { name: /Roll All/i });
    fireEvent.click(rollAllButton);
    expect(defaultProps.scoreActions.rollAttribute).toHaveBeenCalled();
  });
});
