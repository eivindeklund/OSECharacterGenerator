import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Classes, { xpBadgeLabel } from './Classes';

// Shared props factory
const makeProps = (
  abilityScores: Record<string, number | null>,
  selectedClassName = ''
) => ({
  characterClass: { name: selectedClassName },
  abilityScores: {
    strength: abilityScores.strength ?? null,
    intelligence: abilityScores.intelligence ?? null,
    wisdom: abilityScores.wisdom ?? null,
    dexterity: abilityScores.dexterity ?? null,
    constitution: abilityScores.constitution ?? null,
    charisma: abilityScores.charisma ?? null,
  },
  changeCharacterClass: vi.fn(),
});

/** All scores at 10 — every class is selectable, all prime reqs give 0% XP. */
const neutralScores = { strength: 10, intelligence: 10, wisdom: 10, dexterity: 10, constitution: 10, charisma: 10 };

/** STR 13 → Fighter prime req gives +5% XP. */
const positiveXpScores = { ...neutralScores, strength: 13 };

/** STR 6 → Fighter prime req gives −10% XP. */
const negativeXpScores = { ...neutralScores, strength: 6 };

/** INT 8 → Elf fails minimum-9-INT requirement (unselectable). */
const elfUnselectableScores = { ...neutralScores, intelligence: 8 };

// ─── Pure helper: xpBadgeLabel ────────────────────────────────────────────────

describe('xpBadgeLabel', () => {
  it('prefixes positive XP with a + sign', () => {
    expect(xpBadgeLabel('5%')).toBe('+5% XP');
    expect(xpBadgeLabel('10%')).toBe('+10% XP');
  });

  it('shows negative XP as-is', () => {
    expect(xpBadgeLabel('-10%')).toBe('-10% XP');
    expect(xpBadgeLabel('-20%')).toBe('-20% XP');
  });

  it('returns a non-breaking space for 0% XP', () => {
    expect(xpBadgeLabel('0%')).toBe('\u00A0');
  });

  it('returns a non-breaking space when xpMod is null (unrolled / unselectable)', () => {
    expect(xpBadgeLabel(null)).toBe('\u00A0');
  });
});

// ─── Component: XP border classes applied to wrappers ─────────────────────────

/** Returns the `.class-option-wrapper` div that contains the named class button. */
function wrapperFor(buttonName: string): Element {
  return screen.getByRole('button', { name: buttonName }).closest('.class-option-wrapper')!;
}

describe('Classes — XP modifier indicators', () => {
  it('shows no XP border classes on any wrapper when scores have not been rolled', () => {
    const nullScores = { strength: null, intelligence: null, wisdom: null, dexterity: null, constitution: null, charisma: null };
    render(<Classes {...makeProps(nullScores)} />);

    const wrapper = wrapperFor('Fighter');
    expect(wrapper).not.toHaveClass('class-option-wrapper--xp-positive');
    expect(wrapper).not.toHaveClass('class-option-wrapper--xp-negative');
    expect(wrapper).not.toHaveClass('class-option-wrapper--xp-zero');
  });

  it('gives a positive border class to a selectable class with positive XP', () => {
    render(<Classes {...makeProps(positiveXpScores)} />);

    expect(wrapperFor('Fighter')).toHaveClass('class-option-wrapper--xp-positive');
  });

  it('gives a negative border class to a selectable class with negative XP', () => {
    render(<Classes {...makeProps(negativeXpScores)} />);

    expect(wrapperFor('Fighter')).toHaveClass('class-option-wrapper--xp-negative');
  });

  it('gives no colored border class to a selectable class with 0% XP', () => {
    render(<Classes {...makeProps(neutralScores)} />);

    const wrapper = wrapperFor('Fighter');
    expect(wrapper).not.toHaveClass('class-option-wrapper--xp-positive');
    expect(wrapper).not.toHaveClass('class-option-wrapper--xp-negative');
    expect(wrapper).not.toHaveClass('class-option-wrapper--xp-zero');
  });

  it('gives the grey (xp-zero) border class to an unselectable class', () => {
    // INT 8 fails Elf's "minimum 9 intelligence" requirement
    render(<Classes {...makeProps(elfUnselectableScores)} />);

    expect(wrapperFor('Elf')).toHaveClass('class-option-wrapper--xp-zero');
  });

  it('does not give XP zero class to selectable classes when an unselectable class is present', () => {
    render(<Classes {...makeProps(elfUnselectableScores)} />);

    // Fighter is still selectable and has STR 10 → 0% with no colored ring
    const fighterWrapper = wrapperFor('Fighter');
    expect(fighterWrapper).not.toHaveClass('class-option-wrapper--xp-zero');
    expect(fighterWrapper).not.toHaveClass('class-option-wrapper--xp-positive');
    expect(fighterWrapper).not.toHaveClass('class-option-wrapper--xp-negative');
  });
});

// ─── Component: XP badge text ─────────────────────────────────────────────────

describe('Classes — XP badge text', () => {
  it('shows +N% XP badge text for a selectable class with positive XP', () => {
    render(<Classes {...makeProps(positiveXpScores)} />);

    const fighterWrapper = wrapperFor('Fighter');
    expect(fighterWrapper.querySelector('.class-option-xp-badge')?.textContent).toBe('+5% XP');
  });

  it('shows −N% XP badge text for a selectable class with negative XP', () => {
    render(<Classes {...makeProps(negativeXpScores)} />);

    const fighterWrapper = wrapperFor('Fighter');
    expect(fighterWrapper.querySelector('.class-option-xp-badge')?.textContent).toBe('-10% XP');
  });

  it('shows no visible badge text for a selectable class with 0% XP', () => {
    render(<Classes {...makeProps(neutralScores)} />);

    const fighterWrapper = wrapperFor('Fighter');
    expect(fighterWrapper.querySelector('.class-option-xp-badge')?.textContent).toBe('\u00A0');
  });

  it('shows no visible badge text for an unselectable class', () => {
    render(<Classes {...makeProps(elfUnselectableScores)} />);

    const elfWrapper = wrapperFor('Elf');
    expect(elfWrapper.querySelector('.class-option-xp-badge')?.textContent).toBe('\u00A0');
  });
});
