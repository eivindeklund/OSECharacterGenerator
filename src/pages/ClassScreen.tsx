import { useNavigate } from "react-router-dom";
import ClassAbilitiesList from "../components/class/ClassAbilitiesList";
import SavingThrows from "../components/class/SavingThrows";
import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import HPRoller from "../containers/class-details/HPRoller";
import SpellSelection from "../containers/class-details/SpellSelection";
import { useCharacter } from "../contexts/CharacterContext";
import { useCampaign } from "../contexts/CampaignContext";

export default function ClassScreen() {
  const {
    character,
    characterClass,
    characterStatistics,
    setCharacterStatistics,
    characterModifiers,
    rollHP,
  } = useCharacter();

  const { getClassSpellSlots } = useCampaign();
  const navigate = useNavigate();

  const hasSpellClass = !!(
    characterClass.arcaneSpells ||
    characterClass.divineSpells ||
    characterClass.illusionistSpells ||
    characterClass.druidSpells ||
    characterClass.necromancerSpells ||
    characterClass.runesmithSpells
  );
  const requiredSpells = hasSpellClass
    ? Math.max(1, getClassSpellSlots(characterClass, 1)[0] ?? 1)
    : 0;
  const selectedSpells = characterStatistics.spells.filter((s) => s !== "").length;

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
          navigate(`/character/${character.id}/ability`);
        }}
        prevLabel="Character Class"
        onNext={() => {
          navigate(`/character/${character.id}/equipment`);
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
            selectedSpells < requiredSpells &&
            (requiredSpells > 1
              ? `Select ${requiredSpells} Spells (${selectedSpells}/${requiredSpells})`
              : "Select a Spell"),
        ].filter(Boolean)}
      />
    </div>
  );
}


