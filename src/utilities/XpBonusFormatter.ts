import type { XpCondition } from '../data/classOptionsData';
import { ClassOptions } from '../data/classOptionsData';
import type { AbilityScores } from '../types';

export type XpBonusClauseDisplay = {
  /** Full human-readable clause text, e.g. "10% if intelligence (17) is 16 or more and strength (13) is 13 or more" */
  text: string;
  /** Whether this clause is the one currently satisfied by the character's ability scores */
  active: boolean;
};

/**
 * Returns the score value as a parenthetical string, e.g. " (17)".
 * Returns an empty string when `abilityScores` is null or the score is null.
 */
function scoreParenthetical(ability: string, abilityScores: AbilityScores | null): string {
  if (!abilityScores) return '';
  const val = abilityScores[ability as keyof AbilityScores];
  return val !== null && val !== undefined ? ` (${val})` : '';
}

/** Formats an XP condition as human-readable text, inserting score parentheticals. */
function formatCondition(condition: XpCondition, abilityScores: AbilityScores | null): string {
  const s = (ability: string) => scoreParenthetical(ability, abilityScores);

  switch (condition.type) {
    case 'either':
      return `either ${condition.ability1}${s(condition.ability1)} or ${condition.ability2}${s(condition.ability2)} is ${condition.threshold} or more`;
    case 'both':
      return `both ${condition.ability1}${s(condition.ability1)} and ${condition.ability2}${s(condition.ability2)} are ${condition.threshold} or more`;
    case 'pair':
      return `${condition.ability1}${s(condition.ability1)} is ${condition.threshold1} or more and ${condition.ability2}${s(condition.ability2)} is ${condition.threshold2} or more`;
    case 'symmetric':
      return `either ${condition.ability1}${s(condition.ability1)} or ${condition.ability2}${s(condition.ability2)} is ${condition.threshold1} or more and the other is ${condition.threshold2} or more`;
  }
}

/**
 * Formats an XP bonus rule string into a list of display clauses, each with
 * its human-readable text and an `active` flag indicating whether the clause
 * is satisfied by the provided ability scores.
 *
 * A trailing "0% otherwise" clause is always appended.
 *
 * Returns an empty array if `xpBonusRule` is null or undefined (single-prime-req
 * classes do not have an XP bonus rule string).
 *
 * When any of the relevant ability scores are null (i.e. not yet rolled), all
 * clauses are returned with `active: false` and no score parentheticals are shown.
 */
export function formatXpBonusRuleClauses(
  xpBonusRule: string | null | undefined,
  abilityScores: AbilityScores | null,
): XpBonusClauseDisplay[] {
  if (!xpBonusRule) return [];

  const clauses = ClassOptions.parseXpBonusRule(xpBonusRule);

  // Determine which clause (if any) is active.
  // No active clause when any of the prime-req ability scores referenced in
  // the rule are null (i.e. not yet rolled). Other ability scores may be null;
  // only the ones mentioned in the rule matter.
  const referencedAbilities = new Set<string>(
    clauses.flatMap((c) => [c.condition.ability1, c.condition.ability2]),
  );
  const hasNullReferencedScore =
    !abilityScores ||
    [...referencedAbilities].some(
      (ab) => abilityScores[ab as keyof AbilityScores] === null,
    );

  let activeIndex: number | null = null;
  if (!hasNullReferencedScore && abilityScores) {
    const earned = ClassOptions.evaluateXpClauses(clauses, abilityScores);
    if (earned > 0) {
      activeIndex = clauses.findIndex((c) => c.percent === earned);
    } else {
      // "0% otherwise" is the last entry — index = clauses.length
      activeIndex = clauses.length;
    }
  }

  // Only pass scores to the formatter when all referenced abilities are set;
  // this avoids inserting "(null)" into the text while still omitting
  // parentheticals for scores that haven't been rolled.
  //
  // Note: the parenthetical helper already guards against null values
  // individually, but passing null here is a belt-and-braces approach that
  // ensures no partial-score display when some prime-req scores are unset.
  const scopedScores = hasNullReferencedScore ? null : abilityScores;

  const result: XpBonusClauseDisplay[] = clauses.map((clause, i) => ({
    text: `${clause.percent}% if ${formatCondition(clause.condition, scopedScores)}`,
    active: activeIndex === i,
  }));

  result.push({
    text: '0% otherwise',
    active: activeIndex === clauses.length,
  });

  return result;
}
