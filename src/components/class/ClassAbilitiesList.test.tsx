import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import classOptionsData from '../../data/classOptionsData';
import ClassAbilitiesList from './ClassAbilitiesList';

describe('ClassAbilitiesList', () => {
  const thief = classOptionsData.find((c) => c.name === 'Thief')!;
  const cleric = classOptionsData.find((c) => c.name === 'Cleric')!;
  const halfling = classOptionsData.find((c) => c.name === 'Halfling')!;
  const magicUser = classOptionsData.find((c) => c.name === 'Magic-User')!;
  const elf = classOptionsData.find((c) => c.name === 'Elf')!;
  const dwarf = classOptionsData.find((c) => c.name === 'Dwarf')!;

  describe('Thief at level 1', () => {
    it('shows Back-stab with a description mentioning damage', () => {
      render(<ClassAbilitiesList characterClass={thief} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some((i) => i.textContent?.includes('Backstab') && i.textContent?.includes('+4')),
      ).toBe(true);
    });

    it('shows each thief skill as a separate ability', () => {
      render(<ClassAbilitiesList characterClass={thief} level={1} />);
      const items = screen.getAllByRole('listitem');
      const texts = items.map((i) => i.textContent ?? '');
      expect(texts.some((t) => t.includes('Climb Sheer Surfaces'))).toBe(true);
      expect(texts.some((t) => t.includes('Hear Noise'))).toBe(true);
      expect(texts.some((t) => t.includes('Hide in Shadows'))).toBe(true);
      expect(texts.some((t) => t.includes('Move Silently'))).toBe(true);
      expect(texts.some((t) => t.includes('Open Locks'))).toBe(true);
      expect(texts.some((t) => t.includes('Pick Pockets'))).toBe(true);
    });

    it('includes skill percentages/dice for level 1', () => {
      render(<ClassAbilitiesList characterClass={thief} level={1} />);
      const items = screen.getAllByRole('listitem');
      const texts = items.map((i) => i.textContent ?? '');
      expect(texts.some((t) => t.includes('Climb Sheer Surfaces') && t.includes('87%'))).toBe(true);
      expect(texts.some((t) => t.includes('Hear Noise') && t.includes('1d6'))).toBe(true);
      expect(texts.some((t) => t.includes('Hide in Shadows') && t.includes('10%'))).toBe(true);
    });

    it('does not show Read Languages at level 1', () => {
      render(<ClassAbilitiesList characterClass={thief} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Read Languages'))).toBe(true);
    });

    it('does not show Scroll Use at level 1', () => {
      render(<ClassAbilitiesList characterClass={thief} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Scroll Use'))).toBe(true);
    });

    it('shows Read Languages at level 4', () => {
      render(<ClassAbilitiesList characterClass={thief} level={4} />);
      const items = screen.getAllByRole('listitem');
      expect(items.some((i) => i.textContent?.includes('Read Languages'))).toBe(true);
    });

    it('shows Scroll Use at level 10', () => {
      render(<ClassAbilitiesList characterClass={thief} level={10} />);
      const items = screen.getAllByRole('listitem');
      expect(items.some((i) => i.textContent?.includes('Scroll Use'))).toBe(true);
    });
  });

  describe('Cleric', () => {
    it('does not show Divine Magic at level 1', () => {
      render(<ClassAbilitiesList characterClass={cleric} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Divine Magic'))).toBe(true);
    });

    it('shows Divine Magic at level 2', () => {
      render(<ClassAbilitiesList characterClass={cleric} level={2} />);
      const items = screen.getAllByRole('listitem');
      expect(items.some((i) => i.textContent?.includes('Divine Magic'))).toBe(true);
    });

    it('shows Turning the Undead at level 1 with dice info', () => {
      render(<ClassAbilitiesList characterClass={cleric} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some(
          (i) => i.textContent?.includes('Turning the Undead') && i.textContent?.includes('2d6'),
        ),
      ).toBe(true);
    });
  });

  describe('Halfling', () => {
    it('does not show Listening at Doors', () => {
      render(<ClassAbilitiesList characterClass={halfling} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Listening at Doors'))).toBe(true);
    });

    it('shows Defensive Bonus with AC +2 against large opponents', () => {
      render(<ClassAbilitiesList characterClass={halfling} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some(
          (i) =>
            i.textContent?.includes('Defensive Bonus') &&
            i.textContent?.includes('AC +2') &&
            i.textContent?.toLowerCase().includes('large'),
        ),
      ).toBe(true);
    });

    it('shows Missile Attack Bonus with +1', () => {
      render(<ClassAbilitiesList characterClass={halfling} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some(
          (i) => i.textContent?.includes('Missile Attack Bonus') && i.textContent?.includes('+1'),
        ),
      ).toBe(true);
    });

    it('shows Initiative Bonus with +1', () => {
      render(<ClassAbilitiesList characterClass={halfling} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some(
          (i) =>
            i.textContent?.toLowerCase().includes('initiative') &&
            i.textContent?.includes('+1'),
        ),
      ).toBe(true);
    });

    it('shows Hiding with 90% and 2-in-6 details', () => {
      render(<ClassAbilitiesList characterClass={halfling} level={1} />);
      const items = screen.getAllByRole('listitem');
      const hidingItem = items.find((i) => i.textContent?.includes('Hiding'));
      expect(hidingItem).toBeTruthy();
      expect(hidingItem?.textContent).toContain('90%');
      expect(hidingItem?.textContent).toContain('2-in-6');
    });
  });

  describe('Magic-User', () => {
    it('mentions scrolls in Arcane Magic', () => {
      render(<ClassAbilitiesList characterClass={magicUser} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(items.some((i) => i.textContent?.toLowerCase().includes('scroll'))).toBe(true);
    });

    it('mentions arcane magic items', () => {
      render(<ClassAbilitiesList characterClass={magicUser} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(items.some((i) => i.textContent?.toLowerCase().includes('magic item'))).toBe(true);
    });
  });

  describe('Elf', () => {
    it('does not show Detect Secret Doors (reflected in sheet)', () => {
      render(<ClassAbilitiesList characterClass={elf} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Detect Secret Doors'))).toBe(true);
    });

    it('does not show Listening at Doors (reflected in sheet)', () => {
      render(<ClassAbilitiesList characterClass={elf} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Listening at Doors'))).toBe(true);
    });

    it("shows Infravision with 60' range", () => {
      render(<ClassAbilitiesList characterClass={elf} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some((i) => i.textContent?.includes('Infravision') && i.textContent?.includes("60'")),
      ).toBe(true);
    });
  });

  describe('Dwarf', () => {
    it('does not show Detect Room Traps (reflected in sheet)', () => {
      render(<ClassAbilitiesList characterClass={dwarf} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Detect Room Traps'))).toBe(true);
    });

    it('does not show Listening at Doors (reflected in sheet)', () => {
      render(<ClassAbilitiesList characterClass={dwarf} level={1} />);
      const items = screen.queryAllByRole('listitem');
      expect(items.every((i) => !i.textContent?.includes('Listening at Doors'))).toBe(true);
    });

    it('shows Detect Construction Tricks with 2-in-6 chance', () => {
      render(<ClassAbilitiesList characterClass={dwarf} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some(
          (i) =>
            i.textContent?.includes('Detect Construction Tricks') &&
            i.textContent?.includes('2-in-6'),
        ),
      ).toBe(true);
    });

    it("shows Infravision with 60' range", () => {
      render(<ClassAbilitiesList characterClass={dwarf} level={1} />);
      const items = screen.getAllByRole('listitem');
      expect(
        items.some(
          (i) => i.textContent?.includes('Infravision') && i.textContent?.includes("60'"),
        ),
      ).toBe(true);
    });
  });
});
