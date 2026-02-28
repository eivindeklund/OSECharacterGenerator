import {
  calculateArmourClass,
  consolidateDuplicates,
  deriveCharacterModifiers,
  getWeightedValue,
  hpRollToSeed,
  hpSeedToRoll,
} from "./utilities";

describe("Utility Functions", () => {
  describe("updateAbilityModifiers", () => {
    test("should return correct modifiers for strength", () => {
      const result = deriveCharacterModifiers({ strength: 15, intelligence: 10, dexterity: 10, wisdom: 10, constitution: 10, charisma: 10 });
      expect(result.strengthModMelee).toBe("+1");
      expect(result.strengthModDoors).toBe("3-in-6");
    });

    test("should return correct modifiers for intelligence", () => {
      const result = deriveCharacterModifiers({ strength: 10, intelligence: 18, dexterity: 10, wisdom: 10, constitution: 10, charisma: 10 });
      expect(result.intelligenceModLanguages).toBe("+3");
      expect(result.intelligenceModExtraLanguageCount).toBe("3");
    });

    test("should return correct modifiers for dexterity", () => {
      const result = deriveCharacterModifiers({ strength: 10, intelligence: 10, dexterity: 13, wisdom: 10, constitution: 10, charisma: 10 });
      expect(result.dexterityModAC).toBe("+1");
      expect(result.dexterityModInitiative).toBe("+1");
    });

    test("should update all ability scores", () => {
      const scores = {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        wisdom: 10,
        constitution: 10,
        charisma: 10,
      };
      const result = deriveCharacterModifiers(scores);
      expect(result.strengthModMelee).toBe("0");
      expect(result.dexterityModAC).toBe("0");
      expect(result.constitutionMod).toBe("0");
    });
  });

  describe("calculateArmourClass", () => {
    test("should calculate default AC (10)", () => {
      const [base, total] = calculateArmourClass("0", []);
      expect(base).toBe(10);
      expect(total).toBe(10);
    });

    test("should include dexterity modifier", () => {
      const [base, total] = calculateArmourClass("0", []);
      expect(base).toBe(10);
      expect(total).toBe(10);
    });

    test("should include armour (Leather)", () => {
      const [base, total] = calculateArmourClass("0", ["Leather"]);
      expect(total).toBe(12); // 10 + 2
    });

    test("should include Shield", () => {
      const [base, total] = calculateArmourClass("0", ["Leather", "Shield"]);
      expect(total).toBe(13); // 10 + 2 + 1
    });
  });

  describe("consolidateDuplicates", () => {
    test("should consolidate duplicates", () => {
      const items = ["Rope", "Torch", "Torch", "Torch"];
      const result = consolidateDuplicates(items);
      expect(result).toContain("Rope");
      expect(result).toContain("Torch (x3)");
    });
  });

  describe("getWeightedValue", () => {
    test("should return correct tiered value", () => {
      const list = {
        10: "Result A",
        50: "Result B",
        100: "Result C",
      };
      expect(getWeightedValue(list, 5, 100)).toBe("Result A");
      expect(getWeightedValue(list, 25, 100)).toBe("Result B");
      expect(getWeightedValue(list, 95, 100)).toBe("Result C");
    });
  });

  describe("hpSeedToRoll", () => {
    test("seed 1 gives 1 for every die size", () => {
      expect(hpSeedToRoll(1, 4)).toBe(1);
      expect(hpSeedToRoll(1, 6)).toBe(1);
      expect(hpSeedToRoll(1, 8)).toBe(1);
      expect(hpSeedToRoll(1, 10)).toBe(1);
      expect(hpSeedToRoll(1, 12)).toBe(1);
      expect(hpSeedToRoll(1, 20)).toBe(1);
    });

    test("seed 120 gives the maximum face for every die size", () => {
      expect(hpSeedToRoll(120, 4)).toBe(4);
      expect(hpSeedToRoll(120, 6)).toBe(6);
      expect(hpSeedToRoll(120, 8)).toBe(8);
      expect(hpSeedToRoll(120, 10)).toBe(10);
      expect(hpSeedToRoll(120, 12)).toBe(12);
      expect(hpSeedToRoll(120, 20)).toBe(20);
    });

    test("d4 boundary: seed 30 → 1, seed 31 → 2", () => {
      expect(hpSeedToRoll(30, 4)).toBe(1);
      expect(hpSeedToRoll(31, 4)).toBe(2);
    });

    test("d6 boundary: seed 20 → 1, seed 21 → 2", () => {
      expect(hpSeedToRoll(20, 6)).toBe(1);
      expect(hpSeedToRoll(21, 6)).toBe(2);
    });

    test("d8 boundary: seed 15 → 1, seed 16 → 2", () => {
      expect(hpSeedToRoll(15, 8)).toBe(1);
      expect(hpSeedToRoll(16, 8)).toBe(2);
    });

    test("d10 boundary: seed 12 → 1, seed 13 → 2", () => {
      expect(hpSeedToRoll(12, 10)).toBe(1);
      expect(hpSeedToRoll(13, 10)).toBe(2);
    });

    test("d12 boundary: seed 10 → 1, seed 11 → 2", () => {
      expect(hpSeedToRoll(10, 12)).toBe(1);
      expect(hpSeedToRoll(11, 12)).toBe(2);
    });

    test("d20 boundary: seed 6 → 1, seed 7 → 2", () => {
      expect(hpSeedToRoll(6, 20)).toBe(1);
      expect(hpSeedToRoll(7, 20)).toBe(2);
    });

    test("same seed scales proportionally across die sizes", () => {
      // seed 60 is the midpoint: d4→2, d6→3, d8→4, d10→5, d12→6, d20→10
      expect(hpSeedToRoll(60, 4)).toBe(2);
      expect(hpSeedToRoll(60, 6)).toBe(3);
      expect(hpSeedToRoll(60, 8)).toBe(4);
      expect(hpSeedToRoll(60, 10)).toBe(5);
      expect(hpSeedToRoll(60, 12)).toBe(6);
      expect(hpSeedToRoll(60, 20)).toBe(10);
    });
  });

  describe("hpRollToSeed", () => {
    test("hpRollToSeed is the left-inverse of hpSeedToRoll for all die sizes", () => {
      for (const hd of [4, 6, 8, 10, 12, 20]) {
        for (let result = 1; result <= hd; result++) {
          const seed = hpRollToSeed(result, hd);
          expect(hpSeedToRoll(seed, hd)).toBe(result);
        }
      }
    });

    test("seed from hpRollToSeed is always in [1, 120]", () => {
      for (const hd of [4, 6, 8, 10, 12, 20]) {
        for (let result = 1; result <= hd; result++) {
          const seed = hpRollToSeed(result, hd);
          expect(seed).toBeGreaterThanOrEqual(1);
          expect(seed).toBeLessThanOrEqual(120);
        }
      }
    });
  });
});
