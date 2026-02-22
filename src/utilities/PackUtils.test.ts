import { Cleric, Fighter } from '../constants/constants';
import { calculatePackPrice, resolvePackItems } from './PackUtils';

describe('PackUtils', () => {
  const mockPackItems = [
    { id: 'rope_50', quantity: 1 },
    {
      id: 'special_class_item',
      quantity: 1,
      options: [
        { class: Cleric, id: 'holy_symbol_wooden' },
        { class: Fighter, id: 'sword' },
        { default: true, id: 'tinder_box' }
      ]
    }
  ];

  describe('resolvePackItems', () => {
    test('should resolve standard items', () => {
      const resolved = resolvePackItems([{ id: 'rope_50', quantity: 1 }], 'Any');
      expect(resolved[0].name).toBe("Rope (50')");
    });

    test('should resolve special class items for Cleric', () => {
      const resolved = resolvePackItems(mockPackItems, Cleric);
      expect(resolved.find(i => i.id === 'holy_symbol_wooden')).toBeDefined();
    });

    test('should resolve special class items for Fighter', () => {
      const resolved = resolvePackItems(mockPackItems, Fighter);
      expect(resolved.find(i => i.id === 'sword')).toBeDefined();
    });

    test('should use default for unknown classes', () => {
      const resolved = resolvePackItems(mockPackItems, 'Mage');
      expect(resolved.find(i => i.id === 'tinder_box')).toBeDefined();
    });
  });

  describe('calculatePackPrice', () => {
    test('should calculate correct total price', () => {
      // Rope (1gp) + Tinder box (default, 3gp) = 4gp
      const price = calculatePackPrice(mockPackItems, 'Mage');
      expect(price).toBe(4);
    });
  });
});
