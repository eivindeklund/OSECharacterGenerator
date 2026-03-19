import type { CampaignAllowedSpells } from '../types';

/**
 * Toggle one item in an "allowed" list.
 * null = all allowed; string[] = only these IDs allowed.
 * allIds must be in stable display order; the returned array preserves that order.
 */
export function toggleAllowed(
  current: string[] | null,
  allIds: string[],
  toggleId: string,
  checked: boolean,
): string[] | null {
  const currentSet = current === null ? new Set(allIds) : new Set(current);
  if (checked) {
    currentSet.add(toggleId);
  } else {
    currentSet.delete(toggleId);
  }
  // Rebuild in allIds order so the array is predictable
  const newArray = allIds.filter((id) => currentSet.has(id));
  return newArray.length === allIds.length ? null : newArray;
}

/**
 * Toggle one spell in the allowedSpellIds map.
 * allSpellIds — all IDs in the list (in stable order).
 */
export function toggleSpellAllowed(
  currentAllowed: CampaignAllowedSpells,
  allSpellIds: string[],
  listId: string,
  spellId: string,
  checked: boolean,
): CampaignAllowedSpells {
  const currentForList = currentAllowed[listId] ?? null;
  const newForList = toggleAllowed(currentForList, allSpellIds, spellId, checked);
  return { ...currentAllowed, [listId]: newForList };
}
