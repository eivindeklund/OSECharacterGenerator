import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../utilities/i18n';
import ClassScreen from './ClassScreen';

// Mock sub-containers and components
vi.mock('../containers/class-details/HPRoller', () => ({
  default: () => <div data-testid="hp-roller">HP Roller</div>
}));
vi.mock('../components/class/SavingThrows', () => ({
  default: () => <div data-testid="saving-throws">Saving Throws</div>
}));
vi.mock('../components/class/ClassAbilitiesList', () => ({
  default: () => <div data-testid="abilities-list">Abilities List</div>
}));
vi.mock('../containers/class-details/SpellSelection', () => ({
  default: () => <div data-testid="spell-selection">Spell Selection</div>
}));

describe('ClassScreen', () => {
  const defaultProps = {
    characterClass: { name: 'Fighter', primeReqs: ['strength'], hd: 8 },
    characterStatistics: { hitPoints: 8 },
    setCharacterStatistics: vi.fn(),
    characterModifiers: { constitutionMod: '0' },
    diceEnabled: false,
    rollHP: vi.fn(),
  };

  const renderWithI18n = (props) => {
    return render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <ClassScreen {...props} />
        </I18nextProvider>
      </MemoryRouter>
    );
  };

  it('renders all class-specific sections', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByTestId('hp-roller')).toBeInTheDocument();
    expect(screen.getByTestId('saving-throws')).toBeInTheDocument();
    expect(screen.getByTestId('abilities-list')).toBeInTheDocument();
    expect(screen.getByTestId('spell-selection')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByText(/Character Class/i)).toBeInTheDocument();
    expect(screen.getByText(/Equipment/i)).toBeInTheDocument();
  });
});
