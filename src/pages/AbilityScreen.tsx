import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import AbilityScores from "../containers/abilties/AbilityScores";
import Classes from "../containers/classes/Classes";
import type {
  AbilityScoresThatCanDecrease,
  AbilityScores as AbilityScoresType,
  CharacterModifiers,
  ClassOptionsData,
  ScoreActions,
} from "../types";

import { Dispatch, SetStateAction, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AbilityScreenProps {
  characterRolled?: boolean;
  characterClass: Pick<ClassOptionsData, 'name' | 'primeReqs'>;
  abilityScores: AbilityScoresType;
  originalAbilityScores: AbilityScoresType;
  changeCharacterClass: React.MouseEventHandler<HTMLButtonElement>;
  setAbilityScores: Dispatch<SetStateAction<AbilityScoresType>>;
  pointBuy: number;
  setPointBuy: Dispatch<SetStateAction<number>>;
  characterModifiers: CharacterModifiers;
  rollCharacter: () => void;
  scoreActions: ScoreActions;
  diceEnabled: boolean;
  abilityScoresThatCanDecrease: AbilityScoresThatCanDecrease;
}

export default function AbilityScreen(props: AbilityScreenProps) {
  const {
    characterClass,
    abilityScores,
    originalAbilityScores,
    changeCharacterClass,
    setAbilityScores,
    pointBuy,
    setPointBuy,
    characterModifiers,
    rollCharacter,
    scoreActions,
    diceEnabled,
    abilityScoresThatCanDecrease
  } = props;

  const navigate = useNavigate();

  const { rollAttribute, scoreIncrease, scoreDecrease } = scoreActions;

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

