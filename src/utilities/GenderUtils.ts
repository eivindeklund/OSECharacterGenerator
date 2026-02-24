// Utilities for determining character pronouns.

import { getGender } from "gender-detection-from-name";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "neutral";

/** Third-person singular pronouns used throughout description generation. */
export interface Pronouns {
  /** Subject pronoun: "he" | "she" | "they" */
  subject: string;
  /** Capitalised subject pronoun: "He" | "She" | "They" */
  Subject: string;
  /** Object pronoun: "him" | "her" | "them" */
  object: string;
  /** Possessive pronoun: "his" | "her" | "their" */
  possessive: string;
  /** "has" for he/she, "have" for they */
  has: string;
}

// ── Detection ─────────────────────────────────────────────────────────────────

/**
 * Attempts to detect gender from a character's first name.
 * Returns "neutral" if the name is unknown or ambiguous.
 */
export function detectGender(fullName: string): Gender {
  const firstName = fullName.trim().split(/\s+/)[0];
  if (!firstName) return "neutral";
  const result = getGender(firstName, "en");
  if (result === "male")   return "male";
  if (result === "female") return "female";
  return "neutral";
}

// ── Pronoun Lookup ────────────────────────────────────────────────────────────

const PRONOUNS: Record<Gender, Pronouns> = {
  male:    { subject: "he",   Subject: "He",   object: "him",  possessive: "his",   has: "has"  },
  female:  { subject: "she",  Subject: "She",  object: "her",  possessive: "her",   has: "has"  },
  neutral: { subject: "they", Subject: "They", object: "them", possessive: "their", has: "have" },
};

/** Returns the pronoun set for the given gender. */
export function getPronounsForGender(gender: Gender): Pronouns {
  return PRONOUNS[gender] ?? PRONOUNS.neutral;
}
