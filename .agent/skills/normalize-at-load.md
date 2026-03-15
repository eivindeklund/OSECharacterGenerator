---
name: normalize-at-load
description: >
  Guidance for handling save-format migrations and backward compatibility.
  Use when adding fields whose saved format may differ from the current canonical
  in-memory format, or when reading code that deals with old saves.
---

# Normalize-at-load pattern

## Core rule

**All save-format migrations belong in `src/utilities/normalizeCharacterData.ts` and nowhere else.**

Character data re-enters the application from exactly three external sources:

| Source | Entry point |
|---|---|
| `localStorage` character list | `StorageService.loadCharacters()` |
| `localStorage` partial character | `StorageService.loadPartialCharacter()` |
| URL share param (`?data=`) | `ShareService.decompressCharacter()` |

Each of these three functions calls `normalizeStoredCharacter` before returning data. All code downstream of these call sites (hooks, components, PDF export) can assume the data is already in the current canonical format and **must not** contain its own compatibility shims.

## What goes in the normalization function

`normalizeCharacterStatistics` (and the wrapping `normalizeStoredCharacter`) applies every migration needed to bring an old-format record up to the current `CharacterStatistics` / `StoredCharacterData` types.

Current migrations (as of this writing):
- `characterStatistics.spell` (legacy singular string) → prepended into `spells[]` when `spells` is empty or absent.
- `characterStatistics.level` → defaulted to `1` when missing.

## How to add a new field migration

1. **Identify the field**: decide what the canonical runtime format is (e.g. `foo: FooType`) and what old saves may contain (e.g. missing, or an old shape).

2. **Add to `normalizeCharacterStatistics`** (or `normalizeStoredCharacter` for top-level fields):

   ```typescript
   // existing destructure
   const { spell, ...rest } = raw;

   // add your field
   const foo: FooType = rest.foo ?? defaultFooValue;

   return {
     ...rest,
     level: rest.level ?? 1,
     spells,
     foo,  // ← new field
   };
   ```

3. **Update `types.ts`**: the field should be required in `CharacterStatistics` (not optional), since normalization guarantees it is always present at runtime. Remove any `@deprecated` comment from the old field once the type is updated.

4. **Add a test** in `src/utilities/normalizeCharacterData.test.ts` covering:
   - Old save (field absent) → correct default applied.
   - Old save (field present in old format) → converted to new format.
   - Already-normalized save → unchanged (idempotency).

5. **Delete the old field** from `CharacterStatistics` in `types.ts`. Fix any TypeScript errors that result.

6. **Do NOT** add `?? default` or ternary fallbacks in hooks, components, or business logic — those belong only in the normalization layer.

## What NOT to do

```typescript
// ❌ WRONG — compatibility shim in a hook
const levelUp = (hp: number) => {
  setStats((prev) => ({
    ...prev,
    level: (prev.level ?? 1) + 1,   // ← should not be here
  }));
};

// ❌ WRONG — compatibility shim in a component
const spellText = stats.spells.length > 0
  ? stats.spells.join(', ')
  : (stats.spell ?? '');  // ← deprecated field, should not be here

// ✅ CORRECT — shim only in normalizeCharacterStatistics
const { spell, ...rest } = raw;
const spells = (rest.spells && rest.spells.length > 0) ? rest.spells : (spell ? [spell] : []);
return { ...rest, spells, level: rest.level ?? 1 };
```

## Testing checklist

After adding a migration:

- [ ] All three service-layer entry points produce normalized output (verified by unit tests on `normalizeCharacterData`).
- [ ] The deprecated raw field is gone from `CharacterStatistics` in `types.ts`.
- [ ] `npm run check-types` exits 0.
- [ ] No `??`, `|| fallback`, or ternary fallbacks referencing the old field remain outside `normalizeCharacterData.ts`.
- [ ] `npm run test` exits 0.
