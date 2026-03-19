
/**
 * Custom assert that logs in the browser but throws in Vitest.
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    // Check if we are running in Vitest (typically MODE === 'test')
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      throw new Error(`Assertion failed: ${message}`);
    } else {
      // In browser, just log the error without crashing the app
      console.error(`Assertion failed: ${message}`);
    }
  }
}

const validQualities = new Set([
  'Melee',
  'Slow',
  'Two-handed',
  'Blunt',
  'Brace',
  'Charge',
  'Ammunition',
  'Splash weapon',
  'Reload'
]);

const specialCheckers = {
  'Missile': (quality) => /^Missile \(.*\)$/.test(quality)
};

/* Universal weapon IDs — these items can be used by any class regardless of weapon restrictions */
const universalWeaponIds = ['holy_water_vial', 'oil_flask_burning', 'torches'];

/**
 * Checks if a weapon is a universal item that anyone can use (e.g. equipment-weapons).
 */
export const isUniversalWeapon = (weapon) => universalWeaponIds.includes(weapon.id);

/**
 * Checks if a weapon has a specific quality.
 * @param {object} weapon - The weapon object from weaponsData.
 * @param {string} wantedQuality - The quality to check for (e.g. 'Blunt', 'Missile').
 * @returns {boolean}
 */
export function checkWeaponQuality(weapon, wantedQuality) {
  // Assert wantedQuality is valid logic
  const isSpecial = Object.keys(specialCheckers).includes(wantedQuality);
  assert(
    validQualities.has(wantedQuality) || isSpecial,
    `Invalid wanted quality: ${wantedQuality}`
  );

  const checker = isSpecial
    ? specialCheckers[wantedQuality]
    : (quality: string) => quality === wantedQuality;

  return weapon.qualities.some(q => checker(q));
}

/**
 * Validates that a specific quality string from a weapon is valid according to schema.
 * Used for testing.
 */
export function validateQualitySchema(qualityString) {
  // Check if it matches any plain quality
  if (validQualities.has(qualityString)) return true;

  // Check if it matches any special checker
  for (const checker of Object.values(specialCheckers)) {
    if (checker(qualityString)) return true;
  }

  return false;
}
