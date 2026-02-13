
import { describe, expect, it } from 'vitest';
import { validateQualitySchema } from '../utilities/WeaponUtils';
import weaponsData from './weaponsData';

describe('weaponsData', () => {
  it('should have valid qualities for all weapons', () => {
    weaponsData.forEach(weapon => {
      // Check that qualities exist and is array
      expect(Array.isArray(weapon.qualities)).toBe(true);

      // Check each quality against schema
      weapon.qualities.forEach(quality => {
        const isValid = validateQualitySchema(quality);
        expect(isValid, `Invalid quality "${quality}" found in weapon "${weapon.name}"`).toBe(true);
      });
    });
  });
});
