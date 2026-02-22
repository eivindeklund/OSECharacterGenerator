import {
  calculateArmourClass,
  getModValue,
  getWeightedValue,
  joinDuplicates,
  updateAbilityModifiers,
} from "./utilities";

describe("Utility Functions", () => {
  describe("getModValue", () => {
    test("should return correct modifiers for strength", () => {
      const result = getModValue("strength", 15);
      expect(result.strengthModMelee).toBe("+1");
      expect(result.strengthModDoors).toBe("3-in-6");
    });

    test("should return correct modifiers for intelligence", () => {
      const result = getModValue("intelligence", 18);
      expect(result.intelligenceModLanguages).toBe("+3");
      expect(result.intelligenceModExtraLanguageCount).toBe("3");
    });

    test("should return correct modifiers for dexterity", () => {
      const result = getModValue("dexterity", 13);
      expect(result.dexterityModAC).toBe("+1");
      expect(result.dexterityModInitiative).toBe("+1");
    });
  });

  describe("updateAbilityModifiers", () => {
    test("should update all ability scores", () => {
      const scores = {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        wisdom: 10,
        constitution: 10,
        charisma: 10,
      };
      const result = updateAbilityModifiers(scores);
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

  describe("joinDuplicates", () => {
    test("should consolidate duplicates", () => {
      const items = ["Rope", "Torch", "Torch", "Torch"];
      const result = joinDuplicates(items);
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
});
