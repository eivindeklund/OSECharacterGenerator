import React from "react";
import type { CharacterStatistics, ClassOptionsData, SpellDefinition } from "../../types";
import { useCampaign } from "../../contexts/CampaignContext";
import { chooseRandomItem } from "../../utilities/utilities";

interface SpellSelectionProps {
  characterClass: ClassOptionsData;
  characterStatistics: CharacterStatistics;
  setCharacterStatistics: React.Dispatch<React.SetStateAction<CharacterStatistics>>;
}

export default function SpellSelection({
  characterClass,
  characterStatistics,
  setCharacterStatistics,
}: SpellSelectionProps) {
  const { getSpellListsForClass, getClassSpellSlots } = useCampaign();

  const hasSpells = !!(
    characterClass.arcaneSpells ||
    characterClass.divineSpells ||
    characterClass.illusionistSpells ||
    characterClass.druidSpells ||
    characterClass.necromancerSpells ||
    characterClass.runesmithSpells
  );

  // Number of 1st-level spell slots the class gets at character level 1.
  const slotsAtLv1 = getClassSpellSlots(characterClass, 1);
  const spellCount = Math.max(1, slotsAtLv1[0] ?? 1);

  const getSpellList = (): SpellDefinition[] => {
    const byLevel = getSpellListsForClass(characterClass);
    if (byLevel.length === 0) return [];
    if (byLevel.length > 1) {
      const slots = getClassSpellSlots(characterClass, characterStatistics.level);
      const filtered = slots.flatMap((count, tier) =>
        count > 0 ? [...(byLevel[tier] ?? [])] : []
      );
      if (filtered.length > 0) return filtered;
    }
    return byLevel.flat();
  };

  const currentSpells: string[] = Array.from(
    { length: spellCount },
    (_, i) => characterStatistics.spells[i] ?? "",
  );

  const updateSpells = (next: string[]) => {
    setCharacterStatistics((prev) => ({
      ...prev,
      spells: next,
      hasSpells: next.some((s) => s !== ""),
    }));
  };

  const handleSpellChange = (index: number, value: string) => {
    const next = [...currentSpells];
    next[index] = value;
    updateSpells(next);
  };

  const chooseRandomSpells = () => {
    const spellList = getSpellList();
    const next = Array.from({ length: spellCount }, () => {
      const pick = chooseRandomItem(spellList);
      return pick?.id ?? "";
    });
    updateSpells(next);
  };

  if (!hasSpells) return null;

  const spellOptions = getSpellList();

  return (
    <div className="spell-selection-menu">
      <h5 className="class-ability-menu--header">
        {characterClass.name} Spells
      </h5>
      {currentSpells.map((selected, idx) => (
        <select
          key={idx}
          className="spells-select"
          value={selected}
          onChange={(e) => handleSpellChange(idx, e.target.value)}
        >
          <option value="" disabled>
            {spellCount > 1 ? `Select Spell ${idx + 1}` : "Select Spell"}
          </option>
          {spellOptions.map((spell) => (
            <option key={spell.id} value={spell.id}>{spell.name}</option>
          ))}
        </select>
      ))}
      <button className="button--random-spell" onClick={chooseRandomSpells}>
        Random Spell{spellCount > 1 ? "s" : ""}
      </button>
    </div>
  );
}

