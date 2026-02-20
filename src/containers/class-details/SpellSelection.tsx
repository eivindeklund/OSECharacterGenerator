import React, { useState } from "react";
import Option from "../../components/general/Option";
import {
  druidSpells,
  illusionistSpells,
  magicUserSpells,
  necromancerSpells,
  runesmithSpells,
} from "../../data/spells";
import type { CharacterStatistics, ClassOptionsData } from "../../types";
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
    characterStatistics.spell || "",
  );

  const chooseSpells = () => {
    let randomSpell : string;

    if (characterClass.arcaneSpells) {
      randomSpell = chooseRandomItem(magicUserSpells);
    }

    if (characterClass.druidSpells) {
      randomSpell = chooseRandomItem(druidSpells);
    }

    if (characterClass.illusionistSpells) {
      randomSpell = chooseRandomItem(illusionistSpells);
    }

    if (characterClass.necromancerSpells) {
      randomSpell = chooseRandomItem(necromancerSpells);
    }

    if (characterClass.runesmithSpells) {
      randomSpell = chooseRandomItem(runesmithSpells);
    }

    setSpellSelected(randomSpell);
    setCharacterStatistics((prevState) => {
      return { ...prevState, spell: randomSpell, hasSpells: true };
    });

    return randomSpell;
  };

  const spellsList = () => {
    let spellList: string[] = [];

    if (characterClass.arcaneSpells) {
      spellList = magicUserSpells;
    }

    if (characterClass.druidSpells) {
      spellList = druidSpells;
    }

    if (characterClass.illusionistSpells) {
      spellList = illusionistSpells;
    }

    if (characterClass.necromancerSpells) {
      spellList = necromancerSpells;
    }

    if (characterClass.runesmithSpells) {
      spellList = runesmithSpells;
    }

    return spellList.map((spell, index) => {
      return <Option key={index} value={spell.toString()}></Option>;
    });
  };

  const handleSpellChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSpellSelected(event.target.value);
    setCharacterStatistics({
      ...characterStatistics,
      spell: event.target.value,
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

