const armourData = [
  { id: "unarmoured", name: "Unarmoured", AC: 10, price: 0, weight: 0 },
  { id: "leather", name: "Leather", AC: 12, price: 20, weight: 200 },
  { id: "chainmail", name: "Chainmail", AC: 14, price: 40, weight: 400 },
  { id: "plate_mail", name: "Plate mail", AC: 16, price: 60, weight: 500 },
  { id: "shield", name: "Shield", AC: "+1 bonus", price: 10, weight: 100 },
];
/** Canonical armour IDs — use these instead of magic strings. */
export const ARMOUR_ID = {
  leather:   'leather',
  chainmail: 'chainmail',
  plateMail: 'plate_mail',
  shield:    'shield',
} as const;

/** All standard armour types. Use as the return value for classes that may wear any armour. */
export const ALL_ARMOUR: string[] = [
  ARMOUR_ID.leather,
  ARMOUR_ID.chainmail,
  ARMOUR_ID.plateMail,
  ARMOUR_ID.shield,
];

export default armourData;
