import { primeRequisiteModifiers } from "../constants/constants";
import type { AbilityRequirement, AbilityScores, ClassAbility, ClassOptionsData } from "../types";
import { checkWeaponQuality } from "../utilities/WeaponUtils";
import { ALL_ARMOUR, ARMOUR_ID } from "./armourData";

const large_weapons = ["long_bow", "two_handed_sword", "polearm"];
const magic_user_weapons = ["dagger", "staff", "silver_dagger"];

type ClassOptionsInput = Omit<ClassOptionsData, 'checkAbilityScoreRequirements' | 'xpModifierPercentage' | 'allowedArmour'>;

/** Canonical ability IDs for abilities that appear on more than one class — use these instead of magic strings. */
export const ABILITY_ID = {
  listeningAtDoors:   'listening_at_doors',
  detectSecretDoors:  'detect_secret_doors',
  detectRoomTraps:    'detect_room_traps',
} as const;

// ── Thief Skill Table (OSE B/X, levels 1–14) ──────────────────────────────────
// Source: OSE SRD, Thief class. HN (Hear Noise) is a 1d6 range; all others are d% roll-under.

export interface ThiefSkillRow {
  level: number;
  CS: number;   // Climb Sheer Surfaces (d%)
  TR: number;   // Find/Remove Treasure Traps (d%)
  HN: string;   // Hear Noise (1dX range, e.g. "1-2")
  HS: number;   // Hide in Shadows (d%)
  MS: number;   // Move Silently (d%)
  OL: number;   // Open Locks (d%)
  PP: number;   // Pick Pockets (d%)
}

export const thiefSkillTable: readonly ThiefSkillRow[] = [
  { level:  1, CS: 87, TR: 10, HN: "1-2", HS: 10, MS: 20, OL: 15, PP:  20 },
  { level:  2, CS: 88, TR: 15, HN: "1-2", HS: 15, MS: 25, OL: 20, PP:  25 },
  { level:  3, CS: 89, TR: 20, HN: "1-3", HS: 20, MS: 30, OL: 25, PP:  30 },
  { level:  4, CS: 90, TR: 25, HN: "1-3", HS: 25, MS: 35, OL: 30, PP:  35 },
  { level:  5, CS: 91, TR: 30, HN: "1-3", HS: 30, MS: 40, OL: 35, PP:  40 },
  { level:  6, CS: 92, TR: 40, HN: "1-3", HS: 36, MS: 45, OL: 45, PP:  45 },
  { level:  7, CS: 93, TR: 50, HN: "1-4", HS: 45, MS: 55, OL: 55, PP:  55 },
  { level:  8, CS: 94, TR: 60, HN: "1-4", HS: 55, MS: 65, OL: 65, PP:  65 },
  { level:  9, CS: 95, TR: 70, HN: "1-4", HS: 65, MS: 75, OL: 75, PP:  75 },
  { level: 10, CS: 96, TR: 80, HN: "1-4", HS: 75, MS: 85, OL: 85, PP:  85 },
  { level: 11, CS: 97, TR: 90, HN: "1-5", HS: 85, MS: 95, OL: 95, PP:  95 },
  { level: 12, CS: 98, TR: 95, HN: "1-5", HS: 90, MS: 96, OL: 96, PP: 105 },
  { level: 13, CS: 99, TR: 97, HN: "1-5", HS: 95, MS: 98, OL: 97, PP: 115 },
  { level: 14, CS: 99, TR: 99, HN: "1-5", HS: 99, MS: 99, OL: 99, PP: 125 },
] as const;

// ── XP bonus rule DSL ─────────────────────────────────────────────────────────
//
// Each class with two prime requisites stores its XP bonus logic as a
// human-readable string matching the phrasing found in OSE rulebooks.
//
// Format:  "10% if <condition>; 5% if <condition>"
//
// The two tiers are stated in descending order (10% first, 5% second).
// Evaluation is first-match: the result is the percent of the first clause
// whose condition is satisfied, or 0% if neither is. This mirrors rulebook
// presentation where the higher bonus is stated first.
//
// Supported condition forms (A, B are lowercase ability names; N, M are
// integers; names must match those in abilityScoreNames):
//
//   "either A or B is N or more"
//       → score[A] >= N  OR  score[B] >= N
//
//   "both A and B are N or more"
//       → score[A] >= N  AND  score[B] >= N
//
//   "A is N or more and B is M or more"
//       → score[A] >= N  AND  score[B] >= M
//
//   "either A or B is N or more and the other is M or more"
//       → (score[A] >= N AND score[B] >= M) OR (score[A] >= M AND score[B] >= N)

export type XpConditionEither    = { type: 'either';    ability1: string; ability2: string; threshold: number };
export type XpConditionBoth      = { type: 'both';       ability1: string; ability2: string; threshold: number };
export type XpConditionPair      = { type: 'pair';       ability1: string; threshold1: number; ability2: string; threshold2: number };
export type XpConditionSymmetric = { type: 'symmetric';  ability1: string; ability2: string; threshold1: number; threshold2: number };
export type XpCondition = XpConditionEither | XpConditionBoth | XpConditionPair | XpConditionSymmetric;
export type XpClause = { percent: number; condition: XpCondition };




class ClassOptions implements ClassOptionsData {
  name!: string;
  category!: string;
  requirements!: string | null;
  primeReqs!: string[];
  hd!: number;
  maxLevel!: number;
  armour!: string;
  weapons!: string;
  canUseThiefTools?: boolean;
  isStandardWeapon!: (w?: any) => boolean;
  languages!: string;
  description!: string;
  savingThrows!: number[];
  nextLevel!: number;
  abilities!: ClassAbility[];
  link!: string;
  arcane!: boolean;
  divine!: boolean;
  arcaneSpells?: boolean;
  druidSpells?: boolean;
  illusionistSpells?: boolean;
  necromancerSpells?: boolean;
  runesmithSpells?: boolean;
  xpBonusRule?: string;

  constructor(data: ClassOptionsInput) {
    Object.assign(this, data);
  }

  // TODO: Normalize to "none" instead of empty string for no armour in the source data
  // TODO: Overall make this as strict as we can, so the source data will be
  // forced to be consistent and clean, and users can read the descriptions without seeing random differences.
  // TODO: Make sure we run this parsing logic for all classes as part of our tests.

  /**
   * Parse the human-readable `armour` string into an array of canonical armour IDs.
   * Returns the same result as the old `allowedArmour` data field.
   * Throws if any armour token is unrecognised.
   *
   * Supported tokens (comma-separated, optional leading "any "):
   *   "none"           → []
   *   "any"            → ALL_ARMOUR (leather, chainmail, plate mail, shield)
   *   "leather"        → leather
   *   "chainmail"      → chainmail
   *   "plate mail"     → plate_mail
   *   "shields" or "wooden shields" → shield
   *
   * If the string contains multiple lists separated by " / ", all are validated
   * independently, and the return value is the union of all the lists
   * (duplicates removed). This allows for classes that have different armour
   * options in different phases, still allowing the user to buy all the types
   * of armour that they are allowed to use.
   */
  static parseArmourString(armour: string): string[] {
    // Enforce no leading/trailing whitespace
    if (armour !== armour.trim()) {
      throw new Error(`Armour string has leading or trailing whitespace: "${armour}"`);
    }

    // Split on ' / ' (with spaces) to allow multiple valid lists, recurse for each
    const splits = armour.split(' / ');
    if (splits.length === 0) throw new Error(`Empty armour string`);

    // Helper to parse a single list (no recursion)
    function parseSingle(list: string): string[] {
      if (list.toLowerCase() === 'none') return [];
      if (list.toLowerCase() === 'any') return [...ALL_ARMOUR];
      const tokens = list.split(',').map(s => s.trim());
      const allowedTokens = [
        { names: ['leather'], id: ARMOUR_ID.leather },
        { names: ['chainmail'], id: ARMOUR_ID.chainmail },
        { names: ['plate mail'], id: ARMOUR_ID.plateMail },
        { names: ['shields', 'wooden shields'], id: ARMOUR_ID.shield },
      ];
      const ids: string[] = [];
      let lastIndex = -1;
      for (const raw of tokens) {
        let found = false;
        for (let i = 0; i < allowedTokens.length; ++i) {
          if (allowedTokens[i].names.includes(raw.toLowerCase())) {
            if (i < lastIndex) {
              throw new Error(`Armour components out of order: "${list}"`);
            }
            lastIndex = i;
            ids.push(allowedTokens[i].id);
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error(`Unknown armour token "${raw}" in armour string "${list}"`);
        }
      }
      return ids;
    }

    // Parse all splits, validate all, and union results (no duplicates, correct order)
    const allIds: string[] = [];
    for (const split of splits) {
      const ids = parseSingle(split);
      for (const id of ids) {
        if (!allIds.includes(id)) {
          allIds.push(id);
        }
      }
    }
    // Maintain canonical order: leather, chainmail, plate mail, shield
    const canonicalOrder = [ARMOUR_ID.leather, ARMOUR_ID.chainmail, ARMOUR_ID.plateMail, ARMOUR_ID.shield];
    return canonicalOrder.filter(id => allIds.includes(id));
  }

  get allowedArmour(): string[] {
    return ClassOptions.parseArmourString(this.armour);
  }

  /* Parse ability score requirements string.
     The format is:
     "Minimum 9 constitution"
     "Minimum 9 constitution, minimum 9 dexterity"
     etc

     It can also be null.

     Returns an array of requirement objects:
     [{ ability: "constitution", minimum: 9 }]
  */
  static parseAbilityRequirements(requirementsString: string | null): AbilityRequirement[] {
    if (!requirementsString) {
      return [];
    }

    const requirements = [];
    const parts = requirementsString.split(',').map(s => s.trim());

    for (const part of parts) {
      // Match "Minimum <number> <ability>" or "minimum <number> <ability>"
      const match = part.match(/^[Mm]inimum\s+(\d+)\s+(\w+)$/);
      if (match) {
        const minimum = parseInt(match[1], 10);
        const ability = match[2].toLowerCase();
        requirements.push({ ability, minimum });
      }
    }

    return requirements;
  }

  /* Parse an XP bonus rule string into a list of additive clauses.
     Throws if any clause cannot be parsed.

     Format:  "<N>% if <condition>[, <N>% if <condition>]*"

     Supported condition forms:
       "either A or B is N or more"
       "both A and B are N or more"
       "A is N or more and B is M or more"
       "either A or B is N or more and the other is M or more"
  */
  static parseXpBonusRule(rule: string | null): XpClause[] {
    if (!rule) return [];

    const clauses: XpClause[] = [];

    const EITHER = /^either (\w+) or (\w+) is (\d+) or more$/;
    const BOTH   = /^both (\w+) and (\w+) are (\d+) or more$/;
    const PAIR   = /^(\w+) is (\d+) or more and (\w+) is (\d+) or more$/;
    const SYMM   = /^either (\w+) or (\w+) is (\d+) or more and the other is (\d+) or more$/;

    for (const raw of rule.split('; ')) {
      const top = raw.match(/^(\d+)% if (.+)$/);
      if (!top) throw new Error(`Invalid XP bonus clause: "${raw}"`);

      const percent = parseInt(top[1], 10);
      const cond    = top[2];
      let   m: RegExpMatchArray | null;

      if ((m = cond.match(SYMM))) {
        clauses.push({ percent, condition: { type: 'symmetric', ability1: m[1], ability2: m[2], threshold1: parseInt(m[3], 10), threshold2: parseInt(m[4], 10) } });
      } else if ((m = cond.match(EITHER))) {
        clauses.push({ percent, condition: { type: 'either', ability1: m[1], ability2: m[2], threshold: parseInt(m[3], 10) } });
      } else if ((m = cond.match(BOTH))) {
        clauses.push({ percent, condition: { type: 'both', ability1: m[1], ability2: m[2], threshold: parseInt(m[3], 10) } });
      } else if ((m = cond.match(PAIR))) {
        clauses.push({ percent, condition: { type: 'pair', ability1: m[1], threshold1: parseInt(m[2], 10), ability2: m[3], threshold2: parseInt(m[4], 10) } });
      } else {
        throw new Error(`Unknown XP bonus condition: "${cond}"`);
      }
    }

    return clauses;
  }

  /* Evaluate parsed XP clauses against ability scores.
     Clauses are checked in order (highest tier first); returns the percent
     of the first matching clause, or 0 if none match. */
  static evaluateXpClauses(clauses: XpClause[], scores: AbilityScores): number {
    for (const { percent, condition } of clauses) {
      let met = false;
      if (condition.type === 'either') {
        met = (scores[condition.ability1] ?? 0) >= condition.threshold
           || (scores[condition.ability2] ?? 0) >= condition.threshold;
      } else if (condition.type === 'both') {
        met = (scores[condition.ability1] ?? 0) >= condition.threshold
           && (scores[condition.ability2] ?? 0) >= condition.threshold;
      } else if (condition.type === 'pair') {
        met = (scores[condition.ability1] ?? 0) >= condition.threshold1
           && (scores[condition.ability2] ?? 0) >= condition.threshold2;
      } else if (condition.type === 'symmetric') {
        const a = scores[condition.ability1] ?? 0;
        const b = scores[condition.ability2] ?? 0;
        met = (a >= condition.threshold1 && b >= condition.threshold2)
           || (a >= condition.threshold2 && b >= condition.threshold1);
      }
      if (met) return percent;
    }
    return 0;
  }

  /* Calculate the XP modifier percentage from prime requisites for the given ability scores. */
  xpModifierPercentage(abilityScoreValues: AbilityScores): string {
    if (this.primeReqs.length === 0) {
      return '0%';
    }

    if (this.primeReqs.length === 1) {
      const firstAbilityScoreValue = abilityScoreValues[this.primeReqs[0]] ?? 0;
      const primeReqValue = primeRequisiteModifiers[firstAbilityScoreValue];
      return `${primeReqValue ?? 0}%`;
    }

    if (this.primeReqs.length === 2) {
      const clauses = ClassOptions.parseXpBonusRule(this.xpBonusRule ?? null);
      return ClassOptions.evaluateXpClauses(clauses, abilityScoreValues) + '%';
    }

    console.log(`Error: Class ${this.name} has more than 2 prime requisites, which is not currently supported.`);
    return 'unknown%';
  }

  /* Check if ability scores meet the requirements for this class. */
  checkAbilityScoreRequirements(abilityScores: AbilityScores): boolean {
    const requirements = ClassOptions.parseAbilityRequirements(this.requirements);

    for (const req of requirements) {
      if (abilityScores[req.ability] < req.minimum) {
        return false;
      }
    }

    return true;
  }

  /**
   * Return the thief skill value for the given skill key and character level.
   * Level is clamped to the valid range [1, 14].
   */
  static getThiefSkillAtLevel(skill: keyof Omit<ThiefSkillRow, 'level'>, level: number): number | string {
    const clamped = Math.max(1, Math.min(14, level));
    return thiefSkillTable[clamped - 1][skill];
  }
}


const classOptionsData = [
  {
    name: "Fighter",
    category: "basic",
    requirements: null,
    primeReqs: ["strength"],
    hd: 8,
    maxLevel: 14,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Fighters are adventurers dedicated to mastering the arts of combat and war. In a group of adventurers, the role of fighters is to battle monsters and to defend other characters.",
    savingThrows: [12, 13, 14, 15, 16],
    nextLevel: 2000,
    abilities: [{ name: "Stronghold" }],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Fighter",
    arcane: false,
    divine: false,
  },
  {
    name: "Cleric",
    category: "basic",
    requirements: null,
    primeReqs: ["wisdom"],
    hd: 6,
    maxLevel: 14,
    armour: "any",
    weapons: "only blunt weapons",
    isStandardWeapon: (w) => checkWeaponQuality(w, "Blunt"),
    languages: "",
    description:
      "Clerics are adventurers who have sworn to serve a deity. They are trained for battle and channel the power of their deity.",
    savingThrows: [11, 12, 14, 16, 15],
    nextLevel: 1500,
    abilities: [
      { name: "Divine Magic", description: "Cast and prepare cleric spells; use divine scrolls and divine spell items", minLevel: 2 },
      { name: "Turning the Undead", description: "Roll 2d6: turn 1 HD undead on 7+, 2 HD on 9+, 2* HD on 11+" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Cleric",
    arcane: false,
    divine: true,
  },
  {
    name: "Magic-User",
    category: "basic",
    requirements: null,
    primeReqs: ["intelligence"],
    hd: 4,
    maxLevel: 14,
    armour: "none",
    weapons: "dagger, staff",
    isStandardWeapon: (w) => magic_user_weapons.includes(w.id),
    languages: "",
    description:
      "Magic-users are adventurers whose study of arcane secrets has taught them how to cast spells. Magic-users are able to cast a greater number of increasingly powerful spells as they advance in level.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 2500,
    abilities: [
      { name: "Arcane Magic", description: "Cast arcane spells from spell book; use arcane magic scrolls; use arcane magic items (wands, etc.)" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Magic-User",
    arcane: true,
    arcaneSpells: true,
    divine: false,
  },
  {
    name: "Thief",
    category: "basic",
    requirements: null,
    primeReqs: ["dexterity"],
    hd: 4,
    maxLevel: 0,
    armour: "leather",
    canUseThiefTools: true,
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Thieves are adventurers who live by their skills of deception and stealth. Their range of unique skills makes them very handy companions in adventures. However, thieves are not always to be trusted.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 1200,
    abilities: [
      { name: "Backstab", description: "+4 to hit, ×2 damage when attacking an unaware opponent from behind" },
      { name: "Climb Sheer Surfaces", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("CS", lvl)}% — roll per 100' of climbing; fall at midpoint on failure` },
      { name: "Find/Remove Treasure Traps", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("TR", lvl)}% — one attempt per trap` },
      { name: "Hear Noise", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("HN", lvl)} on 1d6 — rolled by referee` },
      { name: "Hide in Shadows", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("HS", lvl)}% — must remain motionless; rolled by referee` },
      { name: "Move Silently", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("MS", lvl)}% — rolled by referee` },
      { name: "Open Locks", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("OL", lvl)}% — requires thieves' tools; one attempt per lock` },
      { name: "Pick Pockets", getDescription: (lvl) => `${ClassOptions.getThiefSkillAtLevel("PP", lvl)}% — –5% per level of victim above 5th` },
      { name: "Read Languages", description: "80% chance to read any non-magical text", minLevel: 4 },
      { name: "Scroll Use", description: "Cast arcane spells from scrolls; 10% mishap chance", minLevel: 10 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Thief",
    arcane: false,
    divine: false,
  },
  {
    name: "Dwarf",
    category: "basic",
    requirements: "Minimum 9 constitution",
    primeReqs: ["strength"],
    hd: 8,
    maxLevel: 12,
    armour: "any",
    weapons:
      "any small or normal sized, but cannot use longbows or two-handed swords",
    isStandardWeapon: (w) => !["long_bow", "two_handed_sword"].includes(w.id),
    languages: "Dwarvish, Gnomish, Goblin, Kobold",
    description:
      "Dwarves are stout, bearded demihumans, about 4’ tall and weighing about 150 pounds. Dwarves typically live underground and love fine craftsmanship, gold, hearty food, and strong drink. They have skin, hair, and eye colours in earth tones. Dwarves are known for their stubbornness and practicality. They are a hardy people and have a strong resistance to magic, as reflected in their saving throws.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2200,
    abilities: [
      { name: "Detect Construction Tricks", description: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching" },
      { id: "detect_room_traps", name: "Detect Room Traps", description: "2-in-6 chance to detect non-magical room traps when searching", shownInList: false },
      { name: "Infravision", description: "60'" },
      { id: "listening_at_doors", name: "Listening at Doors", description: "2-in-6 chance of hearing noises", shownInList: false },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Dwarf",
    arcane: false,
    divine: false,
  },
  {
    name: "Elf",
    category: "basic",
    requirements: "Minimum 9 intelligence",
    primeReqs: ["intelligence", "strength"],
    xpBonusRule: "10% if intelligence is 16 or more and strength is 13 or more; 5% if both intelligence and strength are 13 or more",
    hd: 6,
    maxLevel: 10,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Elvish, Gnoll, Hobgoblin, Orcish",
    description:
      "Elves are slender, fey demihumans with pointed ears. They typically weigh about 120 pounds and are between 5 and 5½ feet tall. Elves are seldom met in human settlements, preferring to feast and make merry in the woods. If crossed, they are dangerous enemies, as they are masters of both sword and spell. Elves are fascinated by spells and beautifully constructed magic items and love to collect both.",
    savingThrows: [12, 13, 13, 15, 15],
    nextLevel: 4000,
    abilities: [
      { name: "Arcane Magic", description: "Cast arcane spells from spell book; use arcane magic scrolls; use arcane magic items (wands, etc.)" },
      { id: "detect_secret_doors", name: "Detect Secret Doors", description: "2-in-6 chance to locate secret or hidden doors when searching", shownInList: false },
      { name: "Infravision", description: "60'" },
      { id: "listening_at_doors", name: "Listening at Doors", description: "2-in-6 chance of hearing noises", shownInList: false },
      { name: "Immunity to Ghoul Paralysis", description: "Immune to the paralyzing effect of ghouls" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Elf",
    arcane: true,
    arcaneSpells: true,
    divine: false,
  },
  {
    name: "Halfling",
    category: "basic",
    requirements: "Minimum 9 constitution, minimum 9 dexterity",
    primeReqs: ["dexterity", "strength"],
    xpBonusRule: "10% if both dexterity and strength are 13 or more; 5% if either dexterity or strength is 13 or more",
    hd: 6,
    maxLevel: 8,
    armour: "any",
    weapons: "any appropriate to size",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Halfling",
    description:
      "Halflings are small, rotund demihumans with furry feet and curly hair. They weigh about 60 pounds and are around 3’ tall. Halflings are a friendly and welcoming folk. Above all, they love the comforts of home and are not known for their bravery. Halflings who gain treasure through adventuring will often use their wealth in pursuit of a quiet, comfortable life.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2000,
    abilities: [
      { name: "Defensive Bonus", description: "AC +2 against large opponents (greater than human-sized)" },
      { name: "Hiding", description: "90% in woods or undergrowth; 2-in-6 in dungeons with cover (must be motionless)" },
      { id: "listening_at_doors", name: "Listening at Doors", description: "2-in-6 chance of hearing noises", shownInList: false },
      { name: "Missile Attack Bonus", description: "+1 to attack rolls with all missile weapons" },
      { name: "Initiative Bonus", description: "+1 to individual initiative rolls (if used; optional rule)" },
      { name: "Stronghold", description: "May build a halfling Shire any time sufficient funds are available" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/index.php/Halfling",
    arcane: false,
    divine: false,
  },
  {
    name: "Acrobat",
    category: "advanced",
    requirements: null,
    primeReqs: ["dexterity"],
    hd: 4,
    maxLevel: 14,
    armour: "leather",
    canUseThiefTools: true,
    weapons:
      "missile weapons, dagger, sword, short sword, polearm, spear, staff",
    isStandardWeapon: (w) =>
      checkWeaponQuality(w, "Missile") ||
      [
        "dagger",
        "silver_dagger",
        "sword",
        "short_sword",
        "polearm",
        "spear",
        "staff",
      ].includes(w.id),
    languages: "",
    description:
      "Acrobats are trained in skills of balance, gymnastics, and stealth. They often work in conjunction with thieves and may belong to a Thieves’ Guild.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 1200,
    abilities: [
      { name: "Acrobat Skills (climb sheer surfaces, falling, hide in shadows, move silently, tightrope walking)" },
      { name: "Evasion" },
      { name: "Jumping" },
      { name: "Tumbling Attack" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
    classEquivalent: "Thief",
  },
  {
    name: "Assassin",
    category: "advanced",
    requirements: null,
    primeReqs: ["dexterity"],
    hd: 4,
    maxLevel: 14,
    armour: "leather, shields",
    canUseThiefTools: true,
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Assassins are adventurers who specialise in the arts of infiltration and killing by stealth. They sometimes form guilds whereby their illicit services may be hired.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 1500,
    abilities: [
      { name: "Assassin Skills (assassination, climb sheer surfaces, hear noise, hide in shadows, move silently)" },
      { name: "Disguise" },
      { name: "Poison" },
      { name: "Assassin Hirelings", minLevel: 4 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
    classEquivalent: "Thief",
  },
  {
    name: "Barbarian",
    category: "advanced",
    requirements: "Minimum 9 dexterity",
    primeReqs: ["constitution", "strength"],
    xpBonusRule: "10% if constitution is 16 or more and strength is 13 or more; 5% if either constitution or strength is 13 or more",
    hd: 8,
    maxLevel: 14,
    armour: "leather, chainmail, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Barbarians are tribal warriors from wild lands. They are formidable fighters with many useful survival skills but have a deep mistrust of the arcane",
    savingThrows: [10, 13, 12, 15, 16],
    nextLevel: 2500,
    abilities: [
      { name: "Barbarian Skills (climb sheer surfaces, hiding in undergrowth, move silently)" },
      { name: "Cure Poison" },
      { name: "Foraging" },
      { name: "Hunting" },
      { name: "Fear of Magic" },
      { name: "Agile Fighting", minLevel: 4 },
      { name: "Strike Invulnerable Monsters", minLevel: 4 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
  },
  {
    name: "Bard",
    category: "advanced",
    requirements: "Minimum 9 dexterity, minimum 9 intelligence",
    primeReqs: ["charisma"],
    hd: 6,
    maxLevel: 14,
    armour: "leather, chainmail",
    weapons: "missile weapons, one-handed melee weapons",
    isStandardWeapon: (w) =>
      checkWeaponQuality(w, "Missile") ||
      (checkWeaponQuality(w, "Melee") && !checkWeaponQuality(w, "Two-handed")),
    languages: "",
    description:
      "Bards are members of a sect of minstrels and warrior poets associated with the druids. Like druids, bards worship the force of nature and the myriad deities that personify it. Their strengths lie in their deep knowledge of myth and legend, the magic that they wield on behalf of their gods, and the enchanting power of their music.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 2000,
    abilities: [
      { name: "Anti-Charm" },
      { name: "Divine Magic" },
      { name: "Enchantment" },
      { name: "Languages", minLevel: 4 },
      { name: "Lore", minLevel: 2 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: true,
  },
  {
    name: "Drow",
    category: "advanced",
    requirements: "Minimum 9 intelligence",
    primeReqs: ["wisdom", "strength"],
    xpBonusRule: "10% if wisdom is 16 or more and strength is 13 or more; 5% if both wisdom and strength are 13 or more",
    hd: 6,
    maxLevel: 14,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Deepcommon, Elvish, Gnomish, the secret language of spiders",
    description:
      "Drow are slender, fey demihumans with pointed ears, skin as black as the night sky, and hair of silver or white. They have extremely long lifespans, being nigh immortal. Drow dwell exclusively underground, carving great cities of stone and crystal. They are related to the elves of the surface world and share their love of nature and magic. Drow typically weigh about 120 pounds and are from 5 to 5½ feet tall. They are talented fighters and gain powerful magic through the worship of their strange subterranean deities. They have a strong resistance to magic, as reflected in their saving throws.",
    savingThrows: [12, 13, 13, 15, 12],
    nextLevel: 4000,
    abilities: [
      { id: "detect_secret_doors", name: "Detect Secret Doors" },
      { id: "listening_at_doors", name: "Listening at Doors" },
      { name: "Divine Magic" },
      { name: "Infravision" },
      { name: "Light Sensitivity" },
      { name: "Spider Affinity" },
      { name: "Immunity to Ghoul Paralysis" },
      { name: "Spell: Light (Darkness)" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: true,
  },
  {
    name: "Druid",
    category: "advanced",
    requirements: null,
    primeReqs: ["wisdom"],
    hd: 6,
    maxLevel: 14,
    armour: "leather, wooden shields",
    weapons: "club, dagger, sling, spear, staff",
    isStandardWeapon: (w) =>
      ["club", "dagger", "silver_dagger", "sling", "spear", "staff"].includes(
        w.id,
      ),
    languages: "the secret druidic tongue",
    description:
      "Druids are priests of nature, protecting wild lands from the encroachment of “civilised” Law and the corrupting touch of Chaos. They worship the force of nature itself, personified in the form of various nature deities.",
    savingThrows: [11, 12, 14, 16, 15],
    nextLevel: 2000,
    abilities: [
      { name: "Divine Magic" },
      { name: "Energy Resistance" },
      { name: "Identification" },
      { name: "Path-Finding" },
      { name: "Sylvan Languages", minLevel: 3 },
      { name: "Shape Change", minLevel: 7 },
      { name: "Charm Immunity", minLevel: 7 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: true,
    druidSpells: true,
  },
  {
    name: "Duergar",
    category: "advanced",
    requirements: "Minimum 9 constitution, minimum 9 intelligence",
    primeReqs: ["strength"],
    hd: 6,
    maxLevel: 10,
    armour: "any",
    weapons: "small or normal sized",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Deepcommon, Dwarvish, Gnomish, Goblin, Kobold",
    description:
      "Duergars (also known as grey dwarves) are short, scrawny, bearded demihumans with grey skin and hair and ugly visages. They are around 4’ tall, weigh about 120 pounds, and have life spans of up to 500 years. Duergars dwell in strongholds and cities deep underground. They are renowned for their greed and for metals and stones and for their xenophobia toward other races. Duergars have a naturally strong constitution and are highly resistant to magic.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2800,
    abilities: [
      { name: "Detect Construction Tricks" },
      { id: "detect_room_traps", name: "Detect Room Traps" },
      { name: "Infravision" },
      { name: "Light-Sensitivity" },
      { name: "Mental Powers (enlargement, invisibility, shrinking, heat)" },
      { name: "Stealth" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
  },
  {
    name: "Gnome",
    category: "advanced",
    requirements: "Minimum 9 constitution",
    primeReqs: ["intelligence", "dexterity"],
    xpBonusRule: "10% if intelligence is 16 or more and dexterity is 13 or more; 5% if both intelligence and dexterity are 13 or more",
    hd: 4,
    maxLevel: 8,
    armour: "leather, shields",
    weapons: "any appropriate to size",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Deepcommon, Dwarvish, Gnomish, Goblin, Kobold",
    description:
      "Gnomes are a race of short demihumans with long noses and beards. They are cousins of the dwarves and the two races are on friendly terms. Gnomes prefer to dwell in underground complexes in forests or foothills. They love mining, precious stones, and machinery—from miniature marvels of clockwork to great construction 3½’ tall and weigh around 100 pounds.",
    savingThrows: [8, 9, 10, 14, 11],
    nextLevel: 3000,
    abilities: [
      { name: "Arcane Magic" },
      { name: "Defensive Bonus" },
      { name: "Detect Construction Tricks" },
      { name: "Hiding" },
      { name: "Infravision" },
      { id: "listening_at_doors", name: "Listening at Doors" },
      { name: "Speak with Burrowing Mammals" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: true,
    arcaneSpells: true,
    divine: false,
  },
  {
    name: "Half-Elf",
    category: "advanced",
    requirements: "Minimum 9 charisma, minimum 9 constitution",
    primeReqs: ["intelligence", "strength"],
    xpBonusRule: "10% if either intelligence or strength is 16 or more and the other is 13 or more; 5% if both intelligence and strength are 13 or more",
    hd: 6,
    maxLevel: 12,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Elvish",
    description:
      "Half-elves are the rare offspring of elves and humans. Physically, they tend to combine the best features of the robust physique of humans. They are human-like in stature but always have a feature that marks their elven heritage (e.g. pointed ears or unusually bright eyes). Half-elves are skilled fighters and dabble with magic, though they lack their elvish parents’ mastery of the arcane.",
    savingThrows: [12, 13, 13, 15, 15],
    nextLevel: 2500,
    abilities: [{ name: "Arcane Magic" }, { id: "detect_secret_doors", name: "Detect Secret Doors" }, { name: "Infravision" }],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: true,
    divine: false,
  },
  {
    name: "Half-Orc",
    category: "advanced",
    requirements: null,
    primeReqs: ["dexterity", "strength"],
    xpBonusRule: "10% if both dexterity and strength are 16 or more; 5% if both dexterity and strength are 13 or more",
    hd: 6,
    maxLevel: 8,
    armour: "leather, chainmail, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Orcish",
    description:
      "Half-orcs are the rare offspring of orcs and humans. They are human-like in stature and appearance, but usually have at least one feature that marks their orcish heritage (e.g. fangs or a pig-like snout). Due to the common animosity between orcs and humans, half-orcs are typically outcasts from both their parent cultures, living on the fringes of society and making a living by whatever means they can. Half-orc adventurers are capable combatants and have some skill as thieves.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 1800,
    abilities: [
      { name: "Backstab" },
      { name: "Infravision" },
      { name: "Thieving Skills (hide in shadows, move silently, pick pockets)" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
  },
  {
    name: "Illusionist",
    category: "advanced",
    requirements: "Minimum 9 dexterity",
    primeReqs: ["intelligence"],
    hd: 4,
    maxLevel: 14,
    armour: "none",
    weapons: "dagger, staff",
    isStandardWeapon: (w) =>
      ["dagger", "silver_dagger", "staff"].includes(w.id),
    languages: "",
    description:
      "Illusionists are adventurers who study the arcane arts of illusion and deception. Through this study, they have learned to cast magic spells.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 2500,
    abilities: [{ name: "Arcane Magic" }],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: true,
    divine: false,
    illusionistSpells: true,
  },
  {
    name: "Knight",
    category: "advanced",
    requirements: "Minimum 9 constitution, minimum 9 dexterity",
    primeReqs: ["strength"],
    hd: 8,
    maxLevel: 14,
    armour: "chainmail, plate mail, shields",
    weapons: "melee weapons",
    isStandardWeapon: (w) => checkWeaponQuality(w, "Melee"),
    languages: "",
    description:
      "Knights are warriors who serve a noble house or knightly order, carrying out their liege’s command and combat, preferring the lance above all other weapons. Knights are often members of the noble classes, but a person of lowlier origin may be initiated as a knight as a reward for noble deeds.",
    savingThrows: [12, 13, 14, 15, 16],
    nextLevel: 2500,
    abilities: [
      { name: "Chivalric Code" },
      { name: "Horsemanship" },
      { name: "Mounted Combat" },
      { name: "Strength of Will" },
      { name: "Hospitality", minLevel: 3 },
      { name: "Stronghold", minLevel: 3 },
      { name: "Flying Mounts", minLevel: 5 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
  },
  {
    name: "Necromancer",
    category: "advanced",
    requirements: "Minimum 9 wisdom",
    primeReqs: ["intelligence"],
    hd: 4,
    maxLevel: 14,
    armour: "none",
    weapons: "dagger, staff (optional)",
    isStandardWeapon: (w) =>
      ["dagger", "silver_dagger", "staff"].includes(w.id),
    languages: "",
    description:
      "Necromancers are adventurers who study the arcane arts of death and the undead. Through this study, they have learned to cast magic spells.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 2500,
    abilities: [{ name: "Arcane Magic" }],
    link: "https://www.drivethrurpg.com/product/414657/OldSchool-Essentials-The-Necromancer",
    arcane: true,
    necromancerSpells: true,
    divine: false,
  },
  {
    name: "Paladin",
    category: "advanced",
    requirements: "Minimum 9 charisma",
    primeReqs: ["strength", "wisdom"],
    xpBonusRule: "10% if both strength and wisdom are 16 or more; 5% if either strength or wisdom is 13 or more",
    hd: 8,
    maxLevel: 14,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Paladins are warriors sworn by sacred oath to the service of a Lawful holy order.",
    savingThrows: [10, 11, 12, 13, 14],
    nextLevel: 2750,
    abilities: [
      { name: "Divine Magic" },
      { name: "Holy Resistance" },
      { name: "Laying on Hands" },
      { name: "Turning the Undead" },
      { name: "Vow of Humility" },
      { name: "War Horse", minLevel: 4 },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: true,
  },
  {
    name: "Ranger",
    category: "advanced",
    requirements: "Minimum 9 constitution, minimum 9 wisdom",
    primeReqs: ["strength"],
    hd: 8,
    maxLevel: 14,
    armour: "leather, chainmail, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Rangers are members of a secret society which protects their native lands from invasion and the influence of Chaos. They are skilled warriors who are adapted to life in the wilds. At higher levels, their connection with nature grants them the ability to cast spells.",
    savingThrows: [12, 13, 14, 15, 16],
    nextLevel: 2250,
    abilities: [
      { name: "Awareness" },
      { name: "Divine Magic" },
      { name: "Foraging and Hunting" },
      { name: "Limited Possessions" },
      { name: "Pursuit" },
      { name: "Surprise Attack" },
      { name: "Tracking" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: true,
    divine: false,
  },
  {
    name: "Svirfneblin",
    category: "advanced",
    requirements: "Minimum 9 constitution",
    primeReqs: ["strength"],
    hd: 6,
    maxLevel: 8,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages:
      "Deepcommon, Gnomish, Dwarvish, Kobold, the language of earth elementals",
    description:
      "Short, thickset demihumans with long noses and gnarled, hairless, grey skin. Svirfneblins (also known as deep gnomes) are subterranean cousins of the gnomes who live close to the surface. Svirfneblins are skilled tunnellers and makers of mechanical contraptions and cunning secret doors. They love gems above all else and excavate their communities around veins of precious stones. Svirfneblins are typically around 3½’ tall and weigh around 120 pounds.",
    savingThrows: [8, 9, 10, 14, 11],
    nextLevel: 2400,
    abilities: [
      { name: "Blend into Stone" },
      { name: "Defensive Bonus" },
      { name: "Detect Construction Tricks" },
      { name: "Illusion Resistance" },
      { name: "Infravision" },
      { name: "Light Sensitivity" },
      { name: "Speak with Earth Elementals" },
      { name: "Stone Murmurs" },
      { name: "Using Magic Items" },
    ],
    link: "https://oldschoolessentials.necroticgnome.com/srd/",
    arcane: false,
    divine: false,
  },
  {
    name: "Acolyte",
    category: "carcass",
    requirements: null,
    primeReqs: ["wisdom"],
    hd: 6,
    maxLevel: 14,
    armour: "any",
    weapons: "only blunt weapons",
    isStandardWeapon: (w) => checkWeaponQuality(w, "Blunt"),
    languages: "",
    description:
      "Acolytes are adventurers who have sworn to serve a deity. They are trained for battle and can channel the power of their deity.",
    savingThrows: [11, 12, 14, 16, 15],
    nextLevel: 1500,
    abilities: [
      { name: "Bless" },
      { name: "Detect Magic" },
      { name: "Divine Magic" },
      { name: "Know Alignment" },
      { name: "Purify" },
      { name: "Rally" },
      { name: "Turn Undead" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-1",
    arcane: false,
    divine: true,
  },
  {
    name: "Gargantua",
    category: "carcass",
    requirements: "Minimum 9 constitution, minimum 9 strength",
    primeReqs: ["strength", "constitution"],
    xpBonusRule: "10% if strength is 16 or more and constitution is 13 or more; 5% if both strength and constitution are 13 or more",
    hd: 10,
    maxLevel: 10,
    armour: "any",
    weapons: "any, can wield two-handed melee weapon with one hand",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Known as the “Big Siblings of Human-kind,” gargantuas are demihumans who stand about 7½’ tall and weigh 550 pounds. Gargantuas typically live among or near humans, though some prefer to establish their own communities in the wilderness. They are known as powerful warriors with a strong resistance to every kind of hardship. Gargantuas also have a reputation for being slow-witted and literal-minded that is not entirely deserved, though it is true that they lack subtlety when compared to their smaller kin. They can be steadfast allies or unyielding foes.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2500,
    abilities: [{ name: "Open Doors" }, { name: "Rock Throwing" }],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-1",
    arcane: false,
    divine: false,
  },
  {
    name: "Goblin",
    category: "carcass",
    requirements: "Minimum 9 dexterity",
    primeReqs: ["dexterity", "strength"],
    xpBonusRule: "10% if both dexterity and strength are 16 or more; 5% if either dexterity or strength is 13 or more",
    hd: 6,
    maxLevel: 8,
    armour: "any",
    weapons: "any appropriate to size",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Goblin, the language of wolves",
    description:
      "Goblins are short demihumans standing between 3’ and 3½’ tall. They possess skin ranging in colour from yellow to orange to red (and everything in between), while their eyes are usually reddish in hue and are visible even in the dark. Though many goblins live underground, not all do so, especially those most likely to interact with humans and join adventuring parties. Goblins can be somewhat surly and resentful when interacting with other beings, or even their own kin, like bugbears and hobgoblins. These attitudes are only heightened by the fact that many goblins—though not all—are aligned with Chaos.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2000,
    abilities: [
      { name: "Defensive Bonus" },
      { name: "Detect Construction Tricks" },
      { name: "Infravision" },
      { name: "Stealth" },
      { name: "Wolf Affinity" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-1",
    arcane: false,
    divine: false,
  },
  {
    name: "Hephaestan",
    category: "carcass",
    requirements: "Minimum 9 charisma, minimum 9 constitution",
    primeReqs: ["intelligence", "wisdom"],
    xpBonusRule: "10% if intelligence is 16 or more and wisdom is 13 or more; 5% if both intelligence and wisdom are 13 or more",
    hd: 6,
    maxLevel: 10,
    armour: "leather, chainmail, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Hephaestan",
    description:
      "Hephaestans are a race of tall (6’), thin demihumans with angular features and pointed ears. Some sages claim they are relatives of elves, hailing from a distant land or even another world. For their part, hephaestans are tight lipped on the subject of their origins. Coldly rational and seemingly without emotion, the hephaestans are highly skilled in the use of mental powers, which they employ instead of magic. Despite their aloofness, hephaestans get along well with most intelligent races.",
    savingThrows: [12, 13, 13, 15, 15],
    nextLevel: 3000,
    abilities: [
      { id: "listening_at_doors", name: "Listening at Doors" },
      { name: "Mental Powers (ESP, gestalt, healing trance, mind control, mind shield, telepathy)" },
      { name: "Neuropressure" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-1",
    arcane: false,
    divine: false,
  },
  {
    name: "Kineticist",
    category: "carcass",
    requirements: null,
    primeReqs: ["dexterity", "wisdom"],
    xpBonusRule: "10% if both dexterity and wisdom are 16 or more; 5% if both dexterity and wisdom are 13 or more",
    hd: 6,
    maxLevel: 14,
    armour: "none",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Kineticists are masters of mind over matter, their rigorous physical and mental training focusing on the manipulation of internal kinetic force. This force can be harnessed to accelerate motion and hone reactions or can be projected outward to affect distant objects.\nThe ability to manipulate kinetic force may be awakened spontaneously or may be learned from a master. Either way, it is often the case that this power runs in families.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 2000,
    abilities: [
      { name: "Mental Defense" },
      { name: "Mental Powers (accelerated motion, control density, crush life, kinetic fist, kinetic leap, kinetic shield, kinetic wave, telekinetic attack, throw weapon)" },
      { name: "Neuropressure" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-1",
    arcane: false,
    divine: false,
  },
  {
    name: "Mage",
    category: "carcass",
    requirements: null,
    primeReqs: ["intelligence", "wisdom"],
    xpBonusRule: "10% if intelligence is 16 or more and wisdom is 13 or more; 5% if both intelligence and wisdom are 13 or more",
    hd: 6,
    maxLevel: 14,
    armour: "none",
    weapons: "dagger, short sword, staff, sword",
    isStandardWeapon: (w) =>
      ["dagger", "short_sword", "staff", "sword"].includes(w.id),
    languages: "",
    description:
      "Mages are adventurers who study the secrets of deep magic, making them powerful allies.",
    savingThrows: [12, 13, 12, 15, 14],
    nextLevel: 2800,
    abilities: [
      { name: "Arcane Magic" },
      { name: "Detect Magic" },
      { name: "Healing" },
      { name: "Mage Armour" },
      { name: "Mage’s Staff" },
      { name: "Open/Close" },
      { name: "Rally/Fear" },
      { name: "Read Magic" },
      { name: "Scribing Scrolls" },
      { name: "Suggestion" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-1",
    arcane: true,
    divine: false,
  },
  {
    name: "Phase Elf",
    category: "carcass",
    requirements: "Minimum 9 intelligence",
    primeReqs: ["intelligence", "strength"],
    xpBonusRule: "10% if intelligence is 16 or more and strength is 13 or more; 5% if both intelligence and strength are 13 or more",
    hd: 6,
    maxLevel: 10,
    armour: "any / none",
    weapons: "any / dagger",
    isStandardWeapon: (w) => true,
    languages: "Elvish, Doppelgänger, Dragon, Pixie",
    description:
      "Phase elves are slender, fey demihumans with pointed ears. They typically weigh about 120 pounds and are between 5½ and 6 feet tall. Their hair tends to be violet or silver and their eyes are either pure black or pure white—without an iris or pupil (see Dual Persona). Phase elves originate from an alternate dimension which is inaccessible to other races, and about which they never speak.",
    savingThrows: [12, 13, 13, 15, 15],
    nextLevel: 2800,
    abilities: [
      { name: "Arcane Magic" },
      { id: "detect_secret_doors", name: "Detect Secret Doors" },
      { name: "Dual Persona" },
      { name: "Immunity to Ghoul Paralysis" },
      { name: "Infravision" },
      { id: "listening_at_doors", name: "Listening at Doors" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-2",
    arcane: true,
    arcaneSpells: true,
    divine: false,
  },
  {
    name: "Wood Elf",
    category: "carcass",
    requirements: "Minimum 9 dexterity, minimum 9 intelligence",
    primeReqs: ["dexterity", "wisdom"],
    xpBonusRule: "10% if dexterity is 16 or more and wisdom is 13 or more; 5% if both dexterity and wisdom are 13 or more",
    hd: 6,
    maxLevel: 10,
    armour: "leather, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Elvish, Bugbear, Dryad, Gnoll",
    description:
      "Wood elves are slender, fey demihumans with pointed ears. They typically weigh about 110 pounds and are between 5 and 5½ feet tall. Wood elves dwell in hidden, treetop settlements in deep forests, and are seldom seen by humans. They are reclusive and defend their homelands against trespassers. Like druids, wood elves worship the force of nature and the myriad deities that personify it.",
    savingThrows: [12, 13, 13, 15, 15],
    nextLevel: 3000,
    abilities: [
      { name: "Awareness" },
      { id: "detect_secret_doors", name: "Detect Secret Doors" },
      { name: "Divine Magic" },
      { name: "Foraging and Hunting" },
      { name: "Hiding" },
      { name: "Immunity to Ghoul Paralysis" },
      { name: "Infravision" },
      { id: "listening_at_doors", name: "Listening at Doors" },
      { name: "Missile Attack Bonus" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-2",
    arcane: false,
    divine: true,
    druidSpells: true,
  },
  {
    name: "Beast Master",
    category: "carcass",
    requirements: null,
    primeReqs: ["strength", "wisdom"],
    xpBonusRule: "10% if strength is 16 or more and wisdom is 13 or more; 5% if both strength and wisdom are 13 or more",
    hd: 6,
    maxLevel: 14,
    armour: "leather, chainmail, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Beast masters are adventurers with a special connection to animals. They are often accompanied by one or more loyal beasts.",
    savingThrows: [11, 12, 12, 15, 16],
    nextLevel: 1800,
    abilities: [
      { name: "Animal Companions" },
      { name: "Clairvoyance", minLevel: 5 },
      { name: "Identify Tracks" },
      { name: "Reaction Modifier" },
      { name: "Speak with Animals" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-3",
    arcane: false,
    divine: false,
  },
  {
    name: "Dragonborn",
    category: "carcass",
    requirements: "Minimum 9 constitution, minimum 9 intelligence",
    primeReqs: ["strength"],
    hd: 8,
    maxLevel: 10,
    armour: "any",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Dragon",
    description:
      "Dragonborn are tall, powerful demihumans with scaled skin and dragon-like heads. They typically weigh about 250 pounds and stand around 6’ tall. As reptiles, they reproduce by laying eggs. Unlike true dragons, dragonborn do not have wings or tails. Dragonborn live in clans based on the colour of their scales (see Draconic Bloodline) and are known for their fierce loyalty and their love of hoarding gold. It is believed that dragonborn were created by the dragon gods.",
    savingThrows: [12, 13, 14, 13, 16],
    nextLevel: 3000,
    abilities: [
      { name: "Breath Weapon" },
      { name: "Draconic Bloodline (roll d10 on table)" },
      { name: "Draconic Resistance" },
      { name: "Dragon-Affecting Magic" },
      { name: "Dragon Affinity" },
      { name: "Scales" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-3",
    arcane: false,
    divine: false,
  },
  {
    name: "Mutoid",
    category: "carcass",
    requirements: null,
    primeReqs: ["dexterity"],
    hd: 6,
    maxLevel: 8,
    armour: "leather, shields",
    weapons: "one-handed melee weapons, all missile weapons",
    isStandardWeapon: (w) =>
      (checkWeaponQuality(w, "Melee") &&
        !checkWeaponQuality(w, "Two-handed")) ||
      checkWeaponQuality(w, "Missile"),
    languages: "",
    description:
      "Demihumans with mismatched body parts of many different creatures (e.g. reptiles, crustaceans, birds, mammals, etc.). Each individual has a unique appearance. Mutoids are often shunned by other species and live in ruins or in hidden lairs within large settlements.",
    savingThrows: [10, 11, 12, 13, 14],
    nextLevel: 1750,
    abilities: [
      { name: "Back-Stab" },
      { name: "Mutations" },
      { name: "Mutoid Skills (Hide in shadows, mimicry, move silently, pick pockets)" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-3",
    arcane: false,
    divine: false,
  },
  {
    name: "Mycelian",
    category: "carcass",
    requirements: "Minimum 9 constitution",
    primeReqs: ["strength"],
    hd: 8,
    maxLevel: 6,
    armour: "shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Deepcommon",
    description:
      "Mycelians are humanoid mushrooms, with tall stems, wide, flat caps, and beady eyes amid their gills. They have no mouths, but communicate telepathically. They dwell in lightless caverns deep underground.",
    savingThrows: [9, 11, 9, 13, 12],
    nextLevel: 3000,
    abilities: [
      { name: "Fungal Spores (Pacifying, hallucinogenic)" },
      { name: "Growth" },
      { name: "Unarmed Attacks" },
      { name: "Natural Armour Class" },
      { name: "Infravision" },
      { name: "Light Sensitivity" },
      { name: "Rest and Sustenance" },
      { name: "Telepathic Communication" },
      { name: "Fungal Reanimation", minLevel: 6 },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-3",
    arcane: false,
    divine: false,
  },
  {
    name: "Tiefling",
    category: "carcass",
    requirements: "Minimum 9 intelligence",
    primeReqs: ["charisma", "dexterity"],
    xpBonusRule: "10% if both charisma and dexterity are 16 or more; 5% if either charisma or dexterity is 13 or more",
    hd: 6,
    maxLevel: 10,
    armour: "leather, chainmail, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "",
    description:
      "Tieflings are humans with a mysterious fiendish ancestor. They tend to be outcasts living on the fringes of society, shunned by those who fear their heritage.",
    savingThrows: [11, 12, 12, 15, 14],
    nextLevel: 2500,
    abilities: [
      { name: "Fiendish Heritage (roll on tables)" },
      { name: "Holy Water Vulnerability" },
      { name: "Infravision" },
      { name: "Tiefling Skills (Beguile, hear noise, hide in shadows, move silently)" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-3",
    arcane: false,
    divine: false,
  },
  {
    name: "Halfling Hearthsinger",
    category: "carcass",
    requirements:
      "Minimum 9 charisma, minimum 9 constitution, minimum 9 dexterity",
    primeReqs: ["charisma", "constitution"],
    xpBonusRule: "10% if both charisma and constitution are 13 or more; 5% if either charisma or constitution is 13 or more",
    hd: 6,
    maxLevel: 8,
    armour: "leather, shields",
    weapons: "any appropriate to size",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Halfling",
    description:
      "Hearthsingers are halflings who specialise in memorising and recalling legends, lore, and local folktales. The desire to learn the truth behind lost legends and forgotten myths often drives them to adventure and they value tomes, journals, and written histories over other treasure.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2000,
    abilities: [
      { name: "Defensive Bonus" },
      { name: "Halfling Hearthsinger Skills" },
      { name: "Listening at Doors (2-in-6)" },
      { name: "Rumour Monger" },
      { name: "Tavern" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-4",
    arcane: false,
    divine: false,
  },
  {
    name: "Halfling Reeve",
    category: "carcass",
    requirements:
      "minimum 9 constitution, minimum 9 dexterity, minimum 9 wisdom",
    primeReqs: ["constitution", "wisdom"],
    xpBonusRule: "10% if both constitution and wisdom are 13 or more; 5% if either constitution or wisdom is 13 or more",
    hd: 6,
    maxLevel: 8,
    armour: "leather, shields",
    weapons: "any appropriate to size",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Halfling",
    description:
      "Reeves are the sworn protectors of rural halfling communities. They patrol the wilderness surrounding these idyllic villages, forgoing home comforts to ensure that predators and enemies do not endanger their kinsfolk or threaten the simple peace of the little folk.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2500,
    abilities: [
      { name: "Defensive Bonus" },
      { name: "Divine Magic (4th Level)" },
      { name: "Goblin Slayer" },
      { name: "Limited Possessions" },
      { name: "Stealth" },
      { name: "Wolf Hunter" },
      { name: "Hunting Lodge" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-4",
    arcane: false,
    divine: true,
  },
  {
    name: "Arcane Bard",
    category: "carcass",
    requirements: "Minimum 9 dexterity, minimum 9 intelligence",
    primeReqs: ["charisma", "dexterity"],
    xpBonusRule: "10% if either charisma or dexterity is 16 or more and the other is 13 or more; 5% if either charisma or dexterity is 13 or more",
    hd: 6,
    maxLevel: 14,
    armour: "leather, chainmail",
    weapons: "missile weapons, one-handed melee weapons",
    isStandardWeapon: (w) =>
      checkWeaponQuality(w, "Missile") ||
      (checkWeaponQuality(w, "Melee") && !checkWeaponQuality(w, "Two-handed")),
    languages: "",
    description:
      "Arcane bards are musicians and poets drawn to a life of wandering and adventure. They pick up a wide range of abilities in their travels, becoming jacks-of-all-trades.",
    savingThrows: [13, 14, 13, 16, 15],
    nextLevel: 2000,
    abilities: [
      { name: "Anti-Charm" },
      { name: "Arcane Bard Skills" },
      { name: "Arcane Magic" },
      { name: "Lore", minLevel: 2 },
      { name: "Manor" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-4",
    arcane: true,
    divine: false,
  },
  {
    name: "Ratling",
    category: "carcass",
    requirements: "Minimum 9 constitution",
    primeReqs: ["dexterity"],
    hd: 6,
    maxLevel: 8,
    armour: "leather, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "the secret language of rats",
    description:
      "Ratlings are fur-covered, rat-like, bipedal humanoids. They stand 4′ to 5′ tall and have 3′-long prehensile tails, large ears, and sensitive noses. Though industrious and adaptable, their association with vermin tends to place them in the fringes of human settlements. Ratlings are born in broods of 3–5, reach maturity around age 7 or 8, and rarely live past 40. Naturally gregarious, their relatively short lifespans lend the species a certain devil-may-care outlook that other races find amusing",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2000,
    abilities: [
      { name: "Awareness" },
      { name: "Infravision" },
      { name: "Prehensile Tail" },
      { name: "Rat Affinity" },
      { name: "Ratling Skills (climb sheer surfaces, detect poison, hear noise, hide in shadows, move silently)" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-5",
    arcane: false,
    divine: false,
  },
  {
    name: "Changeling",
    category: "carcass",
    requirements: "Minimum 9 intelligence",
    primeReqs: ["charisma", "dexterity"],
    xpBonusRule: "10% if both charisma and dexterity are 16 or more; 5% if either charisma or dexterity is 13 or more",
    hd: 6,
    maxLevel: 10,
    armour: "leather, shields",
    weapons: "any",
    isStandardWeapon: () => true,
    languages: "Doppelgänger",
    description:
      "Changelings are magical demihumans with powers of deception and shape-stealing. In their natural form, a changeling appears to be a normal human.",
    savingThrows: [11, 12, 12, 15, 12],
    nextLevel: 2500,
    abilities: [
      { name: "Back-Stab" },
      { name: "Changeling Skills (beguile, hear noise, hide in shadows, move silently)" },
      { name: "Shape-Stealing" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-5",
    arcane: false,
    divine: false,
  },
  {
    name: "Dwarf Brewmaster",
    category: "carcass",
    requirements: "Minimum 9 constitution",
    primeReqs: ["constitution", "strength"],
    xpBonusRule: "10% if both constitution and strength are 16 or more; 5% if either constitution or strength is 13 or more",
    hd: 8,
    maxLevel: 10,
    armour: "leather, chainmail, shields",
    weapons: "battle axe, dagger, hand axe, mace, short sword, warhammer",
    isStandardWeapon: (w) =>
      [
        "battle_axe",
        "dagger",
        "silver_dagger",
        "hand_axe",
        "mace",
        "short_sword",
        "warhammer",
      ].includes(w.id),
    languages: "Dwarvish, Gnomish, Goblin, Kobold",
    description:
      "Brewmasters are dwarves who dedicate their lives to the craft of brewing alcohol. In combat, they are unpredictable brawlers who fight with drunken fury. Dwarf brewmasters are driven to adventure in search of rare ingredients, secret recipes, and ever-stronger drinks.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2500,
    abilities: [
      { name: "Brewing" },
      { name: "Drunken Fighting" },
      { name: "Infravision" },
      { name: "Ingested Poison Resistance" },
      { id: "listening_at_doors", name: "Listening at Doors" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-6",
    arcane: false,
    divine: false,
  },
  {
    name: "Dwarf Runesmith",
    category: "carcass",
    requirements: "Minimum 9 constitution, minimum 9 intelligence",
    primeReqs: ["strength", "intelligence"],
    xpBonusRule: "10% if strength is 16 or more and intelligence is 13 or more; 5% if both strength and intelligence are 13 or more",
    hd: 8,
    maxLevel: 10,
    armour: "any",
    weapons: "small or normal-sized",
    isStandardWeapon: (w) => !large_weapons.includes(w.id),
    languages: "Dwarvish, Gnomish, Goblin, Kobold",
    description:
      "While dwarves typically have no skill as magic-users, the wondrous magical armaments of their smiths are legendary. Masters of an ancient secret tradition, dwarf runesmiths wield magic by binding it into runes of power.",
    savingThrows: [8, 9, 10, 13, 12],
    nextLevel: 2800,
    abilities: [
      { name: "Forge-Craft" },
      { name: "Infravision" },
      { id: "listening_at_doors", name: "Listening at Doors" },
      { name: "Rune Magic" },
    ],
    link: "https://necroticgnome.com/products/carcass-crawler-issue-6",
    arcane: false,
    runesmithSpells: true,
    divine: false,
  },
].map((x) => new ClassOptions(x));

const emptyClassOptions = new ClassOptions({
  name: "",
  category: "",
  requirements: null,
  primeReqs: [],
  hd: 0,
  maxLevel: 0,
  armour: "",
  weapons: "",
  isStandardWeapon: () => false,
  languages: "",
  description: "",
  savingThrows: [0, 0, 0, 0, 0],
  nextLevel: 0,
  abilities: [],
  link: "",
  arcane: false,
  divine: false,
});

export { ClassOptions, classOptionsData, emptyClassOptions };

export default classOptionsData;
