import { abilityScoreNames } from "../constants/constants";
import type { AbilityScores } from "../types";
import { getAbilitiesForLevel } from "../utilities/classAbilities";
import classOptionsData, { thiefSkillTable } from "./classOptionsData";

// Get the ClassOptions class from the first item in the array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClassOptions = classOptionsData[0].constructor as any;

describe("ClassOptions", () => {
    describe("Armour String Validation", () => {
      test("all class armour strings should be valid", () => {
        const invalidClasses: Array<{ name: string; armour: string; error: string }> = [];
        const ClassOptions = classOptionsData[0].constructor as any;
        classOptionsData.forEach((classOption) => {
          try {
            // This will throw if the armour string is invalid
            ClassOptions.parseArmourString(classOption.armour);
          } catch (e) {
            invalidClasses.push({ name: classOption.name, armour: classOption.armour, error: String(e) });
          }
        });
        if (invalidClasses.length > 0) {
          console.error("Invalid armour strings found:", invalidClasses);
        }
        expect(invalidClasses).toEqual([]);
      });
    });
  describe("xpModifierPercentage", () => {
    test("should return correct prime req mod for Fighter (Strength)", () => {
      const scores = { strength: 15 } as AbilityScores;
      const fighter = classOptionsData.find((c) => c.name === "Fighter");
      expect(fighter.xpModifierPercentage(scores)).toBe("5%");
    });

    test("should return correct amount for low prime req", () => {
      const scores = { strength: 8 } as AbilityScores;
      const fighter = classOptionsData.find((c) => c.name === "Fighter");
      expect(fighter.xpModifierPercentage(scores)).toBe("-10%");
    });
  });

  describe("parseAbilityRequirements", () => {
    test("should return empty array for null", () => {
      const result = ClassOptions.parseAbilityRequirements(null);
      expect(result).toEqual([]);
    });

    test("should return empty array for undefined", () => {
      const result = ClassOptions.parseAbilityRequirements(undefined);
      expect(result).toEqual([]);
    });

    test("should parse single requirement", () => {
      const result = ClassOptions.parseAbilityRequirements("Minimum 9 constitution");
      expect(result).toEqual([{ ability: "constitution", minimum: 9 }]);
    });

    test("should parse single requirement with lowercase 'minimum'", () => {
      const result = ClassOptions.parseAbilityRequirements("minimum 9 constitution");
      expect(result).toEqual([{ ability: "constitution", minimum: 9 }]);
    });

    test("should parse multiple requirements", () => {
      const result = ClassOptions.parseAbilityRequirements(
        "Minimum 9 constitution, minimum 9 dexterity"
      );
      expect(result).toEqual([
        { ability: "constitution", minimum: 9 },
        { ability: "dexterity", minimum: 9 },
      ]);
    });

    test("should parse three requirements", () => {
      const result = ClassOptions.parseAbilityRequirements(
        "Minimum 9 charisma, minimum 9 constitution, minimum 9 dexterity"
      );
      expect(result).toEqual([
        { ability: "charisma", minimum: 9 },
        { ability: "constitution", minimum: 9 },
        { ability: "dexterity", minimum: 9 },
      ]);
    });

    test("should handle different ability scores", () => {
      const abilities = [
        "strength",
        "intelligence",
        "wisdom",
        "dexterity",
        "constitution",
        "charisma",
      ];

      abilities.forEach((ability) => {
        const result = ClassOptions.parseAbilityRequirements(
          `Minimum 9 ${ability}`
        );
        expect(result).toEqual([{ ability, minimum: 9 }]);
      });
    });

    test("should handle different minimum values", () => {
      const result = ClassOptions.parseAbilityRequirements("Minimum 13 strength");
      expect(result).toEqual([{ ability: "strength", minimum: 13 }]);
    });

    test("should handle extra whitespace", () => {
      const result = ClassOptions.parseAbilityRequirements(
        "Minimum 9 constitution,   minimum 9 dexterity"
      );
      expect(result).toEqual([
        { ability: "constitution", minimum: 9 },
        { ability: "dexterity", minimum: 9 },
      ]);
    });
  });

  describe("checkAbilityScoreRequirements", () => {
    test("should return true for null requirements", () => {
      const classOption = classOptionsData.find((c) => c.name === "Fighter");
      const abilityScores = {
        strength: 8,
        intelligence: 8,
        wisdom: 8,
        dexterity: 8,
        constitution: 8,
        charisma: 8,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(true);
    });

    test("should return true when single requirement is met", () => {
      const classOption = classOptionsData.find((c) => c.name === "Dwarf");
      const abilityScores = {
        strength: 10,
        intelligence: 10,
        wisdom: 10,
        dexterity: 10,
        constitution: 9,
        charisma: 10,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(true);
    });

    test("should return false when single requirement is not met", () => {
      const classOption = classOptionsData.find((c) => c.name === "Dwarf");
      const abilityScores = {
        strength: 10,
        intelligence: 10,
        wisdom: 10,
        dexterity: 10,
        constitution: 8,
        charisma: 10,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(false);
    });

    test("should return true when all multiple requirements are met", () => {
      const classOption = classOptionsData.find((c) => c.name === "Halfling");
      const abilityScores = {
        strength: 10,
        intelligence: 10,
        wisdom: 10,
        dexterity: 9,
        constitution: 9,
        charisma: 10,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(true);
    });

    test("should return false when one of multiple requirements is not met", () => {
      const classOption = classOptionsData.find((c) => c.name === "Halfling");
      const abilityScores = {
        strength: 10,
        intelligence: 10,
        wisdom: 10,
        dexterity: 9,
        constitution: 8,
        charisma: 10,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(false);
    });

    test("should return false when all multiple requirements are not met", () => {
      const classOption = classOptionsData.find((c) => c.name === "Halfling");
      const abilityScores = {
        strength: 10,
        intelligence: 10,
        wisdom: 10,
        dexterity: 8,
        constitution: 8,
        charisma: 10,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(false);
    });

    test("should work with three requirements", () => {
      const classOption = classOptionsData.find(
        (c) => c.name === "Halfling Hearthsinger"
      );
      const abilityScores = {
        strength: 10,
        intelligence: 10,
        wisdom: 10,
        dexterity: 9,
        constitution: 9,
        charisma: 9,
      };
      expect(classOption.checkAbilityScoreRequirements(abilityScores)).toBe(true);
    });
  });

  describe("Requirement String Format Validation", () => {
    test("all requirement strings should be valid or null", () => {
      const invalidClasses = [];

      classOptionsData.forEach((classOption) => {
        if (classOption.requirements === null) {
          // null is valid
          return;
        }

        const parsed = ClassOptions.parseAbilityRequirements(
          classOption.requirements
        );

        // Check that we parsed at least one requirement
        if (parsed.length === 0) {
          invalidClasses.push({
            name: classOption.name,
            requirements: classOption.requirements,
            reason: "No requirements parsed",
          });
          return;
        }

        // Check that each parsed requirement has a valid ability name
        parsed.forEach((req) => {
          if (!abilityScoreNames.includes(req.ability)) {
            invalidClasses.push({
              name: classOption.name,
              requirements: classOption.requirements,
              reason: `Invalid ability name: ${req.ability}`,
            });
          }
        });
      });

      if (invalidClasses.length > 0) {
        console.error("Invalid requirement strings found:", invalidClasses);
      }

      expect(invalidClasses).toEqual([]);
    });

    test("all requirement strings should follow the expected format", () => {
      const validPattern = /^[Mm]inimum \d+ \w+(, [Mm]inimum \d+ \w+)*$/;
      const invalidClasses = [];

      classOptionsData.forEach((classOption) => {
        if (classOption.requirements === null) {
          // null is valid
          return;
        }

        if (!validPattern.test(classOption.requirements)) {
          invalidClasses.push({
            name: classOption.name,
            requirements: classOption.requirements,
          });
        }
      });

      if (invalidClasses.length > 0) {
        console.error(
          "Classes with invalid requirement format:",
          invalidClasses
        );
      }

      expect(invalidClasses).toEqual([]);
    });

    test("all parsed requirements should have minimum value of 9", () => {
      const invalidClasses = [];

      classOptionsData.forEach((classOption) => {
        if (classOption.requirements === null) {
          return;
        }

        const parsed = ClassOptions.parseAbilityRequirements(
          classOption.requirements
        );

        parsed.forEach((req) => {
          if (req.minimum !== 9) {
            invalidClasses.push({
              name: classOption.name,
              requirements: classOption.requirements,
              parsedRequirement: req,
              reason: `Expected minimum 9, got ${req.minimum}`,
            });
          }
        });
      });

      if (invalidClasses.length > 0) {
        console.error(
          "Classes with non-9 minimum requirements:",
          invalidClasses
        );
      }

      expect(invalidClasses).toEqual([]);
    });
  });

  describe("parseXpBonusRule", () => {
    test("should return empty array for null", () => {
      expect(ClassOptions.parseXpBonusRule(null)).toEqual([]);
    });

    test("should parse an 'either A or B is N or more' condition", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "5% if either strength or wisdom is 13 or more"
      );
      expect(clauses).toEqual([
        { percent: 5, condition: { type: "either", ability1: "strength", ability2: "wisdom", threshold: 13 } },
      ]);
    });

    test("should parse a 'both A and B are N or more' condition", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "5% if both dexterity and strength are 13 or more"
      );
      expect(clauses).toEqual([
        { percent: 5, condition: { type: "both", ability1: "dexterity", ability2: "strength", threshold: 13 } },
      ]);
    });

    test("should parse an 'A is N or more and B is M or more' condition", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "5% if intelligence is 13 or more and strength is 13 or more"
      );
      expect(clauses).toEqual([
        { percent: 5, condition: { type: "pair", ability1: "intelligence", threshold1: 13, ability2: "strength", threshold2: 13 } },
      ]);
    });

    test("should parse a pair condition with differing thresholds", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "5% if intelligence is 16 or more and strength is 13 or more"
      );
      expect(clauses).toEqual([
        { percent: 5, condition: { type: "pair", ability1: "intelligence", threshold1: 16, ability2: "strength", threshold2: 13 } },
      ]);
    });

    test("should parse an 'either A or B is N or more and the other is M or more' condition", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "5% if either intelligence or strength is 16 or more and the other is 13 or more"
      );
      expect(clauses).toEqual([
        { percent: 5, condition: { type: "symmetric", ability1: "intelligence", ability2: "strength", threshold1: 16, threshold2: 13 } },
      ]);
    });

    test("should parse multiple clauses", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "10% if both dexterity and strength are 13 or more; 5% if either dexterity or strength is 13 or more"
      );
      expect(clauses).toHaveLength(2);
      expect(clauses[0].condition.type).toBe("both");
      expect(clauses[1].condition.type).toBe("either");
    });

    test("should parse different percentage amounts", () => {
      const clauses = ClassOptions.parseXpBonusRule(
        "10% if both charisma and dexterity are 16 or more; 5% if either charisma or dexterity is 13 or more"
      );
      expect(clauses[0].percent).toBe(10);
      expect(clauses[1].percent).toBe(5);
    });

    test("should throw on an invalid clause", () => {
      expect(() => ClassOptions.parseXpBonusRule("bad string")).toThrow();
    });

    test("should throw on an unknown condition form", () => {
      expect(() =>
        ClassOptions.parseXpBonusRule("5% if something weird happens")
      ).toThrow();
    });
  });

  describe("evaluateXpClauses", () => {
    const parse = (rule: string) => ClassOptions.parseXpBonusRule(rule);
    const eval_ = (rule: string, scores: Partial<AbilityScores>) =>
      ClassOptions.evaluateXpClauses(parse(rule), scores as AbilityScores);

    describe("'either' condition", () => {
      const rule = "5% if either strength or wisdom is 13 or more";

      test("returns 5 when first ability meets threshold", () => {
        expect(eval_(rule, { strength: 13, wisdom: 8 })).toBe(5);
      });
      test("returns 5 when second ability meets threshold", () => {
        expect(eval_(rule, { strength: 8, wisdom: 14 })).toBe(5);
      });
      test("returns 5 when both abilities meet threshold", () => {
        expect(eval_(rule, { strength: 13, wisdom: 13 })).toBe(5);
      });
      test("returns 0 when neither ability meets threshold", () => {
        expect(eval_(rule, { strength: 12, wisdom: 12 })).toBe(0);
      });
    });

    describe("'both' condition", () => {
      const rule = "5% if both dexterity and strength are 13 or more";

      test("returns 5 when both meet threshold", () => {
        expect(eval_(rule, { dexterity: 13, strength: 13 })).toBe(5);
      });
      test("returns 0 when only first meets threshold", () => {
        expect(eval_(rule, { dexterity: 13, strength: 12 })).toBe(0);
      });
      test("returns 0 when only second meets threshold", () => {
        expect(eval_(rule, { dexterity: 12, strength: 13 })).toBe(0);
      });
    });

    describe("'pair' condition (different thresholds)", () => {
      const rule = "5% if constitution is 16 or more and strength is 13 or more";

      test("returns 5 when both conditions met", () => {
        expect(eval_(rule, { constitution: 16, strength: 13 })).toBe(5);
      });
      test("returns 0 when first threshold not met", () => {
        expect(eval_(rule, { constitution: 15, strength: 13 })).toBe(0);
      });
      test("returns 0 when second threshold not met", () => {
        expect(eval_(rule, { constitution: 16, strength: 12 })).toBe(0);
      });
    });

    describe("'symmetric' condition", () => {
      const rule = "5% if either intelligence or strength is 16 or more and the other is 13 or more";

      test("returns 5 when first>=16 and second>=13", () => {
        expect(eval_(rule, { intelligence: 16, strength: 13 })).toBe(5);
      });
      test("returns 5 when first>=13 and second>=16 (swapped)", () => {
        expect(eval_(rule, { intelligence: 13, strength: 16 })).toBe(5);
      });
      test("returns 0 when first>=16 but second<13", () => {
        expect(eval_(rule, { intelligence: 16, strength: 12 })).toBe(0);
      });
      test("returns 0 when neither is >=16", () => {
        expect(eval_(rule, { intelligence: 15, strength: 13 })).toBe(0);
      });
    });

    describe("tiered rules (real class patterns)", () => {
      describe("xpBonus_16_13_Or_Both_13 pattern (Elf: int/str)", () => {
        const rule =
          "10% if intelligence is 16 or more and strength is 13 or more; 5% if both intelligence and strength are 13 or more";

        test("10% when int>=16 and str>=13", () => {
          expect(eval_(rule, { intelligence: 16, strength: 13 })).toBe(10);
        });
        test("5% when both>=13 but int<16", () => {
          expect(eval_(rule, { intelligence: 15, strength: 13 })).toBe(5);
        });
        test("0% when str<13", () => {
          expect(eval_(rule, { intelligence: 16, strength: 12 })).toBe(0);
        });
        test("0% when both<13", () => {
          expect(eval_(rule, { intelligence: 8, strength: 8 })).toBe(0);
        });
      });

      describe("xpBonus_Both13_Or_Either13 pattern (Halfling: dex/str)", () => {
        const rule =
          "10% if both dexterity and strength are 13 or more; 5% if either dexterity or strength is 13 or more";

        test("10% when both>=13", () => {
          expect(eval_(rule, { dexterity: 14, strength: 13 })).toBe(10);
        });
        test("5% when only one>=13", () => {
          expect(eval_(rule, { dexterity: 13, strength: 12 })).toBe(5);
        });
        test("0% when neither>=13", () => {
          expect(eval_(rule, { dexterity: 8, strength: 8 })).toBe(0);
        });
      });

      describe("xpBonus_Both16_Or_Either13 pattern (Paladin: str/wis)", () => {
        const rule =
          "10% if both strength and wisdom are 16 or more; 5% if either strength or wisdom is 13 or more";

        test("10% when both>=16", () => {
          expect(eval_(rule, { strength: 16, wisdom: 16 })).toBe(10);
        });
        test("5% when only one>=16 and other>=13 (10% tier not met)", () => {
          expect(eval_(rule, { strength: 16, wisdom: 13 })).toBe(5);
        });
        test("5% when only one>=13", () => {
          expect(eval_(rule, { strength: 13, wisdom: 8 })).toBe(5);
        });
        test("0% when neither>=13", () => {
          expect(eval_(rule, { strength: 12, wisdom: 12 })).toBe(0);
        });
      });

      describe("xpBonus_Any16_13_Or_Both13 pattern (Half-Elf: int/str)", () => {
        const rule =
          "10% if either intelligence or strength is 16 or more and the other is 13 or more; 5% if both intelligence and strength are 13 or more";

        test("10% when int>=16 and str>=13", () => {
          expect(eval_(rule, { intelligence: 16, strength: 13 })).toBe(10);
        });
        test("10% when int>=13 and str>=16 (symmetric)", () => {
          expect(eval_(rule, { intelligence: 13, strength: 16 })).toBe(10);
        });
        test("5% when both>=13 but neither>=16", () => {
          expect(eval_(rule, { intelligence: 15, strength: 14 })).toBe(5);
        });
        test("0% when neither>=13", () => {
          expect(eval_(rule, { intelligence: 8, strength: 8 })).toBe(0);
        });
      });

      describe("xpBonus_Any13_16_Or_Either13 pattern (Arcane Bard: cha/dex)", () => {
        const rule =
          "10% if either charisma or dexterity is 16 or more and the other is 13 or more; 5% if either charisma or dexterity is 13 or more";

        test("10% when cha>=16 and dex>=13", () => {
          expect(eval_(rule, { charisma: 16, dexterity: 13 })).toBe(10);
        });
        test("10% when cha>=13 and dex>=16 (symmetric)", () => {
          expect(eval_(rule, { charisma: 13, dexterity: 16 })).toBe(10);
        });
        test("5% when only one>=13 and neither>=16", () => {
          expect(eval_(rule, { charisma: 13, dexterity: 8 })).toBe(5);
        });
        test("0% when neither>=13", () => {
          expect(eval_(rule, { charisma: 8, dexterity: 8 })).toBe(0);
        });
      });
    });
  });

  describe("XP Bonus Rule Format Validation", () => {
    const VALID_CLAUSE = /^\d+% if .+$/;
    const VALID_ABILITY =
      /^(strength|intelligence|wisdom|dexterity|constitution|charisma)$/;

    test("all classes with 2 prime reqs must have an xpBonusRule string", () => {
      const missing: string[] = [];
      classOptionsData.forEach((c) => {
        if (c.primeReqs.length === 2 && !c.xpBonusRule) {
          missing.push(c.name);
        }
      });
      if (missing.length > 0) console.error("Missing xpBonusRule:", missing);
      expect(missing).toEqual([]);
    });

    test("all classes with 0 or 1 prime reqs must NOT have an xpBonusRule", () => {
      const unexpected: string[] = [];
      classOptionsData.forEach((c) => {
        if (c.primeReqs.length !== 2 && c.xpBonusRule) {
          unexpected.push(c.name);
        }
      });
      if (unexpected.length > 0) console.error("Unexpected xpBonusRule:", unexpected);
      expect(unexpected).toEqual([]);
    });

    test("every xpBonusRule must parse without throwing", () => {
      const failures: Array<{ name: string; error: string }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        try {
          ClassOptions.parseXpBonusRule(c.xpBonusRule);
        } catch (e) {
          failures.push({ name: c.name, error: String(e) });
        }
      });
      if (failures.length > 0) console.error("Parse failures:", failures);
      expect(failures).toEqual([]);
    });

    test("every xpBonusRule must have exactly 2 clauses: 10% first, 5% second", () => {
      const invalid: Array<{ name: string; reason: string }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        const clauses = ClassOptions.parseXpBonusRule(c.xpBonusRule);
        if (clauses.length !== 2) {
          invalid.push({ name: c.name, reason: `Expected 2 clauses, got ${clauses.length}` });
        } else {
          if (clauses[0].percent !== 10) invalid.push({ name: c.name, reason: `First clause must be 10%, got ${clauses[0].percent}%` });
          if (clauses[1].percent !== 5)  invalid.push({ name: c.name, reason: `Second clause must be 5%, got ${clauses[1].percent}%` });
        }
      });
      if (invalid.length > 0) console.error("Malformed tiered rules:", invalid);
      expect(invalid).toEqual([]);
    });

    test("every clause in every xpBonusRule must match the N% if ... pattern", () => {
      const invalid: Array<{ name: string; clause: string }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        c.xpBonusRule.split("; ").forEach((clause) => {
          if (!VALID_CLAUSE.test(clause)) {
            invalid.push({ name: c.name, clause });
          }
        });
      });
      if (invalid.length > 0) console.error("Invalid clauses:", invalid);
      expect(invalid).toEqual([]);
    });

    test("all ability names referenced in every xpBonusRule must be valid", () => {
      const invalid: Array<{ name: string; ability: string }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        const clauses = ClassOptions.parseXpBonusRule(c.xpBonusRule);
        clauses.forEach(({ condition }) => {
          const abilities: string[] = [condition.ability1, condition.ability2];
          abilities.forEach((ab) => {
            if (!VALID_ABILITY.test(ab)) {
              invalid.push({ name: c.name, ability: ab });
            }
          });
        });
      });
      if (invalid.length > 0) console.error("Invalid abilities:", invalid);
      expect(invalid).toEqual([]);
    });

    test("all ability names in xpBonusRule must be actual prime reqs of that class", () => {
      const mismatched: Array<{ name: string; ability: string; primeReqs: string[] }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        const clauses = ClassOptions.parseXpBonusRule(c.xpBonusRule);
        clauses.forEach(({ condition }) => {
          [condition.ability1, condition.ability2].forEach((ab) => {
            if (!c.primeReqs.includes(ab)) {
              mismatched.push({ name: c.name, ability: ab, primeReqs: c.primeReqs });
            }
          });
        });
      });
      if (mismatched.length > 0) console.error("Mismatched abilities:", mismatched);
      expect(mismatched).toEqual([]);
    });

    test("every xpBonusRule must yield 10% when all prime reqs are 16", () => {
      const failures: Array<{ name: string; result: number }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        const scores: Record<string, number> = {};
        c.primeReqs.forEach((pr) => (scores[pr] = 16));
        const result = c.xpModifierPercentage(scores as AbilityScores);
        if (result !== "10%") {
          failures.push({ name: c.name, result: parseInt(result) });
        }
      });
      if (failures.length > 0) console.error("Not 10% at 16/16:", failures);
      expect(failures).toEqual([]);
    });

    test("every xpBonusRule must yield 0% when all prime reqs are 8", () => {
      const failures: Array<{ name: string; result: string }> = [];
      classOptionsData.forEach((c) => {
        if (!c.xpBonusRule) return;
        const scores: Record<string, number> = {};
        c.primeReqs.forEach((pr) => (scores[pr] = 8));
        const result = c.xpModifierPercentage(scores as AbilityScores);
        if (result !== "0%") {
          failures.push({ name: c.name, result });
        }
      });
      if (failures.length > 0) console.error("Not 0% at 8/8:", failures);
      expect(failures).toEqual([]);
    });
  });
});

// ── Thief Skill Table ─────────────────────────────────────────────────────────

describe("thiefSkillTable", () => {
  test("has exactly 14 rows (one per level)", () => {
    expect(thiefSkillTable).toHaveLength(14);
  });

  test("rows are indexed by level (thiefSkillTable[0].level === 1)", () => {
    expect(thiefSkillTable[0].level).toBe(1);
    expect(thiefSkillTable[13].level).toBe(14);
  });

  test("level 1 row matches SRD values", () => {
    const row = thiefSkillTable[0];
    expect(row.CS).toBe(87);
    expect(row.TR).toBe(10);
    expect(row.HN).toBe("1-2");
    expect(row.HS).toBe(10);
    expect(row.MS).toBe(20);
    expect(row.OL).toBe(15);
    expect(row.PP).toBe(20);
  });

  test("level 7 row matches SRD values", () => {
    const row = thiefSkillTable[6];
    expect(row.CS).toBe(93);
    expect(row.TR).toBe(50);
    expect(row.HN).toBe("1-4");
    expect(row.HS).toBe(45);
    expect(row.MS).toBe(55);
    expect(row.OL).toBe(55);
    expect(row.PP).toBe(55);
  });

  test("level 11 row has HN '1-5'", () => {
    expect(thiefSkillTable[10].HN).toBe("1-5");
  });

  test("level 14 row matches SRD values", () => {
    const row = thiefSkillTable[13];
    expect(row.CS).toBe(99);
    expect(row.TR).toBe(99);
    expect(row.HN).toBe("1-5");
    expect(row.HS).toBe(99);
    expect(row.MS).toBe(99);
    expect(row.OL).toBe(99);
    expect(row.PP).toBe(125);
  });
});

describe("ClassOptions.getThiefSkillAtLevel", () => {
  const ClassOptions = classOptionsData[0].constructor as any;

  test("CS at level 1 is 87", () => {
    expect(ClassOptions.getThiefSkillAtLevel("CS", 1)).toBe(87);
  });

  test("CS at level 14 is 99", () => {
    expect(ClassOptions.getThiefSkillAtLevel("CS", 14)).toBe(99);
  });

  test("TR at level 6 is 40", () => {
    expect(ClassOptions.getThiefSkillAtLevel("TR", 6)).toBe(40);
  });

  test("HN at level 1 is '1-2'", () => {
    expect(ClassOptions.getThiefSkillAtLevel("HN", 1)).toBe("1-2");
  });

  test("HN at level 4 is '1-3'", () => {
    expect(ClassOptions.getThiefSkillAtLevel("HN", 4)).toBe("1-3");
  });

  test("HN at level 7 is '1-4'", () => {
    expect(ClassOptions.getThiefSkillAtLevel("HN", 7)).toBe("1-4");
  });

  test("HN at level 11 is '1-5'", () => {
    expect(ClassOptions.getThiefSkillAtLevel("HN", 11)).toBe("1-5");
  });

  test("PP at level 14 is 125", () => {
    expect(ClassOptions.getThiefSkillAtLevel("PP", 14)).toBe(125);
  });

  test("clamps to level 1 for level 0", () => {
    expect(ClassOptions.getThiefSkillAtLevel("CS", 0)).toBe(87);
  });

  test("clamps to level 14 for level 99", () => {
    expect(ClassOptions.getThiefSkillAtLevel("PP", 99)).toBe(125);
  });
});

describe("Thief abilities: level-based descriptions via getAbilitiesForLevel", () => {
  const thief = classOptionsData.find((c) => c.name === "Thief")!;

  function abilityAt(name: string, level: number) {
    return getAbilitiesForLevel(thief.abilities, level).find((a) => a.name === name);
  }

  describe("Climb Sheer Surfaces", () => {
    test("contains '87%' at level 1", () => {
      expect(abilityAt("Climb Sheer Surfaces", 1)?.description).toContain("87%");
    });
    test("contains '93%' at level 7", () => {
      expect(abilityAt("Climb Sheer Surfaces", 7)?.description).toContain("93%");
    });
    test("contains '99%' at level 14", () => {
      expect(abilityAt("Climb Sheer Surfaces", 14)?.description).toContain("99%");
    });
  });

  describe("Find/Remove Treasure Traps", () => {
    test("contains '10%' at level 1", () => {
      expect(abilityAt("Find/Remove Treasure Traps", 1)?.description).toContain("10%");
    });
    test("contains '50%' at level 7", () => {
      expect(abilityAt("Find/Remove Treasure Traps", 7)?.description).toContain("50%");
    });
    test("contains '99%' at level 14", () => {
      expect(abilityAt("Find/Remove Treasure Traps", 14)?.description).toContain("99%");
    });
  });

  describe("Hear Noise", () => {
    test("contains '1-2' at level 1", () => {
      expect(abilityAt("Hear Noise", 1)?.description).toContain("1-2");
    });
    test("contains '1-4' at level 7", () => {
      expect(abilityAt("Hear Noise", 7)?.description).toContain("1-4");
    });
    test("contains '1-5' at level 11", () => {
      expect(abilityAt("Hear Noise", 11)?.description).toContain("1-5");
    });
  });

  describe("Hide in Shadows", () => {
    test("contains '10%' at level 1", () => {
      expect(abilityAt("Hide in Shadows", 1)?.description).toContain("10%");
    });
    test("contains '45%' at level 7", () => {
      expect(abilityAt("Hide in Shadows", 7)?.description).toContain("45%");
    });
    test("contains '99%' at level 14", () => {
      expect(abilityAt("Hide in Shadows", 14)?.description).toContain("99%");
    });
  });

  describe("Move Silently", () => {
    test("contains '20%' at level 1", () => {
      expect(abilityAt("Move Silently", 1)?.description).toContain("20%");
    });
    test("contains '55%' at level 7", () => {
      expect(abilityAt("Move Silently", 7)?.description).toContain("55%");
    });
    test("contains '99%' at level 14", () => {
      expect(abilityAt("Move Silently", 14)?.description).toContain("99%");
    });
  });

  describe("Open Locks", () => {
    test("contains '15%' at level 1", () => {
      expect(abilityAt("Open Locks", 1)?.description).toContain("15%");
    });
    test("contains '55%' at level 7", () => {
      expect(abilityAt("Open Locks", 7)?.description).toContain("55%");
    });
    test("contains '99%' at level 14", () => {
      expect(abilityAt("Open Locks", 14)?.description).toContain("99%");
    });
  });

  describe("Pick Pockets", () => {
    test("contains '20%' at level 1", () => {
      expect(abilityAt("Pick Pockets", 1)?.description).toContain("20%");
    });
    test("contains '55%' at level 7", () => {
      expect(abilityAt("Pick Pockets", 7)?.description).toContain("55%");
    });
    test("contains '125%' at level 14", () => {
      expect(abilityAt("Pick Pockets", 14)?.description).toContain("125%");
    });
  });
});

describe("parseArmourString (TDD)", () => {
  test("parses 'leather, chainmail, plate mail, shields' in correct order", () => {
    expect(ClassOptions.parseArmourString("leather, chainmail, plate mail, shields")).toEqual([
      "leather", "chainmail", "plate_mail", "shield"
    ]);
  });
  test("parses 'leather, plate mail' (missing chainmail, shields)", () => {
    expect(ClassOptions.parseArmourString("leather, plate mail")).toEqual([
      "leather", "plate_mail"
    ]);
  });
  test("parses 'any' as all armour types", () => {
    expect(ClassOptions.parseArmourString("any")).toEqual([
      "leather", "chainmail", "plate_mail", "shield"
    ]);
  });
  test("parses 'none' as empty array", () => {
    expect(ClassOptions.parseArmourString("none")).toEqual([]);
  });
  test("throws on whitespace at start", () => {
    expect(() => ClassOptions.parseArmourString(" leather, chainmail")).toThrow();
  });
  test("throws on whitespace at end", () => {
    expect(() => ClassOptions.parseArmourString("leather, chainmail ")).toThrow();
  });
  test("throws on invalid token", () => {
    expect(() => ClassOptions.parseArmourString("leather, foo")).toThrow();
  });
  test("parses 'leather, shields' in correct order", () => {
    expect(ClassOptions.parseArmourString("leather, shields")).toEqual([
      "leather", "shield"
    ]);
  });
  test("parses 'wooden shields' as 'shield'", () => {
    expect(ClassOptions.parseArmourString("wooden shields")).toEqual([
      "shield"
    ]);
  });
  test("throws if order is wrong (shields before leather)", () => {
    expect(() => ClassOptions.parseArmourString("shields, leather")).toThrow();
  });
});

describe("parseArmourString (union of splits)", () => {
  test("returns union of all splits: 'leather / chainmail'", () => {
    expect(ClassOptions.parseArmourString("leather / chainmail")).toEqual([
      "leather", "chainmail"
    ]);
  });
  test("returns union, no duplicates: 'leather, shields / leather'", () => {
    expect(ClassOptions.parseArmourString("leather, shields / leather")).toEqual([
      "leather", "shield"
    ]);
  });
  test("returns union for three splits: 'leather / chainmail / plate mail'", () => {
    expect(ClassOptions.parseArmourString("leather / chainmail / plate mail")).toEqual([
      "leather", "chainmail", "plate_mail"
    ]);
  });
  test("throws if any split is invalid", () => {
    expect(() => ClassOptions.parseArmourString("leather / foo")).toThrow();
    expect(() => ClassOptions.parseArmourString("foo / leather")).toThrow();
    expect(() => ClassOptions.parseArmourString("leather / chainmail, foo")).toThrow();
  });
  test("returns union for 'any / none' (should be all armour)", () => {
    expect(ClassOptions.parseArmourString("any / none")).toEqual([
      "leather", "chainmail", "plate_mail", "shield"
    ]);
  });
  test("returns empty for 'none / none'", () => {
    expect(ClassOptions.parseArmourString("none / none")).toEqual([]);
  });
});
