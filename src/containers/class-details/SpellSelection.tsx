import React, { useState } from "react";
import Option from "../../components/general/Option";
import type { CharacterStatistics, ClassOptionsData, SpellDefinition } from "../../types";
import { getSpellsByLevelForClass } from "../../utilities/levelUpSpellUtils";
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
  const [spellSelected, setSpellSelected] = useState(
    characterStatistics.spells[0] ?? "",
  );

  const getSpellList = (): SpellDefinition[] => {
    const byLevel = getSpellsByLevelForClass(characterClass);
    if (byLevel.length === 0) return [];
    if (byLevel.length > 1) {
      const slots = characterClass.getSpellSlotsAtLevel(characterStatistics.level);
      const filtered = slots.flatMap((count, tier) =>
        count > 0 ? [...(byLevel[tier] ?? [])] : []
      );
      if (filtered.length > 0) return filtered as SpellDefinition[];
    }
    return (byLevel as readonly (readonly SpellDefinition[])[]).flat() as SpellDefinition[];
  };

  const chooseSpells = () => {
    const spellList = getSpellList();
    const randomSpell = chooseRandomItem(spellList);
    if (!randomSpell) return;
    const spellName = randomSpell.name;

    setSpellSelected(spellName);
    setCharacterStatistics((prevState) => {
      return { ...prevState, spells: [spellName], hasSpells: true };
    });

    return spellName;
  };

  const spellsList = () => {
    return getSpellList().map((spell) => {
      return <Option key={spell.name} value={spell.name}></Option>;
    });
  };

  const handleSpellChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSpellSelected(event.target.value);
    setCharacterStatistics({
      ...characterStatistics,
      spells: [event.target.value],
      hasSpells: true,
    });
  };

  const hasSpells = !!(
    characterClass.arcaneSpells ||
    characterClass.divineSpells ||
    characterClass.illusionistSpells ||
    characterClass.druidSpells ||
    characterClass.necromancerSpells ||
    characterClass.runesmithSpells
  );

  return (
    <React.Fragment>
      {hasSpells && (
        <div className="spell-selection-menu">
          <h5 className="class-ability-menu--header">
            {characterClass.name} Spells
          </h5>
          <select
            className="spells-select"
            value={spellSelected}
            onChange={handleSpellChange}
          >
            <option value="" disabled>
              Select Spell
            </option>
            {spellsList()}
          </select>
          <button
            className="button--random-spell"
            onClick={() => {
              chooseSpells();
            }}
          >
            Random Spell
          </button>
        </div>
      )}
    </React.Fragment>
  );
}

