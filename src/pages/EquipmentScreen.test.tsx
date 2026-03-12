import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { CharacterProvider } from '../contexts/CharacterContext';
import i18n from '../utilities/i18n';
import EquipmentScreen from './EquipmentScreen';

// Mock EquipmentStore
vi.mock('../containers/equipment/EquipmentStore', () => ({
  default: () => <div data-testid="equipment-store">Equipment Store</div>
}));

describe('EquipmentScreen', () => {
  const mockContextValue = {
    characterClass: { name: 'Fighter' },
    characterModifiers: { strengthModMelee: '0' },
    characterStatistics: { hitPoints: 8 },
    setCharacterStatistics: vi.fn(),
    characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 100 },
    setCharacterEquipment: vi.fn(),
    diceEnabled: false,
    rollGold: vi.fn(),
  } as any;

  const renderWithI18n = () => {
    return render(
      <CharacterProvider value={mockContextValue}>
        <I18nextProvider i18n={i18n}>
          <EquipmentScreen />
        </I18nextProvider>
      </CharacterProvider>
    );
  };

  it('renders the EquipmentStore component', () => {
    renderWithI18n();
    expect(screen.getByTestId('equipment-store')).toBeInTheDocument();
  });
});
