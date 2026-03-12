import { createContext, useContext } from "react";
import type { useCharacterManager } from "../hooks/useCharacterManager";

export type CharacterContextType = ReturnType<typeof useCharacterManager>;

const CharacterContext = createContext<CharacterContextType | null>(null);

export const CharacterProvider = CharacterContext.Provider;

export function useCharacter(): CharacterContextType {
  const ctx = useContext(CharacterContext);
  if (ctx === null) {
    throw new Error("useCharacter must be used inside a CharacterProvider");
  }
  return ctx;
}
