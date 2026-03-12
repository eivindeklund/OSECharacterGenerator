import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CharacterProvider } from '../contexts/CharacterContext';
import i18n from '../utilities/i18n';
import LandingScreen from './LandingScreen';

describe('LandingScreen', () => {
  const defaultContextValue = {
    diceEnabled: true,
    setDiceEnabled: vi.fn(),
    characterRolled: false,
    setCharacterRolled: vi.fn(),
    rollCharacter: vi.fn(),
    isMobile: false,
    storedCharacters: [],
    partialCharacter: null,
    discardPartialCharacter: vi.fn(),
    loadCharacter: vi.fn(),
  } as any;

  const defaultProps = {
    rollButtonHover: false,
    setRollButtonHover: vi.fn(),
  };

  const renderWithContext = (contextValue = defaultContextValue, props = defaultProps) => {
    return render(
      <MemoryRouter>
        <CharacterProvider value={contextValue}>
          <I18nextProvider i18n={i18n}>
            <LandingScreen {...props} />
          </I18nextProvider>
        </CharacterProvider>
      </MemoryRouter>
    );
  };

  it('should render the app title', () => {
    renderWithContext();
    expect(screen.getByText(/OSE Character Generator/i)).toBeInTheDocument();
  });

  it('should show Tavern button only if characters are stored', () => {
    const { rerender } = renderWithContext();
    expect(screen.queryByRole('button', { name: /Tavern/i })).not.toBeInTheDocument();

    const ctxWithChars = { ...defaultContextValue, storedCharacters: [{ id: '1' }] as any };
    rerender(
      <MemoryRouter>
        <CharacterProvider value={ctxWithChars}>
          <I18nextProvider i18n={i18n}>
            <LandingScreen {...defaultProps} />
          </I18nextProvider>
        </CharacterProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /Tavern/i })).toBeInTheDocument();
  });

  it('should show Dice Animations checkbox only on desktop', () => {
    const { rerender } = renderWithContext();
    expect(screen.getByText(/Dice Animations/i)).toBeInTheDocument();

    const ctxMobile = { ...defaultContextValue, isMobile: true };
    rerender(
      <MemoryRouter>
        <CharacterProvider value={ctxMobile}>
          <I18nextProvider i18n={i18n}>
            <LandingScreen {...defaultProps} />
          </I18nextProvider>
        </CharacterProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText(/Dice Animations/i)).not.toBeInTheDocument();
  });

  it('should call rollCharacter when Start button is clicked', () => {
    renderWithContext();
    const startButton = screen.getByRole('button', { name: /Start/i });
    fireEvent.click(startButton);
    expect(defaultContextValue.rollCharacter).toHaveBeenCalled();
  });
});

