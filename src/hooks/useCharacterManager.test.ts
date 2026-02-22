import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterManager } from "./useCharacterManager";

vi.mock("../data/classOptionsData", () => ({
  default: [
    { 
      name: "Fighter", 
      primeReqs: ["strength"], 
      hd: 8,
      checkAbilityScoreRequirements: () => true,
      xpBonusPercentage: () => '0%',
    },
    { 
      name: "Cleric", 
      primeReqs: ["wisdom"], 
      hd: 6,
      checkAbilityScoreRequirements: () => true,
      xpBonusPercentage: () => '0%',
    },
  ],
  emptyClassOptions: {
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
    xpBonusPercentage: () => '0%',
  },
}));

describe("useCharacterManager", () => {
  const mockDiceService = {
    show: vi.fn().mockReturnThis(),
    hide: vi.fn().mockReturnThis(),
    roll: vi.fn().mockReturnThis(),
    onRollComplete: null,
  };

  const mockStorageService = {
    loadCharacters: vi.fn().mockReturnValue([]),
    saveCharacter: vi.fn(),
    deleteCharacter: vi.fn(),
  };

  const mockDeviceService = {
    getIsMobile: vi.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    expect(result.current.character.id).toBeNull();
    expect(result.current.characterRolled).toBe(false);
    expect(result.current.abilityScores.strength).toBeNull();
  });

  it("should roll character and reset state", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
    });

    expect(result.current.character.id).not.toBeNull();
    expect(result.current.characterRolled).toBe(true);
    expect(result.current.screen.abilityScreen).toBe(true);
  });

  it("should roll attributes without animation when dice are disabled", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      result.current.rollAttribute("strength");
    });

    expect(result.current.abilityScores.strength).not.toBeNull();
    expect(mockDiceService.roll).not.toHaveBeenCalled();
  });

  it("should trigger dice animation when dice are enabled", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.setDiceEnabled(true);
    });

    act(() => {
      result.current.rollAttribute("strength");
    });

    expect(mockDiceService.show).toHaveBeenCalled();
    expect(mockDiceService.roll).toHaveBeenCalledWith("3d6", expect.anything());
  });

  it("should update state when dice roll is complete", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.setDiceEnabled(true);
    });

    act(() => {
      result.current.rollAttribute("strength");
    });

    // Simulate dice roll completion
    act(() => {
      mockDiceService.onRollComplete([{ value: 15 }]);
    });

    expect(result.current.abilityScores.strength).toBe(15);
  });

  it("should roll HP correctly", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      // Select Fighter
      const event = { target: { value: "Fighter" } };
      result.current.changeCharacterClass(event);
    });

    act(() => {
      result.current.rollHP();
    });

    expect(result.current.characterStatistics.hitPoints).not.toBeNull();
    expect(result.current.characterStatistics.hpRolls).toBe(1);
  });

  it("should roll gold correctly", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollGold();
    });

    expect(result.current.characterEquipment.gold).not.toBeNull();
    expect(result.current.characterEquipment.gold % 10).toBe(0);
  });

  it("should increase ability score and decrease point buy", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      result.current.setAbilityScores({ strength: 10, strengthOriginal: 10 });
      result.current.setPointBuy(1);
    });

    act(() => {
      result.current.scoreIncrease("strength");
    });

    expect(result.current.abilityScores.strength).toBe(11);
    expect(result.current.pointBuy).toBe(0);
  });

  it("should decrease ability score and increase point buy", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      result.current.setAbilityScores({ strength: 12, strengthOriginal: 12 });
      result.current.setPointBuy(0);
    });

    act(() => {
      result.current.scoreDecrease("strength");
    });

    expect(result.current.abilityScores.strength).toBe(10);
    expect(result.current.pointBuy).toBe(1);
  });

  it("should save character using storageService", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.saveCharacter();
    });

    expect(mockStorageService.saveCharacter).toHaveBeenCalled();
  });

  it("should delete character using storageService", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.deleteStoredCharacter("123");
    });

    expect(mockStorageService.deleteCharacter).toHaveBeenCalledWith("123");
  });

  it("should import character correctly", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    const mockData = {
      character: { name: "Test Import", id: "000" },
      abilityScores: { strength: 18 },
      characterModifiers: { strengthModMelee: "+3" },
      characterStatistics: { hitPoints: 10 },
      characterClass: { name: "Fighter" },
      characterEquipment: { gold: 100 },
    };

    act(() => {
      result.current.importCharacter(mockData);
    });

    expect(result.current.character.name).toBe("Test Import");
    expect(result.current.abilityScores.strength).toBe(18);
    expect(result.current.characterModifiers.strengthModMelee).toBe("+3");
    expect(result.current.characterStatistics.hitPoints).toBe(10);
    expect(result.current.characterClass.name).toBe("Fighter");
    expect(result.current.characterEquipment.gold).toBe(100);
    expect(result.current.characterRolled).toBe(true);
    expect(result.current.pointBuy).toBe(0);
    expect(result.current.screen.characterSheetScreen).toBe(true);
  });
});
