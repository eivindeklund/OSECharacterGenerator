import type { ClassAbility } from '../types';

/**
 * Returns the abilities a character of the given level should see in the UI,
 * filtering out abilities that are level-gated or explicitly hidden from the list.
 */
export function getAbilitiesForLevel(abilities: ClassAbility[], level: number): ClassAbility[] {
  return abilities
    .filter((a) => (a.minLevel === undefined || a.minLevel <= level) && a.shownInList !== false)
    .map((a) => {
      if (a.getDescription) {
        return { ...a, description: a.getDescription(level) };
      }
      return a;
    });
}
