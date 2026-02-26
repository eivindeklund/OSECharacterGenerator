import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../utilities/i18n';
import CharacterSheetScreen from './CharacterSheetScreen';

// Mock sub-components
vi.mock('../containers/character/CharacterSheet', () => ({
  // Use generic forwardRef mock
  default: require('react').forwardRef((props, ref) => <div data-testid="character-sheet" ref={ref}>Character Sheet</div>)
}));
vi.mock('../containers/character/PDFExport', () => ({
  default: () => <div data-testid="pdf-export">PDF Export</div>
}));

describe('CharacterSheetScreen', () => {
  const defaultProps = {
    character: { name: 'Test Hero' },
    characterStatistics: { hitPoints: 10, armourClass: 9 },
    characterClass: { name: 'Fighter' },
    characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 100 },
    characterModifiers: {},
    abilityScores: { strength: 10 },
    setCharacterRolled: vi.fn(),
    saveCharacter: vi.fn(),
  };

  const renderWithI18n = (props) => {
    return render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <CharacterSheetScreen {...props} />
        </I18nextProvider>
      </MemoryRouter>
    );
  };

  it('renders the Character Sheet and PDF Export sections', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByTestId('character-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
  });

  it('calls saveCharacter on mount', () => {
    renderWithI18n(defaultProps);
    expect(defaultProps.saveCharacter).toHaveBeenCalled();
  });

  it('renders navigation buttons', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByText(/Character Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Tavern/i)).toBeInTheDocument();
    expect(screen.getByText(/Main Page/i)).toBeInTheDocument();
  });
});
