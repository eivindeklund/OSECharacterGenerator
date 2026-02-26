import Header from "../components/general/Header";
import CharacterDetails from "../containers/character-details/CharacterDetails";
import type {
  AbilityScores,
  Character,
  CharacterModifiers,
  ClassOptionsData,
  DiceState,
} from "../types";

interface DetailsScreenProps {
  dice: DiceState;
  character: Character;
  setCharacter: (character: Character) => void;
  characterClass: ClassOptionsData;
  characterModifiers: CharacterModifiers;
  abilityScores?: AbilityScores;
  // TODO: This isMobile prop is used to conditionally render the dice roller,
  // but it would be better to handle this with CSS media queries to not give
  // the user the ability to enable the dice roller if the screen is too small.
  //
  // Refactor this in a future update to remove the isMobile prop and handle it
  // with CSS instead.
  isMobile?: boolean;
}

export default function DetailsScreen(props: DetailsScreenProps) {
  const {
    character,
    setCharacter,
    characterClass,
    characterModifiers,
    abilityScores,
    dice,
    isMobile,
  } = props;

  return (
    <div className="details-screen-container">
      <div id="print-wrapper">
        <Header translation="characterDetails"></Header>

        <CharacterDetails
          character={character}
          setCharacter={setCharacter}
          characterClass={characterClass}
          characterModifiers={characterModifiers}
          abilityScores={abilityScores}
          dice={dice}
          isMobile={isMobile}
        ></CharacterDetails>
      </div>
    </div>
  );
}

