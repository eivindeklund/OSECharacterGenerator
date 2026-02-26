import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useCharacterManager } from '../hooks/useCharacterManager';
import CharacterGenerator from './CharacterGenerator';

// Mock the hook and the Dice box
vi.mock('../hooks/useCharacterManager');
vi.mock('../utilities/DiceBox', () => ({
  Dice: {
    init: vi.fn().mockResolvedValue(true),
    show: vi.fn().mockReturnThis(),
    hide: vi.fn().mockReturnThis(),
    roll: vi.fn().mockReturnThis(),
  }
}));

// Mock child components to keep it as a smoke test for the generator logic
vi.mock('./LandingScreen', () => ({
  default: () => <div data-testid="landing-screen">Landing Screen</div>
}));
vi.mock('./AbilityScreen', () => ({
  default: () => <div data-testid="ability-screen">Ability Screen</div>
}));
vi.mock('./ClassScreen', () => ({
  default: () => <div data-testid="class-screen">Class Screen</div>
}));
vi.mock('./EquipmentScreen', () => ({
  default: () => <div data-testid="equipment-screen">Equipment Screen</div>
}));
vi.mock('./DetailsScreen', () => ({
  default: () => <div data-testid="details-screen">Details Screen</div>
}));
vi.mock('./CharacterSheetScreen', () => ({
  default: () => <div data-testid="character-sheet-screen">Character Sheet Screen</div>
}));
vi.mock('./CharacterStorageScreen', () => ({
  default: () => <div data-testid="character-storage-screen">Character Storage Screen</div>
}));

describe('CharacterGenerator', () => {
  const mockManagerBase = {
    character: {},
    setCharacter: vi.fn(),
    abilityScores: {},
    setAbilityScores: vi.fn(),
    characterModifiers: {},
    setCharacterModifiers: vi.fn(),
    characterStatistics: {},
    setCharacterStatistics: vi.fn(),
    pointBuy: 0,
    setPointBuy: vi.fn(),
    characterClass: { name: null, primeReqs: [] },
    setCharacterClass: vi.fn(),
    characterEquipment: {},
    setCharacterEquipment: vi.fn(),
    diceEnabled: false,
    setDiceEnabled: vi.fn(),
    characterRolled: false,
    setCharacterRolled: vi.fn(),
    rollAttribute: vi.fn(),
    rollCharacter: vi.fn(),
    changeCharacterClass: vi.fn(),
    rollHP: vi.fn(),
    rollGold: vi.fn(),
    scoreIncrease: vi.fn(),
    scoreDecrease: vi.fn(),
    saveCharacter: vi.fn(),
    deleteStoredCharacter: vi.fn(),
    importCharacter: vi.fn(),
    storedCharacters: [],
    isMobile: false,
    abilityScoresThatCanDecrease: {},
  };

  const renderAt = (path: string, overrides = {}) => {
    vi.mocked(useCharacterManager).mockReturnValue({ ...mockManagerBase, ...overrides } as any);
    return render(
      <MemoryRouter initialEntries={[path]}>
        <CharacterGenerator />
      </MemoryRouter>
    );
  };

  it('renders LandingScreen when character has not been rolled', () => {
    renderAt('/');
    expect(screen.getByTestId('landing-screen')).toBeInTheDocument();
  });

  it('renders AbilityScreen at /ability', () => {
    renderAt('/ability', { characterRolled: true });
    expect(screen.getByTestId('ability-screen')).toBeInTheDocument();
  });

  it('renders ClassScreen at /class', () => {
    renderAt('/class', { characterRolled: true });
    expect(screen.getByTestId('class-screen')).toBeInTheDocument();
  });

  it('renders EquipmentScreen at /equipment', () => {
    renderAt('/equipment', { characterRolled: true });
    expect(screen.getByTestId('equipment-screen')).toBeInTheDocument();
  });

  it('renders DetailsScreen at /details', () => {
    renderAt('/details', { characterRolled: true });
    expect(screen.getByTestId('details-screen')).toBeInTheDocument();
  });

  it('renders CharacterSheetScreen at /sheet', () => {
    renderAt('/sheet', { characterRolled: true });
    expect(screen.getByTestId('character-sheet-screen')).toBeInTheDocument();
  });

  it('renders CharacterStorageScreen at /tavern', () => {
    renderAt('/tavern', { characterRolled: true });
    expect(screen.getByTestId('character-storage-screen')).toBeInTheDocument();
  });
});
