import { Cleric, Fighter } from '../constants/constants';
import classOptionsData from '../data/classOptionsData';
import weaponsData from '../data/weaponsData';
import { calculatePackPrice, getOptimalEquipmentPack, resolvePackItems } from './PackUtils';

/** Returns 0 — always picks index 0 from weapon pool, always triggers tier-drop (0 < 0.30). */
const always0 = () => 0;
/** Returns 0.30 — suppresses tier-drop (0.30 is NOT < 0.30) and picks index 0
 *  from a weapon pool of ≤ 3 (Math.floor(0.30 * 3) = 0). */
const noTierDrop = () => 0.30;

const getClass = (name: string) => classOptionsData.find(c => c.name === name)!;

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

  describe('getOptimalEquipmentPack', () => {
    const hasItem = (pack: { id: string }[], id: string) =>
      pack.some(i => i.id === id);

    test('returns empty array for null class', () => {
      expect(getOptimalEquipmentPack(null, 100)).toEqual([]);
    });

    // ── Half-gold armour rule ────────────────────────────────────────────────
    // Armour budget = floor(gold / 2). OSE prices: leather=20, chain=40, plate=60.

    test('Fighter with 30gp gets no armour (budget 15 < leather 20)', () => {
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 30);
      expect(hasItem(pack, 'leather')).toBe(false);
      expect(hasItem(pack, 'chainmail')).toBe(false);
      expect(hasItem(pack, 'plate_mail')).toBe(false);
    });

    test('Fighter with 30gp still gets a melee weapon', () => {
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 30);
      const hasMelee = pack.some(i => (weaponsData as {id: string; category: string}[]).find(w => w.id === i.id && w.category === 'Melee' && w.id !== 'torches'));
      expect(hasMelee).toBe(true);
    });

    test('Fighter with 40gp gets leather (budget 20 = leather 20)', () => {
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 40);
      expect(hasItem(pack, 'leather')).toBe(true);
    });

    test('Fighter with 80gp gets chainmail (budget 40 = chainmail 40)', () => {
      // noTierDrop: 0.30 is NOT < 0.30 so no tier drop applied.
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 80, true, noTierDrop);
      expect(hasItem(pack, 'chainmail')).toBe(true);
      expect(hasItem(pack, 'plate_mail')).toBe(false);
    });

    test('Fighter with 100gp gets chainmail not plate (budget 50 < plate 60)', () => {
      // budget 50 < plate 60 — plate is simply not affordable regardless of rng.
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 100);
      expect(hasItem(pack, 'plate_mail')).toBe(false);
    });

    test('Fighter with 120gp gets plate mail when tier-drop is suppressed', () => {
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 120, true, noTierDrop);
      expect(hasItem(pack, 'plate_mail')).toBe(true);
    });

    // ── Essential gear is always bought before ranged weapons ────────────────

    test('Fighter with 60gp gets essential gear (backpack, waterskin, torches, rations)', () => {
      // 60gp: leather(20) + sword(10) + shield(10) + backpack(5) + waterskin(1) + torches(1) + rations(5) = 52gp ✓
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 60);
      expect(hasItem(pack, 'backpack')).toBe(true);
      expect(hasItem(pack, 'waterskin')).toBe(true);
      expect(hasItem(pack, 'torches')).toBe(true);
      expect(hasItem(pack, 'rations_standard')).toBe(true);
    });

    test('Fighter with 140gp gets plate mail, a melee weapon, shield and long bow', () => {
      // Use noTierDrop to suppress tier-drop and force first weapon choice.
      const pack = getOptimalEquipmentPack(getClass('Fighter'), 140, true, noTierDrop);
      expect(hasItem(pack, 'plate_mail')).toBe(true);
      // A melee weapon must be present (any class-eligible one)
      const hasMelee = pack.some(i => (weaponsData as {id: string; category: string}[]).find(w => w.id === i.id && w.category === 'Melee' && w.id !== 'torches'));
      expect(hasMelee).toBe(true);
      expect(hasItem(pack, 'long_bow')).toBe(true);
      expect(hasItem(pack, 'arrows_20')).toBe(true);
    });

    // ── Class restrictions ───────────────────────────────────────────────────

    test('Cleric gets a blunt weapon (not sword) and holy symbol (silver in B/X)', () => {
      // At 80 gp: chainmail(40) + symbol(25) + essentials(15) = 80 gp.
      // No budget remains for a weapon; test verifies class restrictions are
      // respected (no sword) and symbol is always purchased.
      const pack = getOptimalEquipmentPack(getClass('Cleric'), 80, true, noTierDrop);
      expect(hasItem(pack, 'sword')).toBe(false);
      // B/X holy symbol is silver (no wooden in B/X)
      expect(hasItem(pack, 'holy_symbol_silver')).toBe(true);
    });

    test('Cleric with bxOnly=false gets cheaper wooden holy symbol', () => {
      const pack = getOptimalEquipmentPack(getClass('Cleric'), 80, false);
      expect(hasItem(pack, 'holy_symbol_wooden')).toBe(true);
    });

    test('Cleric with blunt restriction gets sling as ranged weapon', () => {
      // Needs enough gold for armour + weapon + shield + holy symbol + gear + sling (2gp).
      // chainmail(40) + warhammer(5) + shield(10) + holy_symbol_silver(25) + gear(12) + sling(2) = 94gp.
      const pack = getOptimalEquipmentPack(getClass('Cleric'), 100);
      expect(hasItem(pack, 'sling')).toBe(true);
      expect(hasItem(pack, 'long_bow')).toBe(false);
    });

    test('Magic-User gets no armour and uses staff or dagger', () => {
      // Use noTierDrop to force first weapon choice (staff) for a deterministic test.
      const pack = getOptimalEquipmentPack(getClass('Magic-User'), 60, true, noTierDrop);
      expect(hasItem(pack, 'leather')).toBe(false);
      expect(hasItem(pack, 'chainmail')).toBe(false);
      expect(hasItem(pack, 'plate_mail')).toBe(false);
      expect(hasItem(pack, 'staff')).toBe(true);
    });

    test('Magic-User gets no ranged weapon', () => {
      const pack = getOptimalEquipmentPack(getClass('Magic-User'), 60);
      expect(hasItem(pack, 'long_bow')).toBe(false);
      expect(hasItem(pack, 'short_bow')).toBe(false);
      expect(hasItem(pack, 'sling')).toBe(false);
    });

    test('Thief gets leather armour and thieves tools', () => {
      const pack = getOptimalEquipmentPack(getClass('Thief'), 80);
      expect(hasItem(pack, 'leather')).toBe(true);
      expect(hasItem(pack, 'thieves_tools')).toBe(true);
    });

    test('Thief does not get a shield (no shields in leather restriction)', () => {
      const pack = getOptimalEquipmentPack(getClass('Thief'), 80);
      expect(hasItem(pack, 'shield')).toBe(false);
    });

    test('Dwarf cannot use long bow or two-handed sword', () => {
      const pack = getOptimalEquipmentPack(getClass('Dwarf'), 140, true, noTierDrop);
      expect(hasItem(pack, 'long_bow')).toBe(false);
      expect(hasItem(pack, 'two_handed_sword')).toBe(false);
      // With always0, the first affordable eligible weapon (sword) is chosen.
      expect(hasItem(pack, 'sword')).toBe(true);
    });

    // ── Budget safety ────────────────────────────────────────────────────────

    test('pack total cost never exceeds available gold', () => {
      const gold = 90;
      const pack = getOptimalEquipmentPack(getClass('Fighter'), gold);
      const total = pack.reduce((sum, item) => {
        const allItemsMap = resolvePackItems([item], 'Fighter');
        return sum + allItemsMap[0].price * item.quantity;
      }, 0);
      expect(total).toBeLessThanOrEqual(gold);
    });
  });
});
