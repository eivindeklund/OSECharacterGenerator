import { abilityScoreNames } from "../constants/constants";
import classOptionsData from "./classOptionsData";

// Get the ClassOptions class from the first item in the array
const ClassOptions = classOptionsData[0].constructor;

describe("ClassOptions", () => {
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
});
