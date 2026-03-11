import { describe, expect, it } from 'vitest';
import equipmentData from './equipmentData';

describe('equipmentData', () => {
  it('should have unique ids', () => {
    const ids = equipmentData.map(item => item.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
});
