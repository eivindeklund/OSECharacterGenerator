import PropTypes from "prop-types";
import ClassAbilitiesList from "../components/class/ClassAbilitiesList";
import SavingThrows from "../components/class/SavingThrows";
import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import HPRoller from "../containers/class-details/HPRoller";
import SpellSelection from "../containers/class-details/SpellSelection";

export default function ClassScreen(props) {
  const {
    screen,
    setScreen,
    characterClass,
    characterStatistics,
    setCharacterStatistics,
    characterModifiers,
    diceEnabled,
    rollHP,
  } = props;

  return (
    <div className="class-options-screen">
      <Header name={"class-options"} translation={"classOptions"}></Header>

      <HPRoller
        characterClass={characterClass}
        characterStatistics={characterStatistics}
        setCharacterStatistics={setCharacterStatistics}
        characterModifiers={characterModifiers}
        diceEnabled={diceEnabled}
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
          setScreen({ ...screen, abilityScreen: true, classScreen: false });
        }}
        prevLabel="Character Class"
        onNext={() => {
          setScreen({ ...screen, equipmentScreen: true, classScreen: false });
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

ClassScreen.propTypes = {
  diceEnabled: PropTypes.bool,
  screen: PropTypes.objectOf(PropTypes.bool),
  setScreen: PropTypes.func,
  characterClass: PropTypes.object,
  character: PropTypes.object,
  setCharacter: PropTypes.func,
  characterStatistics: PropTypes.shape({
    hitPoints: PropTypes.number,
    armourClass: PropTypes.number,
    spell: PropTypes.string,
    hasSpells: PropTypes.bool,
    unarmouredAC: PropTypes.number,
  }),
  setCharacterStatistics: PropTypes.func,
  characterModifiers: PropTypes.object,
  rollHP: PropTypes.func,
};
