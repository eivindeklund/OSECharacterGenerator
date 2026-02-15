import PropTypes from "prop-types";
import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import AbilityScores from "../containers/abilties/AbilityScores";
import Classes from "../containers/classes/Classes";

import { useEffect } from "react";

export default function AbilityScreen(props) {
  const {
    characterClass,
    abilityScores,
    changeCharacterClass,
    setAbilityScores,
    pointBuy,
    setPointBuy,
    characterModifiers,
    rollCharacter,
    rollAttribute,
    screen,
    setScreen,
    diceEnabled,
    scoreIncrease,
    scoreDecrease,
    abilityScoresCanDecrease
  } = props;

  useEffect(() => {
    console.log("Loaded");

    if (!diceEnabled && abilityScores.strength === null) {
      rollAttribute("e", "all");
    }
  }, []);

  return (
    <div className="ability-screen container">
      <Header translation={"abilityScores"} name={"character-class"}></Header>


      <AbilityScores
        abilityScores={abilityScores}
        setAbilityScores={setAbilityScores}
        pointBuy={pointBuy}
        setPointBuy={setPointBuy}
        characterClass={characterClass}
        characterModifiers={characterModifiers}
        rollAttribute={rollAttribute}
        scoreIncrease={scoreIncrease}
        scoreDecrease={scoreDecrease}
        abilityScoresCanDecrease={abilityScoresCanDecrease}
      ></AbilityScores>

      <Header translation={"characterClass"} name={"character-class"}></Header>

      <Classes
        characterClass={characterClass}
        abilityScores={abilityScores}
        changeCharacterClass={changeCharacterClass}
      ></Classes>


      <ScreenNavigation
        onNext={() =>
          setScreen({
            ...screen,
            equipmentScreen: false,
            abilityScreen: false,
            classScreen: true,
          })
        }
        nextLabel="Class Options"
        requirements={[
          !characterClass.name && "Choose a character class",
          Object.values(abilityScores).some((v) => v === null) &&
            "Roll all ability scores",
        ].filter(Boolean)}
      />
    </div>
  );
}

AbilityScreen.propTypes = {
  characterRolled: PropTypes.bool,
  characterClass: PropTypes.object,
  abilityScores: PropTypes.shape({
    strength: PropTypes.number,
    strengthOriginal: PropTypes.number,
    intelligence: PropTypes.number,
    intelligenceOriginal: PropTypes.number,
    wisdom: PropTypes.number,
    wisdomOriginal: PropTypes.number,
    dexterity: PropTypes.number,
    dexterityOriginal: PropTypes.number,
    constitution: PropTypes.number,
    constitutionOriginal: PropTypes.number,
    charisma: PropTypes.number,
    charismaOriginal: PropTypes.number,
  }),
  changeCharacterClass: PropTypes.func,
  setAbilityScores: PropTypes.func,
  pointBuy: PropTypes.number,
  setPointBuy: PropTypes.func,
  characterModifiers: PropTypes.objectOf(PropTypes.string),
  rollCharacter: PropTypes.func,
  screen: PropTypes.objectOf(PropTypes.bool),
  setScreen: PropTypes.func,
  rollAttribute: PropTypes.func,
  diceEnabled: PropTypes.bool,
};
