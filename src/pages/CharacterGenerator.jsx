import { useState } from "react";
import { useCharacterManager } from "../hooks/useCharacterManager";
import { Dice } from "../utilities/DiceBox";
import AbilityScreen from "./AbilityScreen";
import CharacterSheetScreen from "./CharacterSheetScreen";
import CharacterStorageScreen from "./CharacterStorageScreen";
import ClassScreen from "./ClassScreen";
import DetailsScreen from "./DetailsScreen";
import EquipmentScreen from "./EquipmentScreen";
import LandingScreen from "./LandingScreen";

export default function CharacterGenerator() {
  const {
    character,
    setCharacter,
    abilityScores,
    setAbilityScores,
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
    loadingRandomNumbers,
    setLoadingRandomNumbers,
    randomNumbers,
    characterRolled,
    setCharacterRolled,
    rollAttribute,
    rollCharacter,
    changeCharacterClass,
    rollHP,
    rollGold,
  } = useCharacterManager(Dice);

  const [rollButtonHover, setRollButtonHover] = useState(false);

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
            loadingRandomNumbers={loadingRandomNumbers}
            setLoadingRandomNumbers={setLoadingRandomNumbers}
            characterRolled={characterRolled}
            setCharacterRolled={setCharacterRolled}
            rollCharacter={rollCharacter}
            screen={screen}
            setScreen={setScreen}
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
                pointBuy={pointBuy}
                setPointBuy={setPointBuy}
                characterModifiers={characterModifiers}
                rollCharacter={rollCharacter}
                rollAttribute={rollAttribute}
                screen={screen}
                setScreen={setScreen}
              ></AbilityScreen>
            )}

            {screen.classScreen && (
              <ClassScreen
                screen={screen}
                setScreen={setScreen}
                characterClass={characterClass}
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
                characterClass={characterClass}
                screen={screen}
                setScreen={setScreen}
                characterModifiers={characterModifiers}
                characterStatistics={characterStatistics}
                setCharacterStatistics={setCharacterStatistics}
                characterEquipment={characterEquipment}
                setCharacterEquipment={setCharacterEquipment}
                randomNumbers={randomNumbers}
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
                characterClass={characterClass}
                characterModifiers={characterModifiers}
                diceEnabled={diceEnabled}
                diceService={Dice}
              ></DetailsScreen>
            )}

            {screen.characterSheetScreen && (
              <CharacterSheetScreen
                screen={screen}
                setScreen={setScreen}
                character={character}
                characterStatistics={characterStatistics}
                characterClass={characterClass}
                characterEquipment={characterEquipment}
                characterModifiers={characterModifiers}
                abilityScores={abilityScores}
                setCharacterRolled={setCharacterRolled}
              ></CharacterSheetScreen>
            )}

            {screen.characterStorageScreen && (
              <CharacterStorageScreen
                screen={screen}
                setScreen={setScreen}
                character={character}
                setCharacter={setCharacter}
                characterStatistics={characterStatistics}
                setCharacterStatistics={setCharacterStatistics}
                characterClass={characterClass}
                setCharacterClass={setCharacterClass}
                characterEquipment={characterEquipment}
                setCharacterEquipment={setCharacterEquipment}
                characterModifiers={characterModifiers}
                setCharacterModifiers={setCharacterModifiers}
                abilityScores={abilityScores}
                setAbilityScores={setAbilityScores}
                setCharacterRolled={setCharacterRolled}
              ></CharacterStorageScreen>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
