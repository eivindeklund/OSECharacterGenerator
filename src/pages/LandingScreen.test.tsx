import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../utilities/i18n';
import LandingScreen from './LandingScreen';

describe('LandingScreen', () => {
  const defaultProps = {
    diceEnabled: true,
    setDiceEnabled: vi.fn(),
    characterRolled: false,
    setCharacterRolled: vi.fn(),
    rollButtonHover: false,
    setRollButtonHover: vi.fn(),
    rollCharacter: vi.fn(),
    isMobile: false,
    storedCharacters: []
  };

  const renderWithI18n = (props) => {
    return render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <LandingScreen {...props} />
        </I18nextProvider>
      </MemoryRouter>
    );
  };

  it('should render the app title', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByText(/OSE Character Generator/i)).toBeInTheDocument();
  });

  it('should show Tavern button only if characters are stored', () => {
    const { rerender } = renderWithI18n(defaultProps);
    expect(screen.queryByRole('button', { name: /Tavern/i })).not.toBeInTheDocument();

    const propsWithChars = { ...defaultProps, storedCharacters: [{ id: '1' }] as any };
    rerender(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <LandingScreen {...propsWithChars} />
        </I18nextProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /Tavern/i })).toBeInTheDocument();
  });

  it('should show Dice Animations checkbox only on desktop', () => {
    const { rerender } = renderWithI18n(defaultProps);
    expect(screen.getByText(/Dice Animations/i)).toBeInTheDocument();

    const propsMobile = { ...defaultProps, isMobile: true };
    rerender(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <LandingScreen {...propsMobile} />
        </I18nextProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText(/Dice Animations/i)).not.toBeInTheDocument();
  });

  it('should call rollCharacter when Start button is clicked', () => {
    renderWithI18n(defaultProps);
    const startButton = screen.getByRole('button', { name: /Start/i });
    fireEvent.click(startButton);
    expect(defaultProps.rollCharacter).toHaveBeenCalled();
  });
});
