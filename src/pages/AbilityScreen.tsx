import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import AbilityScores from "../containers/abilties/AbilityScores";
import Classes from "../containers/classes/Classes";
import { useCharacter } from "../contexts/CharacterContext";

export default function AbilityScreen() {
  const {
    characterClass,
    abilityScores,
    originalAbilityScores,
    changeCharacterClass,
    setAbilityScores,
    pointBuy,
    setPointBuy,
    characterModifiers,
    rollAttribute,
    scoreIncrease,
    scoreDecrease,
    diceEnabled,
    abilityScoresThatCanDecrease,
  } = useCharacter();

  const scoreActions = { rollAttribute, scoreIncrease, scoreDecrease };

  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Find out why we no longer auto-roll ability scores on load when
    // dice rolls are disabled, this was working before and seems to have been
    // broken by a recent change
    if (!diceEnabled && abilityScores.strength === null) {
      rollAttribute("e", "all");
    }
  }, []);

  return (
    <div className="ability-screen container">
      <Header translation={"abilityScores"} name={"character-class"}></Header>


      <AbilityScores
        abilityScores={abilityScores}
        originalAbilityScores={originalAbilityScores}
        setAbilityScores={setAbilityScores}
        pointBuy={pointBuy}
        setPointBuy={setPointBuy}
        characterClass={characterClass}
        characterModifiers={characterModifiers}
        scoreActions={scoreActions}
        abilityScoresThatCanDecrease={abilityScoresThatCanDecrease}
      ></AbilityScores>

      <Header translation={"characterClass"} name={"character-class"}></Header>

      <Classes
        characterClass={characterClass}
        abilityScores={abilityScores}
        changeCharacterClass={changeCharacterClass}
      ></Classes>


      <ScreenNavigation
        onNext={() =>
          navigate('/class')
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

