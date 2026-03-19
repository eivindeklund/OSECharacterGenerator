// Utilities for generating AC1-style character description paragraphs.
// Format inspired by "AC1: The Shady Dragon Inn" (TSR, 1983).

import {
  eyeColorsByRace,
  hairColorsByRace,
  heightRangeByRace,
  occupationsByClass,
  personalityMotivations,
  physicalDetailsByRace,
  reputationSnippetsByClass,
  weightBaseByRace,
} from "../data/descriptionData";
import { AbilityScores } from "../types";
import { type Gender, type Pronouns, getPronounsForGender } from "./GenderUtils";
import { chooseRandomItem, getRndInteger } from "./utilities";

// ── Character Reference Generator ───────────────────────────────────────────────

/**
 * Tracks naming state for a single character across a generated paragraph.
 *
 * Call `applyTemplate(text)` to substitute all `{name}` and pronoun markers
 * in a template string.  `{name}` expands to the full name on its first use
 * and to the first name on all subsequent uses.
 */
export class CharacterRef {
  private readonly fullName: string;
  private readonly firstName: string;
  readonly pronouns: Pronouns;

  private firstMentionDone = false;

  constructor(fullName: string, pronouns: Pronouns) {
    this.fullName  = fullName;
    this.firstName = fullName.split(/\s+/)[0];
    this.pronouns  = pronouns;
  }

  /** Full name on first call; first name on all subsequent calls. */
  private getNameRef(): string {
    if (!this.firstMentionDone) {
      this.firstMentionDone = true;
      return this.fullName;
    }
    return this.firstName;
  }

  /**
   * Replaces all template markers in `text`:
   *
   * **Simple pronoun markers** (unchanged behaviour):
   *  - `{name}`    → full name on the first call, first name on subsequent calls
   *  - `{They}`    → subject pronoun (He / She / They)
   *  - `{they}`    → lower-case subject pronoun
   *  - `{their}`   → possessive pronoun
   *  - `{them}`    → object pronoun
   *
   * **Pronoun-guarded alternates** (new):
   *
   *   `{KEYWORD<plural_suffix>|<singular_suffix>}`
   *
   *   Where KEYWORD is one of: `they`, `They`, `their`, `Their`, `them`, `Them`.
   *
   *   - For neutral pronouns (they/their/them): emits `KEYWORD + plural_suffix`.
   *   - For gendered pronouns (he/she): emits the matching singular pronoun +
   *     `singular_suffix`.
   *
   *   A leading space is auto-inserted before `singular_suffix` when
   *   `plural_suffix` begins with a space and `singular_suffix` does not
   *   already start with whitespace or punctuation.
   *
   * Examples:
   *   `{they were|was}`   → `they were`  /  `he was`   /  `she was`
   *   `{They were|was}`   → `They were`  /  `He was`   /  `She was`
   *   `{they're|'s}`      → `they're`    /  `he's`     /  `she's`
   *   `{their own|his own}` → `their own` / `his own`  /  `her own`
   *
   * **Verb-agreement guard** (new):
   *
   *   `{verb <plural_form>|<singular_form>}`
   *
   *   Emits only the selected form — no pronoun is prepended.  Use this when
   *   the pronoun has already been emitted by a separate `{they}` / `{They}`
   *   marker and only the verb (or verb phrase) needs to agree with it.
   *
   *   - For neutral pronouns (they): emits `plural_form`.
   *   - For gendered pronouns (he/she): emits `singular_form`.
   *
   * Examples:
   *   `{verb see|sees}`     → `see`  /  `sees`
   *   `{verb have|has}`     → `have`  /  `has`
   *   `{They} {verb see|sees} no shame`
   *       → `They see no shame`  /  `He sees no shame`  /  `She sees no shame`
   */
  applyTemplate(text: string): string {
    const p = this.pronouns;
    const isNeutral = p.subject === "they";

    // Helper: capitalise the first letter of a string.
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Singular-pronoun lookup keyed by the keyword used in the template.
    const singularFor: Record<string, string> = {
      they:  p.subject,
      They:  p.Subject,
      their: p.possessive,
      Their: cap(p.possessive),
      them:  p.object,
      Them:  cap(p.object),
    };

    // Verb-agreement guards: emit plural or singular form only (no pronoun).
    text = text.replace(
      /\{verb ([^|}]+)\|([^}]+)\}/g,
      (_match, pluralForm: string, singularForm: string) =>
        isNeutral ? pluralForm : singularForm,
    );

    // Apply pronoun-guarded alternates BEFORE simple replacements so that
    // patterns like `{they were|was}` are consumed before `{they}` is tried.
    text = text.replace(
      /\{(they|They|their|Their|them|Them)([^|}]*)\|([^}]*)\}/g,
      (_match, keyword: string, pluralSuffix: string, singularSuffix: string) => {
        if (isNeutral) {
          return keyword + pluralSuffix;
        }
        // Auto-insert a word-boundary space when the plural suffix starts with
        // one (i.e. the marker is `{they VERB|VERB}`) but the singular suffix
        // doesn't already begin with whitespace or punctuation.
        const needsSpace =
          pluralSuffix.startsWith(" ") &&
          singularSuffix.length > 0 &&
          !/^[\s'"\-–—,;:.!?]/.test(singularSuffix);
        return singularFor[keyword] + (needsSpace ? " " : "") + singularSuffix;
      },
    );

    return text
      .replace(/\{name\}/g,  () => this.getNameRef())
      .replace(/\{They\}/g,  p.Subject)
      .replace(/\{they\}/g,  p.subject)
      .replace(/\{their\}/g, p.possessive)
      .replace(/\{them\}/g,  p.object);
  }
}

// ── Race Category ─────────────────────────────────────────────────────────────

/**
 * Maps a class name to one of the four race categories used to look up
 * physical description data.  Demi-human classes are their own race; all
 * human classes share the "human" category.
 */
export function raceCategory(className: string): string {
  switch (className.toLowerCase()) {
    case "dwarf":    return "dwarf";
    case "elf":      return "elf";
    case "halfling": return "halfling";
    default:         return "human";
  }
}

// ── Height Formatting ─────────────────────────────────────────────────────────

/** Converts a total-inches value to a feet'inches" string, e.g. 69 → "5'9\"". */
export function formatHeight(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches === 0 ? `${feet}'` : `${feet}'${inches}"`;
}

// ── Height & Weight Generation ────────────────────────────────────────────────

/**
 * Returns a random height for the given race category, in total inches.
 */
export function generateHeight(race: string): number {
  const [min, max] = heightRangeByRace[race] ?? heightRangeByRace.human;
  return getRndInteger(min, max);
}

/**
 * Returns a weight in lbs, taking into account:
 *  - The character's race (dwarves are dense, elves are slender, etc.)
 *  - Their actual height (taller → heavier baseline)
 *  - Strength score: 16–18 adds muscle mass; 3–6 reduces it
 *  - Constitution score: 15–18 adds bulk; 3–6 reduces it
 *
 * The result is rounded to the nearest 5 lbs so it reads naturally.
 */
export function generateWeight(
  race: string,
  heightInches: number,
  strength: number | null,
  constitution: number | null,
): number {
  const { base, perInch } = weightBaseByRace[race] ?? weightBaseByRace.human;
  const [minHeight] = heightRangeByRace[race] ?? heightRangeByRace.human;

  let weight = base + (heightInches - minHeight) * perInch;

  // Strength adjustment
  const str = strength ?? 10;
  if (str >= 16) weight += getRndInteger(15, 25);
  else if (str >= 13) weight += getRndInteger(5, 10);
  else if (str <= 6)  weight -= getRndInteger(10, 20);
  else if (str <= 8)  weight -= getRndInteger(0, 10);

  // Constitution adjustment
  const con = constitution ?? 10;
  if (con >= 15) weight += getRndInteger(5, 15);
  else if (con <= 6) weight -= getRndInteger(5, 15);

  // Add a small random variance so identical stats don't produce identical weight
  weight += getRndInteger(-5, 5);

  // Round to the nearest 5 and enforce a sensible floor
  weight = Math.round(weight / 5) * 5;
  const floor = race === "halfling" ? 45 : race === "dwarf" ? 95 : 85;
  return Math.max(floor, weight);
}

/**
 * Picks one of three physical description forms and returns it as a template
 * string with `{name}` and pronoun markers still in place, so the caller can
 * apply a `CharacterRef` to substitute name and pronouns later.
 *
 * The detail suffix uses `{They} {verb have|has}` rather than hard-coded
 * pronouns so the sentence can be re-rendered for a different gender.
 */
function buildPhysicalBlockTemplate(
  heightInches: number,
  weightLbs: number,
  hairColor: string,
  eyeColor: string,
  detail: string | null,
): string {
  const h = formatHeight(heightInches);
  const r = Math.random();
  let physicsSentence: string;

  if (r < 0.4) {
    // Form A: original style
    physicsSentence = `{name} stands ${h}, weighs ${weightLbs} lbs., and has ${hairColor} hair and ${eyeColor} eyes.`;
  } else if (r < 0.7) {
    // Form B: hair-first
    physicsSentence = `{name} is ${hairColor}-haired, ${h} tall, and weighs ${weightLbs} lbs., with ${eyeColor} eyes.`;
  } else {
    // Form C: stands+weighs, trailing hair+eyes
    physicsSentence = `{name} stands ${h} and weighs ${weightLbs} lbs., with ${hairColor} hair and ${eyeColor} eyes.`;
  }

  const detailSuffix = detail ? ` {They} {verb have|has} ${detail}.` : "";
  return `${physicsSentence}${detailSuffix}`;
}

// ── Main Generator ────────────────────────────────────────────────────────────

/**
 * The result of `generateDescriptionTemplate`.  Stores the raw sentence
 * template strings chosen for this character (with `{name}`, `{they}`, etc.
 * still in place).  Pass to `renderDescriptionTemplate` with a name and
 * gender to obtain the final description text.
 *
 * Holding on to a `DescriptionTemplate` lets callers re-render the description
 * with a changed name or pronouns without re-randomising any of the physical
 * attributes or sentence selections.
 */
export interface DescriptionTemplate {
  /**
   * Ordered list of raw template strings.  Apply a fresh `CharacterRef` to
   * each in sequence to produce the final description paragraph.
   */
  sentenceTemplates: string[];
}

/**
 * Generates a `DescriptionTemplate` by randomly choosing physical attributes,
 * sentence templates, and structural order — without applying any name or
 * pronouns.  Pass the result to `renderDescriptionTemplate` to obtain the
 * final text.
 *
 * @param options - The class, ability scores, and optional
 *   `includePhysicalDetail` flag that drive randomisation.  `name` and
 *   `gender` are intentionally omitted here; supply them at render time.
 */
export function generateDescriptionTemplate(
  options: { className: string; abilityScores: AbilityScores; includePhysicalDetail?: boolean },
): DescriptionTemplate {
  const { className, abilityScores } = options;
  const includePhysicalDetail = options.includePhysicalDetail ?? Math.random() < 0.5;

  const race = raceCategory(className);

  // Physical attributes
  const heightInches = generateHeight(race);
  const weightLbs    = generateWeight(race, heightInches, abilityScores.strength, abilityScores.constitution);
  const hairColor    = chooseRandomItem(hairColorsByRace[race] ?? hairColorsByRace.human) as string;
  const eyeColor     = chooseRandomItem(eyeColorsByRace[race]  ?? eyeColorsByRace.human)  as string;
  const detail       = includePhysicalDetail
    ? (chooseRandomItem(physicalDetailsByRace[race] ?? physicalDetailsByRace.human) as string)
    : null;

  // Pre-pick one raw template string per sentence type
  const physicalTemplate    = buildPhysicalBlockTemplate(heightInches, weightLbs, hairColor, eyeColor, detail);
  const occupationTemplate  = chooseRandomItem(occupationsByClass[className]  ?? occupationsByClass["Fighter"])                     as string;
  const personalityTemplate = chooseRandomItem(personalityMotivations)                                                               as string;
  const reputationTemplate  = chooseRandomItem(reputationSnippetsByClass[className] ?? reputationSnippetsByClass["Fighter"])         as string;

  // Structural order (same weights as the original generator)
  const roll = Math.random();
  let sentenceTemplates: string[];

  if (roll < 0.35) {
    // Template 1 (35 %): physical → occupation → personality
    sentenceTemplates = [physicalTemplate, occupationTemplate, personalityTemplate];
  } else if (roll < 0.55) {
    // Template 2 (20 %): physical → personality → occupation
    sentenceTemplates = [physicalTemplate, personalityTemplate, occupationTemplate];
  } else if (roll < 0.72) {
    // Template 3 (17 %): occupation → physical → personality
    sentenceTemplates = [occupationTemplate, physicalTemplate, personalityTemplate];
  } else if (roll < 0.87) {
    // Template 4 (15 %): reputation → physical → personality
    sentenceTemplates = [reputationTemplate, physicalTemplate, personalityTemplate];
  } else {
    // Template 5 (13 %): physical → reputation (short, punchy)
    sentenceTemplates = [physicalTemplate, reputationTemplate];
  }

  return { sentenceTemplates };
}

/**
 * Renders a `DescriptionTemplate` into a finished description paragraph.
 *
 * Creates a fresh `CharacterRef` so that `{name}` expands to the full name on
 * the first sentence and to the first name on all subsequent sentences.
 *
 * Call this again with a different `name` or `gender` to re-render the same
 * random template without re-randomising any of the choices.
 */
export function renderDescriptionTemplate(
  template: DescriptionTemplate,
  name: string,
  gender: Gender = "neutral",
): string {
  const pronouns = getPronounsForGender(gender);
  const ref      = new CharacterRef(name, pronouns);
  return template.sentenceTemplates.map(t => ref.applyTemplate(t)).join(" ");
}


