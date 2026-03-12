import Header from "../components/general/Header";
import CharacterDetails from "../containers/character-details/CharacterDetails";
import { useCharacter } from "../contexts/CharacterContext";
import { Dice } from "../utilities/DiceBox";

export default function DetailsScreen() {
  const {
    character,
    setCharacter,
    characterClass,
    characterModifiers,
    abilityScores,
    diceEnabled,
    isMobile,
  } = useCharacter();

  const dice = { diceEnabled, diceService: Dice };

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

