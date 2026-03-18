import { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ScreenNavigation from "../components/general/ScreenNavigation";
import LevelUpModal from "../components/level-up/LevelUpModal";
import CharacterSheet from "../containers/character/CharacterSheet";
import PDFExport from "../containers/character/PDFExport";
import { useCampaign } from "../contexts/CampaignContext";
import { useCharacter } from "../contexts/CharacterContext";

export default function CharacterSheetScreen() {
  const {
    character,
    characterStatistics,
    characterClass,
    characterEquipment,
    characterModifiers,
    abilityScores,
    setCharacterRolled,
    saveCharacter,
    levelUp,
  } = useCharacter();
  const { spellSlotTables } = useCampaign();

  const characterId = character.id;

  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentLevel = characterStatistics.level ?? 1;
  const maxLevel = characterClass.maxLevel === 0 ? 14 : characterClass.maxLevel;
  const canLevelUp = currentLevel < maxLevel;

  useEffect(() => {
    saveCharacter();
  }, [saveCharacter]);

  return (
    <div className="character-sheet-container container">
      {levelUpOpen && (
        <LevelUpModal
          characterClass={characterClass}
          characterStatistics={characterStatistics}
          characterModifiers={characterModifiers}
          onConfirm={(hpGained, newSpells) => {
            levelUp(hpGained, newSpells);
            setLevelUpOpen(false);
          }}
          onCancel={() => setLevelUpOpen(false)}
        />
      )}

      <CharacterSheet
        character={character}
        characterStatistics={characterStatistics}
        characterClass={characterClass}
        characterEquipment={characterEquipment}
        characterModifiers={characterModifiers}
        abilityScores={abilityScores}
        spellSlotTables={spellSlotTables}
        ref={componentRef}
      ></CharacterSheet>

      <div className="button-container">
        {canLevelUp && (
          <>
            <h3 className="header-default header-pdf">Advancement</h3>
            <button onClick={() => setLevelUpOpen(true)}>
              Level Up (→ Level {currentLevel + 1})
            </button>
          </>
        )}

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
            navigate(`/character/${characterId}/details`);
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

