import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CharacterProvider } from '../contexts/CharacterContext';
import i18n from '../utilities/i18n';
import DetailsScreen from './DetailsScreen';

// Prevent DiceBox from trying to attach to a DOM canvas during tests
vi.mock('../utilities/DiceBox', () => ({ Dice: {} }));

// Mock CharacterDetails
vi.mock('../containers/character-details/CharacterDetails', () => ({
  default: () => <div data-testid="character-details">Character Details</div>
}));

describe('DetailsScreen', () => {
  const mockContextValue = {
    character: { name: 'Test Hero' },
    setCharacter: vi.fn(),
    characterClass: { name: 'Fighter' },
    characterModifiers: { charismaModNPCReactions: '0' },
    abilityScores: {},
    diceEnabled: false,
    isMobile: false,
  } as any;

  const renderWithContext = () => {
    return render(
      <MemoryRouter>
        <CharacterProvider value={mockContextValue}>
          <I18nextProvider i18n={i18n}>
            <DetailsScreen />
          </I18nextProvider>
        </CharacterProvider>
      </MemoryRouter>
    );
  };

  it('renders the CharacterDetails component', () => {
    renderWithContext();
    expect(screen.getByTestId('character-details')).toBeInTheDocument();
  });
});
