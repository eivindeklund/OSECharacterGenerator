import Header from "../components/general/Header";
import ScreenNavigation from "../components/general/ScreenNavigation";
import AbilityScores from "../containers/abilties/AbilityScores";
import Classes from "../containers/classes/Classes";
import type {
    AbilityScoresCanDecrease,
    AbilityScores as AbilityScoresType,
    CharacterModifiers,
    ClassOptionsData,
    ScoreActions,
    ScreenState,
} from "../types";

import { Dispatch, SetStateAction, useEffect } from "react";

interface AbilityScreenProps {
  characterRolled?: boolean;
  characterClass: Pick<ClassOptionsData, 'name' | 'primeReqs'>;
  abilityScores: AbilityScoresType;
  changeCharacterClass: React.MouseEventHandler<HTMLButtonElement>;
  setAbilityScores: Dispatch<SetStateAction<AbilityScoresType>>;
  pointBuy: number;
  setPointBuy: Dispatch<SetStateAction<number>>;
  characterModifiers: CharacterModifiers;
  rollCharacter: () => void;
  scoreActions: ScoreActions;
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  diceEnabled: boolean;
  abilityScoresCanDecrease: AbilityScoresCanDecrease;
}

export default function AbilityScreen(props: AbilityScreenProps) {
  const {
    characterClass,
    abilityScores,
    changeCharacterClass,
    setAbilityScores,
    pointBuy,
    setPointBuy,
    characterModifiers,
    rollCharacter,
    scoreActions,
    screen,
    setScreen,
    diceEnabled,
    abilityScoresCanDecrease
  } = props;

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
        setAbilityScores={setAbilityScores}
        pointBuy={pointBuy}
        setPointBuy={setPointBuy}
        characterClass={characterClass}
        characterModifiers={characterModifiers}
        scoreActions={scoreActions}
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

