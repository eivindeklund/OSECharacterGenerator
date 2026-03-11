import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import ClassAbilitiesList from "../components/class/ClassAbilitiesList";
import SavingThrows from "../components/class/SavingThrows";
import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import HPRoller from "../containers/class-details/HPRoller";
import SpellSelection from "../containers/class-details/SpellSelection";
import type {
  Character,
  CharacterModifiers,
  CharacterStatistics,
  ClassOptionsData,
} from "../types";

type ClassScreenProps = {
  characterClass: ClassOptionsData
  character?: Character
  setCharacter?: Dispatch<SetStateAction<Character>>
  characterStatistics: CharacterStatistics
  setCharacterStatistics: Dispatch<SetStateAction<CharacterStatistics>>
  characterModifiers: CharacterModifiers
  rollHP: () => void
}

export default function ClassScreen(props: ClassScreenProps) {
  const {
    characterClass,
    characterStatistics,
    setCharacterStatistics,
    characterModifiers,
    rollHP,
  } = props;

  const navigate = useNavigate();

  return (
    <div className="class-options-screen">
      <Header name={"class-options"} translation={"classOptions"}></Header>

      <HPRoller
        characterClass={characterClass}
        characterStatistics={characterStatistics}
        characterModifiers={characterModifiers}
        rollHP={rollHP}
      ></HPRoller>

      <div className="saving-throws-menu">
        <h5 className="saving-throws-menu--header">
          {characterClass.name} Saving Throws
        </h5>

        <SavingThrows characterClass={characterClass}></SavingThrows>
      </div>

      <div className="class-ability-menu">
        <h5 className="class-ability-menu--header">
          {characterClass.name} Abilities
        </h5>

        <ClassAbilitiesList
          characterClass={characterClass}
        ></ClassAbilitiesList>
      </div>

      <SpellSelection
        setCharacterStatistics={setCharacterStatistics}
        characterClass={characterClass}
        characterStatistics={characterStatistics}
      ></SpellSelection>

      <ScreenNavigation
        onPrev={() => {
          navigate('/ability');
        }}
        prevLabel="Character Class"
        onNext={() => {
          navigate('/equipment');
        }}
        nextLabel="Equipment"
        requirements={[
          !characterStatistics.hitPoints && "Roll Hit Points",
          !!(
            characterClass.arcaneSpells ||
            characterClass.divineSpells ||
            characterClass.illusionistSpells ||
            characterClass.druidSpells ||
            characterClass.necromancerSpells ||
            characterClass.runesmithSpells
          ) &&
            !characterStatistics.spell &&
            "Select a Spell",
        ].filter(Boolean)}
      />
    </div>
  );
}


