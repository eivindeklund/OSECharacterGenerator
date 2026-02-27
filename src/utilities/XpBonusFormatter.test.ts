import { describe, expect, it } from 'vitest';
import type { AbilityScores } from '../types';
import { formatXpBonusRuleClauses } from './XpBonusFormatter';

const nullScores: AbilityScores = {
  strength: null,
  intelligence: null,
  wisdom: null,
  dexterity: null,
  constitution: null,
  charisma: null,
};

const ELF_RULE =
  '10% if intelligence is 16 or more and strength is 13 or more; 5% if both intelligence and strength are 13 or more';

const HALFLING_RULE =
  '10% if both dexterity and strength are 13 or more; 5% if either dexterity or strength is 13 or more';

const SYMM_RULE =
  '10% if either strength or intelligence is 16 or more and the other is 13 or more; 5% if either strength or intelligence is 13 or more';

function scores(overrides: Partial<Record<keyof AbilityScores, number | null>>): AbilityScores {
  return {
    strength: null,
    intelligence: null,
    wisdom: null,
    dexterity: null,
    constitution: null,
    charisma: null,
    ...overrides,
  };
}

// ── null / missing rule ───────────────────────────────────────────────────────

describe('formatXpBonusRuleClauses — no rule', () => {
  it('returns empty array for null rule', () => {
    expect(formatXpBonusRuleClauses(null, scores({ strength: 13, intelligence: 13 }))).toEqual([]);
  });

  it('returns empty array for undefined rule', () => {
    expect(formatXpBonusRuleClauses(undefined, scores({ strength: 13, intelligence: 13 }))).toEqual([]);
  });
});

// ── Elf: pair condition (INT ≥16 and STR ≥13) ────────────────────────────────

describe('formatXpBonusRuleClauses — Elf rule (pair condition)', () => {
  describe('INT 17, STR 13 → 10% clause active', () => {
    const result = formatXpBonusRuleClauses(ELF_RULE, scores({ intelligence: 17, strength: 13 }));

    it('returns 3 entries', () => {
      expect(result).toHaveLength(3);
    });

    it('10% clause is active', () => {
      expect(result[0].active).toBe(true);
    });

    it('5% clause is inactive', () => {
      expect(result[1].active).toBe(false);
    });

    it('"0% otherwise" clause is inactive', () => {
      expect(result[2].active).toBe(false);
    });

    it('10% clause text contains score for intelligence', () => {
      expect(result[0].text).toContain('intelligence (17)');
    });

    it('10% clause text contains score for strength', () => {
      expect(result[0].text).toContain('strength (13)');
    });

    it('10% clause has expected text', () => {
      expect(result[0].text).toBe(
        '10% if intelligence (17) is 16 or more and strength (13) is 13 or more'
      );
    });

    it('5% clause has expected text', () => {
      expect(result[1].text).toBe(
        '5% if both intelligence (17) and strength (13) are 13 or more'
      );
    });

    it('"0% otherwise" text is literal', () => {
      expect(result[2].text).toBe('0% otherwise');
    });
  });

  describe('INT 13, STR 13 → 5% clause active', () => {
    const result = formatXpBonusRuleClauses(ELF_RULE, scores({ intelligence: 13, strength: 13 }));

    it('10% clause is inactive', () => {
      expect(result[0].active).toBe(false);
    });

    it('5% clause is active', () => {
      expect(result[1].active).toBe(true);
    });

    it('"0% otherwise" clause is inactive', () => {
      expect(result[2].active).toBe(false);
    });

    it('5% clause has expected text', () => {
      expect(result[1].text).toBe(
        '5% if both intelligence (13) and strength (13) are 13 or more'
      );
    });
  });

  describe('INT 8, STR 8 → 0% otherwise active', () => {
    const result = formatXpBonusRuleClauses(ELF_RULE, scores({ intelligence: 8, strength: 8 }));

    it('10% clause is inactive', () => {
      expect(result[0].active).toBe(false);
    });

    it('5% clause is inactive', () => {
      expect(result[1].active).toBe(false);
    });

    it('"0% otherwise" clause is active', () => {
      expect(result[2].active).toBe(true);
    });
  });

  describe('null ability scores → no clause active', () => {
    const result = formatXpBonusRuleClauses(ELF_RULE, nullScores);

    it('returns 3 entries', () => {
      expect(result).toHaveLength(3);
    });

    it('10% clause is inactive', () => {
      expect(result[0].active).toBe(false);
    });

    it('5% clause is inactive', () => {
      expect(result[1].active).toBe(false);
    });

    it('"0% otherwise" clause is inactive', () => {
      expect(result[2].active).toBe(false);
    });

    it('no clause text contains "(null)"', () => {
      for (const clause of result) {
        expect(clause.text).not.toContain('null');
      }
    });

    it('no parenthetical scores appear when scores are null', () => {
      // A parenthetical like "(10)" should not appear in the text
      expect(result[0].text).toBe('10% if intelligence is 16 or more and strength is 13 or more');
      expect(result[1].text).toBe('5% if both intelligence and strength are 13 or more');
    });
  });
});

// ── Halfling: both + either conditions ───────────────────────────────────────

describe('formatXpBonusRuleClauses — Halfling rule (both + either)', () => {
  it('10% active when both DEX 14, STR 13 ≥13', () => {
    const result = formatXpBonusRuleClauses(HALFLING_RULE, scores({ dexterity: 14, strength: 13 }));
    expect(result[0].active).toBe(true);
    expect(result[0].text).toBe('10% if both dexterity (14) and strength (13) are 13 or more');
  });

  it('5% active when only DEX 13, STR 8', () => {
    const result = formatXpBonusRuleClauses(HALFLING_RULE, scores({ dexterity: 13, strength: 8 }));
    expect(result[1].active).toBe(true);
    expect(result[1].text).toBe('5% if either dexterity (13) or strength (8) is 13 or more');
  });

  it('0% otherwise active when neither meets threshold', () => {
    const result = formatXpBonusRuleClauses(HALFLING_RULE, scores({ dexterity: 8, strength: 8 }));
    expect(result[2].active).toBe(true);
  });
});

// ── Symmetric condition ───────────────────────────────────────────────────────

describe('formatXpBonusRuleClauses — symmetric condition', () => {
  it('10% active when STR 16, INT 13', () => {
    const result = formatXpBonusRuleClauses(SYMM_RULE, scores({ strength: 16, intelligence: 13 }));
    expect(result[0].active).toBe(true);
    expect(result[0].text).toBe(
      '10% if either strength (16) or intelligence (13) is 16 or more and the other is 13 or more'
    );
  });

  it('5% active when STR 13, INT 13 (symmetric: INT 13 meets threshold1=16? No → 5%)', () => {
    const result = formatXpBonusRuleClauses(SYMM_RULE, scores({ strength: 13, intelligence: 13 }));
    expect(result[1].active).toBe(true);
    expect(result[1].text).toBe(
      '5% if either strength (13) or intelligence (13) is 13 or more'
    );
  });
});
