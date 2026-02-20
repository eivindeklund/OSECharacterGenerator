import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../utilities/i18n';
import DetailsScreen from './DetailsScreen';

// Mock CharacterDetails
vi.mock('../containers/character-details/CharacterDetails', () => ({
  default: () => <div data-testid="character-details">Character Details</div>
}));

describe('DetailsScreen', () => {
  const defaultProps = {
    screen: { detailsScreen: true },
    setScreen: vi.fn(),
    character: { name: 'Test Hero' },
    setCharacter: vi.fn(),
    characterClass: { name: 'Fighter' },
    characterModifiers: { charismaModNPCReactions: '0' },
    dice: { diceEnabled: false, diceService: {} },
  };

  const renderWithI18n = (props) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <DetailsScreen {...props} />
      </I18nextProvider>
    );
  };

  it('renders the CharacterDetails component', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByTestId('character-details')).toBeInTheDocument();
  });
});
