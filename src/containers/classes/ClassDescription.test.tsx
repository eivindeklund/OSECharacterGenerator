import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import classOptionsData from '../../data/classOptionsData';
import type { AbilityScores } from '../../types';
import ClassDescription from './ClassDescription';

const elf = classOptionsData.find((c) => c.name === 'Elf')!;
const fighter = classOptionsData.find((c) => c.name === 'Fighter')!;

function elfScores(int: number, str: number): AbilityScores {
  return {
    strength: str,
    intelligence: int,
    wisdom: 10,
    dexterity: 10,
    constitution: 10,
    charisma: 10,
  };
}

// ── Single-prime-req class (Fighter) ─────────────────────────────────────────

describe('ClassDescription — Fighter (single prime req, no xpBonusRule)', () => {
  it('renders without crashing when abilityScores are provided', () => {
    const scores: AbilityScores = {
      strength: 15, intelligence: 10, wisdom: 10,
      dexterity: 10, constitution: 10, charisma: 10,
    };
    render(<ClassDescription characterClass={fighter} abilityScores={scores} />);
    expect(screen.getByText(/Fighter/i)).toBeInTheDocument();
  });

  it('does not render an XP Bonus Rule section', () => {
    const scores: AbilityScores = {
      strength: 15, intelligence: 10, wisdom: 10,
      dexterity: 10, constitution: 10, charisma: 10,
    };
    const { container } = render(
      <ClassDescription characterClass={fighter} abilityScores={scores} />
    );
    expect(container.textContent).not.toContain('XP Bonus Rule');
  });
});

// ── Two-prime-req class (Elf) ─────────────────────────────────────────────────

describe('ClassDescription — Elf (two prime reqs)', () => {
  it('renders the XP Bonus Rule label when abilityScores are provided', () => {
    render(<ClassDescription characterClass={elf} abilityScores={elfScores(17, 13)} />);
    expect(screen.getByText(/XP Bonus Rule/i)).toBeInTheDocument();
  });

  it('renders the XP Bonus Rule label when abilityScores are not provided', () => {
    render(<ClassDescription characterClass={elf} />);
    expect(screen.getByText(/XP Bonus Rule/i)).toBeInTheDocument();
  });

  describe('INT 17, STR 13 → 10% clause should be bold', () => {
    it('renders "intelligence (17)" in the bonus rule', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(17, 13)} />
      );
      expect(container.textContent).toContain('intelligence (17)');
    });

    it('renders "strength (13)" in the bonus rule', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(17, 13)} />
      );
      expect(container.textContent).toContain('strength (13)');
    });

    it('wraps the active 10% clause in <strong>', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(17, 13)} />
      );
      const strongs = container.querySelectorAll('strong');
      const activeStrong = [...strongs].find((el) =>
        el.textContent?.includes('10%') && el.textContent?.includes('intelligence (17)')
      );
      expect(activeStrong).toBeDefined();
    });

    it('does not wrap the inactive 5% clause in <strong>', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(17, 13)} />
      );
      const strongs = container.querySelectorAll('strong');
      const inactive5Pct = [...strongs].find(
        (el) => el.textContent?.startsWith('5%') || el.textContent?.startsWith('5 %')
      );
      expect(inactive5Pct).toBeUndefined();
    });
  });

  describe('INT 13, STR 13 → 5% clause should be bold', () => {
    it('wraps the active 5% clause in <strong>', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(13, 13)} />
      );
      const strongs = container.querySelectorAll('strong');
      const activeStrong = [...strongs].find((el) =>
        el.textContent?.startsWith('5%')
      );
      expect(activeStrong).toBeDefined();
    });

    it('does not wrap the 10% clause in <strong>', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(13, 13)} />
      );
      const strongs = container.querySelectorAll('strong');
      const active10Pct = [...strongs].find((el) => el.textContent?.startsWith('10%'));
      expect(active10Pct).toBeUndefined();
    });
  });

  describe('INT 8, STR 8 → "0% otherwise" should be bold', () => {
    it('wraps "0% otherwise" in <strong>', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(8, 8)} />
      );
      const strongs = container.querySelectorAll('strong');
      const activeStrong = [...strongs].find((el) =>
        el.textContent?.includes('0% otherwise')
      );
      expect(activeStrong).toBeDefined();
    });
  });

  describe('no abilityScores → no clause <strong>', () => {
    it('renders all rule text without any <strong> wrappers', () => {
      const { container } = render(<ClassDescription characterClass={elf} />);
      // XP Bonus Rule section should be present but no strong elements in it
      const bonusRuleSection = container.querySelector('.class-description--xp-bonus-rule');
      expect(bonusRuleSection).not.toBeNull();
      const strongs = bonusRuleSection!.querySelectorAll('strong');
      expect(strongs).toHaveLength(0);
    });

    it('renders rule text without score parentheticals', () => {
      const { container } = render(<ClassDescription characterClass={elf} />);
      expect(container.textContent).not.toMatch(/intelligence \(\d+\)/);
      expect(container.textContent).not.toMatch(/strength \(\d+\)/);
    });
  });

  describe('"0% otherwise" always appears at end', () => {
    it('contains "0% otherwise" in the XP bonus rule', () => {
      const { container } = render(
        <ClassDescription characterClass={elf} abilityScores={elfScores(17, 13)} />
      );
      expect(container.textContent).toContain('0% otherwise');
    });
  });
});
