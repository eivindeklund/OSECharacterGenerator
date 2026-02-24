import armourData from '../data/armourData'
import equipmentData from '../data/equipmentData'
import weaponsData from '../data/weaponsData'
import type { ClassOptionsData } from '../types'

/**
 * Consolidates all item data into a single map for easy lookup.
 */
const processItems = (items, category) => {
        return items.reduce((acc, item) => {
                if (item.id) {
                        acc[item.id] = { ...item, category }
                }
                return acc
        }, {})
}

const allItems = {
        ...processItems(equipmentData, 'gear'),
        ...processItems(weaponsData, 'weapon'),
        ...processItems(armourData, 'armour')
}

/**
 * Resolves a pack's items into a list of displayable objects.
 * Handles conditional logic based on character class.
 *
 * @param {Array} packItems - The items array from a pack object.
 * @param {string} characterClass - The class of the character (e.g. 'Cleric').
 * @returns {Array} List of resolved items with name, quantity, and id.
 */
export const resolvePackItems = (packItems, characterClass) => {
        return packItems.map((itemRef) => {
                let resolvedId = itemRef.id
                let quantity = itemRef.quantity

                // Handle conditional items
                if (resolvedId === 'special_class_item' && itemRef.options) {
                        const classOption = itemRef.options.find(
                                (opt) => opt.class === characterClass
                        )
                        const defaultOption = itemRef.options.find((opt) => opt.default)
                        const selected = classOption || defaultOption

                        if (selected) {
                                resolvedId = selected.id
                        }
                }

                const itemData = allItems[resolvedId]

                if (!itemData) {
                        console.warn(`Item ID not found: ${resolvedId}`)
                        return {
                                id: resolvedId,
                                name: 'Unknown Item',
                                quantity: quantity,
                                price: 0
                        }
                }

                return {
                        ...itemData,
                        quantity
                }
        })
}

/**
 * Calculates the total cost of a pack for a given class.
 *
 * @param {Array} packItems
 * @param {string} characterClass
 * @returns {number} Total price in gold.
 */
export const calculatePackPrice = (packItems, characterClass) => {
        const resolvedItems = resolvePackItems(packItems, characterClass)
        return resolvedItems.reduce((total, item) => {
                return total + (item.price * item.quantity)
        }, 0)
}

// --- Optimal Equipment Pack Generation ---

/** Melee weapons in priority order (one-handed preferred for shield compatibility). */
const MELEE_WEAPON_PRIORITY = [
  'sword',            // 1d8, 10gp, one-handed
  'warhammer',        // 1d6, 5gp, one-handed, blunt
  'mace',             // 1d6, 5gp, one-handed, blunt
  'short_sword',      // 1d6, 7gp, one-handed
  'hand_axe',         // 1d6, 4gp, one-handed
  'spear',            // 1d6, 4gp, one-handed
  'battle_axe',       // 1d8, 7gp, two-handed
  'two_handed_sword', // 1d10, 15gp, two-handed
  'polearm',          // 1d10, 7gp, two-handed
  'staff',            // 1d4, 2gp, two-handed, blunt
  'dagger',           // 1d4, 3gp
  'silver_dagger',    // 1d4, 30gp
  'club',             // 1d4, 3gp, blunt
  'javelin',          // 1d6, 1gp
];

/** Ranged weapon options in priority order (best range/damage first). */
const RANGED_WEAPON_OPTIONS = [
  { weaponId: 'long_bow',  ammoId: 'arrows_20',         totalCost: 45 },
  { weaponId: 'crossbow',  ammoId: 'crossbow_bolts_30', totalCost: 40 },
  { weaponId: 'short_bow', ammoId: 'arrows_20',         totalCost: 30 },
  { weaponId: 'sling',     ammoId: null,                totalCost: 2  },
];

/**
 * Essential gear that every adventurer needs, in priority order.
 * These are purchased before ranged weapons so the character is always
 * equipped for actual dungeon exploration.
 * All items here are in_bx_basic.
 */
const ESSENTIAL_GEAR = [
  { id: 'backpack',         price: 5 },
  { id: 'waterskin',        price: 1 },
  { id: 'torches',          price: 1 },
  { id: 'rations_standard', price: 5 },
];

/**
 * Secondary exploration gear purchased after essential gear and ranged weapons,
 * in priority order.
 * All items here are in_bx_basic.
 */
const SECONDARY_GEAR = [
  { id: 'tinder_box', price: 3 },
  { id: 'rope_50',    price: 1 },
  { id: 'sack_small', price: 1 },
  { id: 'oil_flask',  price: 2 },
];

/** Classes that benefit from thieves' tools. */
const THIEF_CLASSES = ['Thief', 'Acrobat', 'Assassin'];

/**
 * Generates an optimal equipment pack for a character based on class restrictions
 * and available gold.
 *
 * The armour budget is capped at half the available gold (per the OD&D principle
 * "best affordable by spending no more than half of the starting money"), so that
 * weapons and exploration gear are never crowded out by expensive armour.
 *
 * Priority order:
 * 1. Best affordable armour (plate > chainmail > leather) within floor(gold / 2)
 * 2. Best melee weapon the class can use, within remaining budget
 * 3. Shield, if weapon is one-handed and class allows shields
 * 4. Class-specific mandatory items (holy symbol for divine, thieves' tools for thief)
 * 5. Essential exploration gear (backpack, waterskin, torches, rations)
 * 6. Best affordable ranged weapon the class can use
 * 7. Secondary exploration gear (tinder box, rope, sack, oil)
 *
 * @param characterClass - The character's class data, or null if no class selected
 * @param gold - Available gold to spend
 * @param bxOnly - When true, only include items marked as B/X Basic or Expert
 * @returns Array of { id, quantity } items representing the optimal loadout
 */
export function getOptimalEquipmentPack(
  characterClass: ClassOptionsData | null,
  gold: number,
  bxOnly = true
): Array<{ id: string; quantity: number }> {
  if (!characterClass) return [];

  const items: Array<{ id: string; quantity: number }> = [];
  let remainingGold = gold;

  const armourString = characterClass.armour ?? '';
  const canUseShield = () => armourString.includes('shield');

  const isItemBxEligible = (id: string): boolean => {
    if (!bxOnly) return true;
    const item = allItems[id];
    // Weapons (all in B/X Expert) and armour are always eligible.
    // For gear, check the in_bx_basic / in_bx_expert flags.
    if (!item) return false;
    if (item.category === 'weapon' || item.category === 'armour') return true;
    return !!(item.in_bx_basic || item.in_bx_expert);
  };

  const canUseWeapon = (weaponId: string): boolean => {
    const weapon = allItems[weaponId];
    if (!weapon) return false;
    if (!isItemBxEligible(weaponId)) return false;
    return characterClass.isStandardWeapon(weapon);
  };

  const buyGearItem = (id: string, price: number): boolean => {
    if (!isItemBxEligible(id)) return false;
    if (remainingGold < price) return false;
    items.push({ id, quantity: 1 });
    remainingGold -= price;
    return true;
  };

  // 1. Select best affordable armour.
  //    Budget is capped at floor(gold / 2) so weapons and gear are not crowded out.
  if (armourString !== 'none') {
    const armourBudget = Math.floor(gold / 2);
    const armourTiers = [
      { id: 'plate_mail', keyword: 'plate',     price: 60 },
      { id: 'chainmail',  keyword: 'chainmail', price: 40 },
      { id: 'leather',    keyword: 'leather',   price: 20 },
    ];
    for (const tier of armourTiers) {
      if (
        armourString.includes(tier.keyword) &&
        tier.price <= armourBudget &&
        tier.price <= remainingGold
      ) {
        items.push({ id: tier.id, quantity: 1 });
        remainingGold -= tier.price;
        break;
      }
    }
  }

  // 2. Select best affordable melee weapon allowed by class.
  let meleeTwoHanded = false;
  for (const weaponId of MELEE_WEAPON_PRIORITY) {
    const weapon = allItems[weaponId];
    if (!weapon) continue;
    if (!canUseWeapon(weaponId)) continue;
    if ((weapon.price as number) > remainingGold) continue;
    items.push({ id: weaponId, quantity: 1 });
    remainingGold -= weapon.price as number;
    meleeTwoHanded = (weapon.qualities as string[] | undefined)?.includes('Two-handed') ?? false;
    break;
  }

  // 3. Add shield if using a one-handed weapon and class allows shields.
  if (!meleeTwoHanded && canUseShield() && remainingGold >= 10) {
    items.push({ id: 'shield', quantity: 1 });
    remainingGold -= 10;
  }

  // 4. Class-specific mandatory items.
  //    Divine classes (Cleric, Druid, etc.) need a holy symbol.
  //    B/X only has holy_symbol_silver (25gp); non-B/X can use the cheaper
  //    holy_symbol_wooden (1gp).
  if (characterClass.divine) {
    if (!buyGearItem('holy_symbol_wooden', 1)) {
      buyGearItem('holy_symbol_silver', 25);
    }
  }
  //    Thief-type classes need thieves' tools.
  if (THIEF_CLASSES.includes(characterClass.name)) {
    buyGearItem('thieves_tools', 25);
  }

  // 5. Essential exploration gear — bought before ranged weapons so the
  //    character is always viable for dungeon exploration.
  for (const gear of ESSENTIAL_GEAR) {
    buyGearItem(gear.id, gear.price);
  }

  // 6. Best affordable ranged weapon allowed by class.
  for (const option of RANGED_WEAPON_OPTIONS) {
    if (!canUseWeapon(option.weaponId)) continue;
    if (remainingGold < option.totalCost) continue;
    items.push({ id: option.weaponId, quantity: 1 });
    if (option.ammoId) {
      items.push({ id: option.ammoId, quantity: 1 });
    }
    remainingGold -= option.totalCost;
    break;
  }

  // 7. Secondary exploration gear.
  for (const gear of SECONDARY_GEAR) {
    buyGearItem(gear.id, gear.price);
  }

  return items;
}
