import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../utilities/i18n';
import AbilityScreen from './AbilityScreen';

// Mock sub-containers to keep it as a smoke test for the screen
vi.mock('../containers/abilties/AbilityScores', () => ({
  default: () => <div data-testid="ability-scores">Ability Scores</div>
}));
vi.mock('../containers/classes/Classes', () => ({
  default: () => <div data-testid="classes">Classes</div>
}));

describe('AbilityScreen', () => {
  const defaultProps = {
    characterClass: { name: 'Fighter', primeReqs: ['strength'] },
    abilityScores: { strength: 10, intelligence: 10, wisdom: 10, dexterity: 10, constitution: 10, charisma: 10 },
    originalAbilityScores: { strength: 10, intelligence: 10, wisdom: 10, dexterity: 10, constitution: 10, charisma: 10 },
    changeCharacterClass: vi.fn(),
    setAbilityScores: vi.fn(),
    pointBuy: 0,
    setPointBuy: vi.fn(),
    characterModifiers: {},
    rollCharacter: vi.fn(),
    scoreActions: {
      rollAttribute: vi.fn(),
      scoreIncrease: vi.fn(),
      scoreDecrease: vi.fn(),
    },
    screen: { abilityScreen: true },
    setScreen: vi.fn(),
    diceEnabled: false,
    abilityScoresThatCanDecrease: { strength: true, intelligence: true, wisdom: true, dexterity: false, constitution: false, charisma: false }
  };

  const renderWithI18n = (props) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <AbilityScreen {...props} />
      </I18nextProvider>
    );
  };

  it('renders the Class and Ability Scores sections', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByTestId('classes')).toBeInTheDocument();
    expect(screen.getByTestId('ability-scores')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByText(/Class Options/i)).toBeInTheDocument();
  });
});
