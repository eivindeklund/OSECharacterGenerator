import { useEffect, useState } from "react";
import { useCharacterManager } from "../hooks/useCharacterManager";
import type { ClassOptionsData } from "../types";
import { Dice } from "../utilities/DiceBox";
import ShareService from "../utilities/ShareService";
import AbilityScreen from "./AbilityScreen";
import CharacterSheetScreen from "./CharacterSheetScreen";
import CharacterStorageScreen from "./CharacterStorageScreen";
import ClassScreen from "./ClassScreen";
import DetailsScreen from "./DetailsScreen";
import EquipmentScreen from "./EquipmentScreen";
import ImportCharacterScreen from "./ImportCharacterScreen";
import LandingScreen from "./LandingScreen";

// TODO: Add typescript types to all props and state in this file, likely need
// to refactor some of the state management to make it more manageable and type
// safe. This is a large task and should be done in a separate branch.
export default function CharacterGenerator() {
  const {
    character,
    setCharacter,
    abilityScores,
    setAbilityScores,
    originalAbilityScores,
    characterModifiers,
    setCharacterModifiers,
    characterStatistics,
    setCharacterStatistics,
    pointBuy,
    setPointBuy,
    characterClass,
    setCharacterClass,
    screen,
    setScreen,
    characterEquipment,
    setCharacterEquipment,
    diceEnabled,
    setDiceEnabled,
    characterRolled,
    setCharacterRolled,
    rollAttribute,
    rollCharacter,
    changeCharacterClass,
    rollHP,
    rollGold,
    scoreIncrease,
    scoreDecrease,
    saveCharacter,
    deleteStoredCharacter,
    importCharacter,
    loadCharacter,
    storedCharacters,
    isMobile,
    abilityScoresThatCanDecrease,
  } = useCharacterManager(Dice);

  const [rollButtonHover, setRollButtonHover] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      const characterData = ShareService.decompressCharacter(data);
      if (characterData) {
        setPendingImport(characterData);
      }
    }
  }, []);

  const handleConfirmImport = () => {
    importCharacter(pendingImport);
    setPendingImport(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleCancelImport = () => {
    setPendingImport(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (pendingImport) {
    return (
      <div className={"layout"}>
        <div className={`wrapper-container`}>
          <div className={`wrapper`}>
            <ImportCharacterScreen 
              characterData={pendingImport} 
              onConfirm={handleConfirmImport} 
              onCancel={handleCancelImport} 
            />
          </div>
        </div>
      </div>
    );
  }

  let characterMenuStyle = characterRolled ? {} : { display: "none" };

  return (
    <div className={"layout"}>
      <div className={`wrapper-container`}>
        <div className={`wrapper ${rollButtonHover ? "wrapper-alt" : ""}`}>
          <LandingScreen
            diceEnabled={diceEnabled}
            setDiceEnabled={setDiceEnabled}
            rollButtonHover={rollButtonHover}
            setRollButtonHover={setRollButtonHover}
            characterRolled={characterRolled}
            setCharacterRolled={setCharacterRolled}
            rollCharacter={rollCharacter}
            screen={screen}
            setScreen={setScreen}
            isMobile={isMobile}
            storedCharacters={storedCharacters}
          ></LandingScreen>
          <div
            className={"character-menu container"}
            style={characterMenuStyle}
          >
            {screen.abilityScreen && characterRolled && (
              <AbilityScreen
                diceEnabled={diceEnabled}
                characterRolled={characterRolled}
                characterClass={characterClass}
                abilityScores={abilityScores}
                changeCharacterClass={changeCharacterClass}
                setAbilityScores={setAbilityScores}
                originalAbilityScores={originalAbilityScores}
                pointBuy={pointBuy}
                setPointBuy={setPointBuy}
                characterModifiers={characterModifiers}
                rollCharacter={rollCharacter}
                scoreActions={{ rollAttribute, scoreIncrease, scoreDecrease }}
                screen={screen}
                setScreen={setScreen}
                abilityScoresThatCanDecrease={abilityScoresThatCanDecrease}
              ></AbilityScreen>
            )}

            {screen.classScreen && (
              <ClassScreen
                screen={screen}
                setScreen={setScreen}
                characterClass={characterClass as ClassOptionsData}
                character={character}
                setCharacter={setCharacter}
                characterModifiers={characterModifiers}
                characterStatistics={characterStatistics}
                setCharacterStatistics={setCharacterStatistics}
                diceEnabled={diceEnabled}
                rollHP={rollHP}
              ></ClassScreen>
            )}

            {screen.equipmentScreen && (
              <EquipmentScreen
                characterClass={characterClass as ClassOptionsData}
                screen={screen}
                setScreen={setScreen}
                characterModifiers={characterModifiers}
                characterStatistics={characterStatistics}
                setCharacterStatistics={setCharacterStatistics}
                characterEquipment={characterEquipment}
                setCharacterEquipment={setCharacterEquipment}
                diceEnabled={diceEnabled}
                rollGold={rollGold}
              />
            )}

            {screen.detailsScreen && (
              <DetailsScreen
                screen={screen}
                setScreen={setScreen}
                character={character}
                setCharacter={setCharacter}
                characterClass={characterClass as ClassOptionsData}
                characterModifiers={characterModifiers}
                abilityScores={abilityScores}
                dice={{ diceEnabled, diceService: Dice }}
                isMobile={isMobile}
              ></DetailsScreen>
            )}

            {screen.characterSheetScreen && (
              <CharacterSheetScreen
                screen={screen}
                setScreen={setScreen}
                character={character}
                characterStatistics={characterStatistics}
                characterClass={characterClass as ClassOptionsData}
                characterEquipment={characterEquipment}
                characterModifiers={characterModifiers}
                abilityScores={abilityScores}
                setCharacterRolled={setCharacterRolled}
                saveCharacter={saveCharacter}
              ></CharacterSheetScreen>
            )}

            {screen.characterStorageScreen && (
              <CharacterStorageScreen
                screen={screen}
                setScreen={setScreen}
                loadCharacter={loadCharacter}
                setCharacterRolled={setCharacterRolled}
                storedCharacters={storedCharacters}
                deleteStoredCharacter={deleteStoredCharacter}
              ></CharacterStorageScreen>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
