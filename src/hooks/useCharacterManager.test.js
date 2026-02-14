import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRandomNumbers } from "../API/getRandomNumbers";
import { useCharacterManager } from "./useCharacterManager";

// Mock dependencies
vi.mock("../API/getRandomNumbers", () => ({
  getRandomNumbers: vi.fn(),
}));

vi.mock("../data/classOptionsData", () => ({
  default: [
    { name: "Fighter", primeReqs: ["strength"], hd: 8 },
    { name: "Cleric", primeReqs: ["wisdom"], hd: 6 },
  ],
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
    getRandomNumbers.mockResolvedValue([1, 2, 3, 4, 5, 6]);
  });

  it("should initialize with default state", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );

    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    expect(result.current.character.id).toBeNull();
    expect(result.current.characterRolled).toBe(false);
    expect(result.current.abilityScores.strength).toBeNull();
  });

  it("should roll character and reset state", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    act(() => {
      result.current.rollCharacter();
    });

    expect(result.current.character.id).not.toBeNull();
    expect(result.current.characterRolled).toBe(true);
    expect(result.current.screen.abilityScreen).toBe(true);
  });

  it("should roll attributes without animation when dice are disabled", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    act(() => {
      result.current.rollCharacter();
      result.current.rollAttribute("strength");
    });

    expect(result.current.abilityScores.strength).not.toBeNull();
    expect(mockDiceService.roll).not.toHaveBeenCalled();
  });

  it("should trigger dice animation when dice are enabled", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    act(() => {
      result.current.setDiceEnabled(true);
    });

    act(() => {
      result.current.rollAttribute("strength");
    });

    expect(mockDiceService.show).toHaveBeenCalled();
    expect(mockDiceService.roll).toHaveBeenCalledWith("3d6", expect.anything());
  });

  it("should update state when dice roll is complete", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

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

  it("should roll HP correctly", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

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

  it("should roll gold correctly", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    act(() => {
      result.current.rollGold();
    });

    expect(result.current.characterEquipment.gold).not.toBeNull();
    expect(result.current.characterEquipment.gold % 10).toBe(0);
  });

  it("should increase ability score and decrease point buy", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

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

  it("should decrease ability score and increase point buy", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

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

  it("should save character using storageService", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    act(() => {
      result.current.saveCharacter();
    });

    expect(mockStorageService.saveCharacter).toHaveBeenCalled();
  });

  it("should delete character using storageService", async () => {
    const { result } = renderHook(() =>
      useCharacterManager(mockDiceService, mockStorageService, mockDeviceService)
    );
    await waitFor(() => expect(result.current.loadingRandomNumbers).toBe(false));

    act(() => {
      result.current.deleteStoredCharacter("123");
    });

    expect(mockStorageService.deleteCharacter).toHaveBeenCalledWith("123");
  });
});
