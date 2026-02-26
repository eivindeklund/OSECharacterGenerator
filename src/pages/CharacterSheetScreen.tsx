import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ScreenNavigation from "../components/general/ScreenNavigation";
import CharacterSheet from "../containers/character/CharacterSheet";
import PDFExport from "../containers/character/PDFExport";
import type {
  AbilityScores,
  Character,
  CharacterEquipment,
  CharacterModifiers,
  CharacterStatistics,
  ClassOptionsData,
} from "../types";

interface CharacterSheetScreenProps {
  character: Character;
  characterStatistics: CharacterStatistics;
  characterClass: ClassOptionsData;
  characterEquipment: CharacterEquipment;
  characterModifiers: CharacterModifiers;
  abilityScores: AbilityScores;
  setCharacterRolled: Dispatch<SetStateAction<boolean>>;
  saveCharacter: () => void;
}

export default function CharacterSheetScreen(props: CharacterSheetScreenProps) {
  const {
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores,
    setCharacterRolled,
    saveCharacter,
  } = props;

  const componentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
            navigate('/details');
          }}
          prevLabel="Character Details"
        />

        <div className="navigation-footer">
          <button
            onClick={() => {
              navigate('/tavern');
            }}
          >
            <Trans i18nKey={"Tavern"}>Tavern</Trans>
          </button>

          <button
            onClick={() => {
              setCharacterRolled(false);
              navigate('/');
            }}
          >
            <Trans i18nKey={"mainPage"}>Main Page</Trans>
          </button>
        </div>
      </div>
    </div>
  );
}

