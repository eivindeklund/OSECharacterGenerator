import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../utilities/i18n';
import EquipmentScreen from './EquipmentScreen';

// Mock EquipmentStore
vi.mock('../containers/equipment/EquipmentStore', () => ({
  default: () => <div data-testid="equipment-store">Equipment Store</div>
}));

describe('EquipmentScreen', () => {
  const defaultProps = {
    characterClass: { name: 'Fighter' },
    screen: { equipmentScreen: true },
    setScreen: vi.fn(),
    characterModifiers: { strengthModMelee: '0' },
    characterStatistics: { hitPoints: 8 },
    setCharacterStatistics: vi.fn(),
    characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 100 },
    setCharacterEquipment: vi.fn(),
    diceEnabled: false,
    rollGold: vi.fn(),
  };

  const renderWithI18n = (props) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <EquipmentScreen {...props} />
      </I18nextProvider>
    );
  };

  it('renders the EquipmentStore component', () => {
    renderWithI18n(defaultProps);
    expect(screen.getByTestId('equipment-store')).toBeInTheDocument();
  });
});
