import { describe, expect, it } from 'vitest';
import { toggleAllowed, toggleSpellAllowed } from './campaignFilterUtils';

describe('toggleAllowed', () => {
  const all = ['a', 'b', 'c'];

  it('when current is null (all) and item is unchecked, starts filtering without that item', () => {
    expect(toggleAllowed(null, all, 'b', false)).toEqual(['a', 'c']);
  });

  it('when current is null and item is checked, returns null (still all allowed)', () => {
    expect(toggleAllowed(null, all, 'b', true)).toBeNull();
  });

  it('when current is subset and the checked item completes the set, returns null', () => {
    expect(toggleAllowed(['a', 'c'], all, 'b', true)).toBeNull();
  });

  it('when current is full-array and item is unchecked, returns subset', () => {
    expect(toggleAllowed(['a', 'b', 'c'], all, 'b', false)).toEqual(['a', 'c']);
  });

  it('when current is subset and item is unchecked, removes it', () => {
    expect(toggleAllowed(['a', 'b'], all, 'b', false)).toEqual(['a']);
  });

  it('returns empty array when the last item is unchecked', () => {
    expect(toggleAllowed(['a'], all, 'a', false)).toEqual([]);
  });

  it('preserves allIds order in the returned array regardless of input order', () => {
    // current ['c','a'] is out of order; result should follow allIds order
    expect(toggleAllowed(['c', 'a'], all, 'a', false)).toEqual(['c']);
  });

  it('has no effect when checked item was already absent from a null current (returns null)', () => {
    // 'd' is not in allIds but is still a no-op
    expect(toggleAllowed(null, all, 'd', true)).toBeNull();
  });
});

describe('toggleSpellAllowed', () => {
  const allIds = ['charm-person', 'sleep', 'magic-missile'];
  const listId = 'magic-user';

  it('starts filtering when a spell is unchecked while the list is "all" (absent key)', () => {
    const result = toggleSpellAllowed({}, allIds, listId, 'sleep', false);
    expect(result[listId]).toEqual(['charm-person', 'magic-missile']);
  });

  it('starts filtering when a spell is unchecked while the list is "all" (null value)', () => {
    const result = toggleSpellAllowed({ [listId]: null }, allIds, listId, 'sleep', false);
    expect(result[listId]).toEqual(['charm-person', 'magic-missile']);
  });

  it('returns empty array entry when last allowed spell is unchecked', () => {
    const current = { [listId]: ['sleep'] };
    const result = toggleSpellAllowed(current, allIds, listId, 'sleep', false);
    expect(result[listId]).toEqual([]);
  });

  it('reverts to null when re-checking a spell brings the count back to the total', () => {
    const current = { [listId]: ['charm-person', 'magic-missile'] };
    const result = toggleSpellAllowed(current, allIds, listId, 'sleep', true);
    expect(result[listId]).toBeNull();
  });

  it('does not affect other spell lists', () => {
    const current: Record<string, string[] | null> = { cleric: ['bless'] };
    const result = toggleSpellAllowed(current, allIds, listId, 'sleep', false);
    expect(result.cleric).toEqual(['bless']);
  });

  it('preserves the full map shape', () => {
    const current = { cleric: null, druid: ['entangle'] };
    const result = toggleSpellAllowed(current, allIds, listId, 'sleep', false);
    expect(result.cleric).toBeNull();
    expect(result.druid).toEqual(['entangle']);
    expect(result[listId]).toEqual(['charm-person', 'magic-missile']);
  });
});
