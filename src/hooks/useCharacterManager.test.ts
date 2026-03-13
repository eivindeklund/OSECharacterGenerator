import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StoredCharacterData } from "../types";
import { hpSeedToRoll } from "../utilities/utilities";
import { useCharacterManager } from "./useCharacterManager";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("useCharacterManager", () => {
  const mockDiceService = {
    show: vi.fn().mockReturnThis(),
    hide: vi.fn().mockReturnThis(),
    roll: vi.fn().mockReturnThis(),
    onRollComplete: null,
  };

  // Partial mock; deliberately omits saveCharacters which is not under test
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockStorageService = {
    loadCharacters: vi.fn().mockReturnValue([]),
    saveCharacter: vi.fn(),
    deleteCharacter: vi.fn(),
    loadPartialCharacter: vi.fn().mockReturnValue(null),
    savePartialCharacter: vi.fn(),
    clearPartialCharacter: vi.fn(),
  } as any;

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
    expect(mockNavigate).toHaveBeenCalledWith('/ability');
  });

  it("should roll attributes without animation when dice are disabled", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      // @ts-ignore — test intentionally calls with one arg (attribute name only)
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
      // @ts-ignore — test intentionally calls with one arg (attribute name only)
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
      // @ts-ignore — test intentionally calls with one arg (attribute name only)
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

  it("should store hpSeed (1–120) when HP is rolled", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      const event = { target: { value: "Fighter" } };
      result.current.changeCharacterClass(event);
    });

    act(() => {
      result.current.rollHP();
    });

    const seed = result.current.characterStatistics.hpSeed;
    expect(seed).not.toBeNull();
    expect(seed).toBeGreaterThanOrEqual(1);
    expect(seed).toBeLessThanOrEqual(120);
  });

  it("should rescale hpResult and hitPoints to new class hit die when class changes", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    // Roll as Fighter (hd: 8)
    act(() => {
      result.current.rollCharacter();
      const event = { target: { value: "Fighter" } };
      result.current.changeCharacterClass(event);
    });

    act(() => {
      result.current.rollHP();
    });

    const seed = result.current.characterStatistics.hpSeed as number;
    const expectedClericHpResult = hpSeedToRoll(seed, 6); // Cleric hd: 6
    const expectedClericHP = Math.max(1, expectedClericHpResult);

    // Change to Cleric (hd: 6)
    act(() => {
      const event = { target: { value: "Cleric" } };
      result.current.changeCharacterClass(event);
    });

    expect(result.current.characterStatistics.hpResult).toBe(expectedClericHpResult);
    expect(result.current.characterStatistics.hitPoints).toBe(expectedClericHP);
  });

  it("should not rescale HP when class changes before HP is rolled", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    act(() => {
      result.current.rollCharacter();
      const event = { target: { value: "Fighter" } };
      result.current.changeCharacterClass(event);
    });

    // No rollHP() call — hpSeed is null

    act(() => {
      const event = { target: { value: "Cleric" } };
      result.current.changeCharacterClass(event);
    });

    expect(result.current.characterStatistics.hitPoints).toBeNull();
    expect(result.current.characterStatistics.hpSeed).toBeNull();
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
      // @ts-ignore — partial ability scores are valid for this test
      result.current.setAbilityScores({ strength: 10 });
      // @ts-ignore — partial ability scores are valid for this test
      result.current.setOriginalAbilityScores({ strength: 10 });
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
      // @ts-ignore — partial ability scores are valid for this test
      result.current.setAbilityScores({ strength: 12 });
      // @ts-ignore — partial ability scores are valid for this test
      result.current.setOriginalAbilityScores({ strength: 12 });
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
      result.current.importCharacter(mockData as unknown as StoredCharacterData);
    });

    expect(result.current.character.name).toBe("Test Import");
    expect(result.current.abilityScores.strength).toBe(18);
    expect(result.current.characterModifiers.strengthModMelee).toBe("+3");
    expect(result.current.characterStatistics.hitPoints).toBe(10);
    expect(result.current.characterClass.name).toBe("Fighter");
    expect(result.current.characterEquipment.gold).toBe(100);
    expect(result.current.characterRolled).toBe(true);
    expect(result.current.pointBuy).toBe(0);
    expect(mockNavigate).toHaveBeenCalledWith('/sheet');
  });

  it("should expose a loadCharacter function", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    expect(typeof result.current.loadCharacter).toBe("function");
  });

  it("should resolve characterClass from classOptionsData when loading a stored character", () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    const storedCharacter = {
      character: { name: "Conan", id: "abc" },
      abilityScores: { strength: 16, intelligence: 10, wisdom: 9, dexterity: 12, constitution: 14, charisma: 8 },
      characterModifiers: { xpModifierPercentage: "5%", strengthModMelee: "+2" },
      characterStatistics: { hitPoints: 8, hpRolls: 1, hpResult: 8, armourClass: 9, spell: null, hasSpells: false, unarmouredAC: null },
      characterClass: { name: "Fighter" }, // plain object — no xpModifierPercentage method
      characterEquipment: { armour: [], weapons: [], adventuringGear: [], gold: 80 },
    };

    act(() => {
      result.current.loadCharacter(storedCharacter as unknown as StoredCharacterData);
    });

    expect(result.current.character.name).toBe("Conan");
    expect(result.current.characterClass.name).toBe("Fighter");
    expect(typeof result.current.characterClass.xpModifierPercentage).toBe("function");
    expect(result.current.characterRolled).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/sheet');
  });
});
