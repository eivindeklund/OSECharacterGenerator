import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CharacterStatistics, ClassOptionsData } from '../../types';
import SpellSelection from './SpellSelection';

// ── CampaignContext mock ───────────────────────────────────────────────────────

const mockGetSpellListsForClass = vi.fn();
const mockGetClassSpellSlots = vi.fn();

vi.mock('../../contexts/CampaignContext', () => ({
  useCampaign: () => ({
    getSpellListsForClass: mockGetSpellListsForClass,
    getClassSpellSlots: mockGetClassSpellSlots,
  }),
}));

// ── Test data ─────────────────────────────────────────────────────────────────

const arcaneSpellClass = {
  name: 'Magic-User',
  arcaneSpells: true,
  divineSpells: false,
  illusionistSpells: false,
  druidSpells: false,
  necromancerSpells: false,
  runesmithSpells: false,
} as ClassOptionsData;

const nonSpellClass = {
  name: 'Fighter',
  arcaneSpells: false,
  divineSpells: false,
  illusionistSpells: false,
  druidSpells: false,
  necromancerSpells: false,
  runesmithSpells: false,
} as ClassOptionsData;

const spellList = [
  { id: 'sleep',         name: 'Sleep',          level: 1, type: 'arcane' },
  { id: 'magic-missile', name: 'Magic Missile',   level: 1, type: 'arcane' },
  { id: 'web',           name: 'Web',             level: 2, type: 'arcane' },
];

function makeStats(partial: Partial<CharacterStatistics> = {}): CharacterStatistics {
  return {
    hitPoints: 4, hpRolls: 1, hpResult: 4, hpSeed: null,
    armourClass: 9, hasSpells: false, unarmouredAC: null,
    level: 1, spells: [],
    ...partial,
  } as CharacterStatistics;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SpellSelection', () => {
  const setCharacterStatistics = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: single spell slot at level 1
    mockGetClassSpellSlots.mockReturnValue([1, 0, 0, 0, 0, 0]);
    // Default: one tier of spells
    mockGetSpellListsForClass.mockReturnValue([spellList]);
  });

  it('renders nothing for a non-spell class', () => {
    const { container } = render(
      <SpellSelection
        characterClass={nonSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a single spell select for a single-slot class', () => {
    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(1);
  });

  it('renders N spell selects when the class has N first-level slots', () => {
    mockGetClassSpellSlots.mockReturnValue([2, 1, 0]);

    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('select options contain the spell list from campaign context', () => {
    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    expect(screen.getByRole('option', { name: 'Sleep' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Magic Missile' })).toBeInTheDocument();
  });

  it('preselects spells already in characterStatistics', () => {
    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats({ spells: ['sleep'] })}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    const select = screen.getByRole<HTMLSelectElement>('combobox');
    expect(select.value).toBe('sleep');
  });

  it('calls setCharacterStatistics when a spell is chosen', () => {
    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'magic-missile' } });
    expect(setCharacterStatistics).toHaveBeenCalledTimes(1);
  });

  it('random button calls setCharacterStatistics', () => {
    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /random spell/i }));
    expect(setCharacterStatistics).toHaveBeenCalledTimes(1);
  });

  it('random button label is plural when multiple spells are required', () => {
    mockGetClassSpellSlots.mockReturnValue([3, 0, 0]);

    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    expect(screen.getByRole('button', { name: /random spells/i })).toBeInTheDocument();
  });

  it('select placeholder is "Select Spell N" when multiple selects are shown', () => {
    mockGetClassSpellSlots.mockReturnValue([2, 0, 0]);

    render(
      <SpellSelection
        characterClass={arcaneSpellClass}
        characterStatistics={makeStats()}
        setCharacterStatistics={setCharacterStatistics}
      />
    );
    expect(screen.getByRole('option', { name: 'Select Spell 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Select Spell 2' })).toBeInTheDocument();
  });
});
