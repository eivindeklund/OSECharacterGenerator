import PropTypes from "prop-types";
import { useRef } from "react";
import { Trans } from "react-i18next";
import ScreenNavigation from "../components/general/ScreenNavigation";
import CharacterSheet from "../containers/character/CharacterSheet";
import PDFExport from "../containers/character/PDFExport";

export default function CharacterSheetScreen(props) {
  const {
    screen,
    setScreen,
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores,
    setCharacterRolled,
    saveCharacter,
  } = props;

  const componentRef = useRef();

  useEffect(() => {
    saveCharacter();
  }, [saveCharacter]);

  return (
    <div className="character-sheet-container container">
      <CharacterSheet
        character={character}
        characterStatistics={characterStatistics}
        characterClass={characterClass}
        characterEquipment={characterEquipment}
        characterModifiers={characterModifiers}
        abilityScores={abilityScores}
        ref={componentRef}
      ></CharacterSheet>

      <div className="button-container">
        <h3 className="header-default header-pdf">Export to PDF</h3>

        <PDFExport
          character={character}
          characterStatistics={characterStatistics}
          characterClass={characterClass}
          characterEquipment={characterEquipment}
          characterModifiers={characterModifiers}
          abilityScores={abilityScores}
        ></PDFExport>

        <h3 className="header-default header-pdf">Navigation</h3>

        <ScreenNavigation
          onPrev={() => {
            setScreen({
              ...screen,
              detailsScreen: true,
              characterSheetScreen: false,
            });
          }}
          prevLabel="Character Details"
        />

        <div className="navigation-footer">
          <button
            onClick={() => {
              setScreen({
                ...screen,
                characterStorageScreen: true,
                characterSheetScreen: false,
              });
            }}
          >
            <Trans i18nKey={"Tavern"}>Tavern</Trans>
          </button>

          <button
            onClick={() => {
              setScreen({
                ...screen,
                abilityScreen: true,
                characterSheetScreen: false,
              });
              setCharacterRolled(false);
            }}
          >
            <Trans i18nKey={"mainPage"}>Main Page</Trans>
          </button>
        </div>
      </div>
    </div>
  );
}

CharacterSheetScreen.propTypes = {
  screen: PropTypes.objectOf(PropTypes.bool),
  setScreen: PropTypes.func,
  character: PropTypes.object,
  setCharacter: PropTypes.func,
  characterStatistics: PropTypes.shape({
    hitPoints: PropTypes.number,
    armourClass: PropTypes.number,
    spell: PropTypes.string,
    hasSpells: PropTypes.bool,
    unarmouredAC: PropTypes.number,
  }),
  characterClass: PropTypes.object,
  characterEquipment: PropTypes.shape({
    armour: PropTypes.array,
    weapons: PropTypes.array,
    adventuringGear: PropTypes.array,
    gold: PropTypes.number,
  }),
  characterModifiers: PropTypes.objectOf(PropTypes.string),
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
  setCharacterRolled: PropTypes.func,
};
