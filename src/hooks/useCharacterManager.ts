import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  abilityScoreNames,
  defaultAbilityScoresState,
  Thief,
} from "../constants/constants";
import classOptionsData, { emptyClassOptions } from "../data/classOptionsData";
import { CharacterModifiers, ClassOptionsData, StoredCharacterData } from "../types";
import { DeviceService as DefaultDeviceService } from "../utilities/DeviceService";
import { StorageService as DefaultStorageService } from "../utilities/StorageService";
import {
  d,
  deriveCharacterModifiers
} from "../utilities/utilities";

/** Returns the furthest wizard route that is valid for the given (possibly partial) character data. */
function getFurthestRoute(data: StoredCharacterData): string {
  const { abilityScores, characterClass, characterStatistics, characterEquipment, character } = data;
  const allScoresRolled = abilityScores && Object.values(abilityScores).every(v => v !== null);
  const classSelected = characterClass && characterClass.name !== '';
  if (!allScoresRolled || !classSelected) return '/ability';
  if (characterStatistics.hitPoints === null) return '/class';
  if (characterEquipment.gold === null) return '/equipment';
  if (!character.name || !character.alignment) return '/details';
  return '/sheet';
}

export const useCharacterManager = (
  diceService,
  storageService = DefaultStorageService,
  deviceService = DefaultDeviceService
) => {
  const [character, setCharacter] = useState({
    id: null,
    name: null,
    languages: [],
    hasLanguages: null,
    personality: null,
    misfortune: null,
    appearance: null,
    backgroundSkill: null,
    alignment: null,
  });

  const [abilityScores, setAbilityScores] = useState(defaultAbilityScoresState);
  const [originalAbilityScores, setOriginalAbilityScores] = useState(defaultAbilityScoresState);

  const [characterModifiers, setCharacterModifiers] = useState<CharacterModifiers>({
    xpModifierPercentage: "0",
    strengthModMelee: "0",
    strengthModDoors: "0",
    intelligenceModLanguages: "0",
    intelligenceModLiteracy: "",
    intelligenceModExtraLanguageCount: "0",
    wisdomMod: "0",
    dexterityModAC: "0",
    dexterityModMissiles: "0",
    dexterityModInitiative: "0",
    constitutionMod: "0",
    charismaModNPCReactions: "0",
    charismaModRetainersMax: "0",
    charismaModLoyalty: "0",
  });

  const [characterStatistics, setCharacterStatistics] = useState({
    hitPoints: null,
    hpRolls: 0,
    hpResult: null,
    armourClass: null,
    spell: null,
    hasSpells: false,
    unarmouredAC: null,
  });

  const [pointBuy, setPointBuy] = useState(0);

  const [characterClass, setCharacterClass] = useState<ClassOptionsData>(emptyClassOptions);

  const navigate = useNavigate();

  const [characterEquipment, setCharacterEquipment] = useState({
    armour: [],
    weapons: [],
    adventuringGear: [],
    gold: null,
  });

  const [diceEnabled, setDiceEnabled] = useState(false);
  const [characterRolled, setCharacterRolled] = useState(false);
  const [pendingRoll, setPendingRoll] = useState(null);
  const [storedCharacters, setStoredCharacters] = useState([]);
  const [partialCharacter, setPartialCharacter] = useState<StoredCharacterData | null>(null);

  useEffect(() => {
    setStoredCharacters(storageService.loadCharacters());
    const partial = storageService.loadPartialCharacter();
    if (partial) {
      const matchedClass = classOptionsData.find(c => c.name === partial.characterClass?.name) || emptyClassOptions;
      setCharacter(partial.character);
      setAbilityScores(partial.abilityScores);
      setOriginalAbilityScores(partial.abilityScores);
      if (partial.characterModifiers) {
        setCharacterModifiers(partial.characterModifiers);
      }
      setCharacterStatistics(partial.characterStatistics);
      setCharacterClass(matchedClass);
      setCharacterEquipment(partial.characterEquipment);
      setCharacterRolled(true);
      setPartialCharacter({ ...partial, characterClass: matchedClass });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageService]);

  const isMobile = deviceService.getIsMobile();

  useEffect(() => {
    if (characterRolled) {
      const newCharacterModifiers = deriveCharacterModifiers(abilityScores);
      newCharacterModifiers.xpModifierPercentage = characterClass.xpModifierPercentage(abilityScores);
      setCharacterModifiers(newCharacterModifiers as CharacterModifiers);
    }
  }, [abilityScores, characterClass, characterRolled]);

  // Auto-save in-progress character to localStorage whenever wizard state changes.
  useEffect(() => {
    if (!characterRolled) return;
    const partialData: StoredCharacterData = {
      character,
      abilityScores,
      characterModifiers,
      characterStatistics,
      characterClass,
      characterEquipment,
      partial: true,
    };
    storageService.savePartialCharacter(partialData);
    setPartialCharacter(partialData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, abilityScores, characterModifiers, characterStatistics, characterClass, characterEquipment, characterRolled]);

  const rollAttribute = (attributeOrEvent, optionalInput) => {
    const attribute =
      typeof attributeOrEvent === "string"
        ? attributeOrEvent
        : attributeOrEvent?.target?.value || optionalInput;

    const diceThemes = {
      strength: "#8d1a10",
      intelligence: "#30049d",
      dexterity: "#3E6E1B",
      wisdom: "#0A5159",
      constitution: "#0c0828",
      charisma: "#E795A6",
    };

    const animateDice = diceEnabled && diceService;

    if (!animateDice) {
      const newCharacterAbilityScores = { ...abilityScores };
      const newOriginalAbilityScores = { ...originalAbilityScores };
      const abilityScoresToUpdate = attribute === "all" ? abilityScoreNames : [attribute];
      abilityScoresToUpdate.forEach((score) => {
        const dieResult = d(3, 6);
        newCharacterAbilityScores[score] = dieResult;
        newOriginalAbilityScores[score] = dieResult;
      });
      setAbilityScores(newCharacterAbilityScores);
      setOriginalAbilityScores(newOriginalAbilityScores);
      setPointBuy(0);
      return;
    }
    if (attribute === "all") {
      setPendingRoll("all");
      diceService.show().roll("3d6", { themeColor: diceThemes.strength });
      diceService.roll("3d6", { themeColor: diceThemes.intelligence });
      diceService.roll("3d6", { themeColor: diceThemes.dexterity });
      diceService.roll("3d6", { themeColor: diceThemes.wisdom });
      diceService.roll("3d6", { themeColor: diceThemes.constitution });
      diceService.roll("3d6", { themeColor: diceThemes.charisma });
    } else {
      setPendingRoll(attribute);
      const diceColor = diceThemes[attribute];
      diceService.show().roll("3d6", { themeColor: diceColor });
    }
  };

  const rollHP = () => {
    const characterHitDie = characterClass.hd;
    const animateDice = diceEnabled && diceService;

    if (!animateDice) {
      const HPResult = d(1, characterHitDie);
      const totalHP = Math.max(
        1,
        HPResult + parseInt(characterModifiers.constitutionMod)
      );
      const HPRollsNew = characterStatistics.hpRolls + 1;

      setCharacterStatistics((prev) => ({
        ...prev,
        hitPoints: totalHP,
        hpRolls: HPRollsNew,
        hpResult: HPResult,
      }));
      return;
    }

    setPendingRoll("hp");
    diceService
      .hide()
      .show()
      .roll(`1d${characterHitDie}`, { themeColor: "#FF2800" });
  };

  const rollGold = () => {
    const animateDice = diceEnabled && diceService;

    if (!animateDice) {
      setCharacterEquipment((prev) => ({
        ...prev,
        gold: d(3, 6) * 10,
      }));
      return;
    }

    setPendingRoll("gold");
    diceService.show().roll("3d6", { themeColor: "#D99E30" });
  };

  const handleRollComplete = useCallback(
    (rollResults) => {
      if (pendingRoll === "all") {
        setAbilityScores((prev) => {
          const newAbilityScores = { ...prev };
          abilityScoreNames.forEach((attr, i) => {
            newAbilityScores[attr] = rollResults[i]?.value;
          });
          return newAbilityScores;
        });
        setOriginalAbilityScores((prev) => {
          const newOriginalAbilityScores = { ...prev };
          abilityScoreNames.forEach((attr, i) => {
            newOriginalAbilityScores[attr] = rollResults[i]?.value;
          });
          return newOriginalAbilityScores;
        });
        setPointBuy(0);
      } else if (pendingRoll === "hp") {
        const HPResult = rollResults[0].value;
        const totalHP = Math.max(
          1,
          HPResult + parseInt(characterModifiers.constitutionMod)
        );
        const HPRollsNew = characterStatistics.hpRolls + 1;
        setCharacterStatistics((prev) => ({
          ...prev,
          hitPoints: totalHP,
          hpRolls: HPRollsNew,
          hpResult: HPResult,
        }));
      } else if (pendingRoll === "gold") {
        let goldResult = 0;
        rollResults.forEach((dieResult) => {
          goldResult += dieResult.value;
        });
        const totalGold = goldResult * 10;
        setCharacterEquipment((prev) => ({
          ...prev,
          gold: totalGold,
        }));
      } else if (pendingRoll) {
        setAbilityScores((prev) => ({
          ...prev,
          [pendingRoll]: rollResults[0].value,
        }));
        setOriginalAbilityScores((prev) => ({
          ...prev,
          [pendingRoll]: rollResults[0].value,
        }));
        setPointBuy(0);
      }

      setPendingRoll(null);
    },
    [
      pendingRoll,
      characterModifiers.constitutionMod,
      characterStatistics.hpRolls,
    ]
  );

  useEffect(() => {
    if (diceService) {
      diceService.onRollComplete = handleRollComplete;
    }
  }, [diceService, handleRollComplete]);

  const rollCharacter = () => {
    storageService.clearPartialCharacter();
    const newID = uuidv4();
    setCharacter({
      id: newID,
      name: null,
      languages: [],
      hasLanguages: null,
      personality: null,
      misfortune: null,
      appearance: null,
      backgroundSkill: null,
      alignment: null,
    });
    setCharacterClass(emptyClassOptions);
    setCharacterRolled(true);
    setAbilityScores(defaultAbilityScoresState);
    setOriginalAbilityScores(defaultAbilityScoresState);
    navigate('/ability');
    setPointBuy(0);
    setCharacterStatistics({
      hitPoints: null,
      hpRolls: 0,
      hpResult: null,
      armourClass: null,
      spell: null,
      hasSpells: false,
      unarmouredAC: null,
    });
    setCharacterEquipment({
      armour: [],
      weapons: [],
      adventuringGear: [],
      gold: null,
    });
  };

  const changeCharacterClass = (event) => {
    const newClass = classOptionsData.find(
      (obj) => obj.name === event.target.value
    );
    // Prevent selecting a class that doesn't meet requirements
    if (!newClass.checkAbilityScoreRequirements(abilityScores)) {
      return;
    }

    setCharacterClass(newClass);
  };

  const scoreIncrease = (key) => {
    const value = abilityScores[key];
    const increment = value < originalAbilityScores[key] ? 2 : 1;

    if (pointBuy < 1 || value >= 18) {
      return;
    }

    setAbilityScores((prev) => ({ ...prev, [key]: value + increment }));
    setPointBuy((prev) => prev - 1);
  };

  const scoreDecrease = (key) => {
    const value = abilityScores[key];
    const decrement = value > originalAbilityScores[key] ? -1 : -2;

    if (value <= 10) {
      return;
    }

    setAbilityScores((prev) => ({ ...prev, [key]: value + decrement }));
    setPointBuy((prev) => prev + 1);
  };

  const saveCharacter = () => {
    const characterData = {
      character,
      characterStatistics,
      characterClass,
      characterEquipment,
      characterModifiers,
      abilityScores,
    };
    const updated = storageService.saveCharacter(characterData);
    setStoredCharacters(updated);
    storageService.clearPartialCharacter();
    setPartialCharacter(null);
  };

  const deleteStoredCharacter = (id) => {
    const updated = storageService.deleteCharacter(id);
    setStoredCharacters(updated);
  };

  const importCharacter = (data) => {
    if (!data) return;

    setCharacter(data.character);
    setAbilityScores(data.abilityScores);
    
    if (data.characterModifiers) {
      setCharacterModifiers(data.characterModifiers);
    }
    
    setCharacterStatistics(data.characterStatistics);
    
    const matchedClass = classOptionsData.find(c => c.name === data.characterClass.name) || data.characterClass;
    setCharacterClass(matchedClass);

    setCharacterEquipment(data.characterEquipment);
    setPointBuy(0); 
    setCharacterRolled(true);
    navigate('/sheet');
  };

  const loadCharacter = (data) => {
    if (!data) return;

    setCharacter(data.character);
    setAbilityScores(data.abilityScores);
    setCharacterModifiers(data.characterModifiers);
    setCharacterStatistics(data.characterStatistics);

    const matchedClass = classOptionsData.find(c => c.name === data.characterClass.name) || data.characterClass;
    setCharacterClass(matchedClass);

    setCharacterEquipment(data.characterEquipment);
    setPointBuy(0);
    setCharacterRolled(true);
    navigate(data.partial ? getFurthestRoute(data) : '/sheet');
  };

  const discardPartialCharacter = () => {
    storageService.clearPartialCharacter();
    setPartialCharacter(null);
    rollCharacter();
  };

  const clearPartialCharacter = () => {
    storageService.clearPartialCharacter();
    setPartialCharacter(null);
    setCharacterRolled(false);
  };

  const abilityScoresThatCanDecrease = {
    strength: characterClass.name !== Thief,
    intelligence: true,
    wisdom: true,
    dexterity: false,
    constitution: false,
    charisma: false,
  };

  return {
    character,
    setCharacter,
    abilityScores,
    setAbilityScores,
    originalAbilityScores,
    setOriginalAbilityScores,
    characterModifiers,
    setCharacterModifiers,
    characterStatistics,
    setCharacterStatistics,
    pointBuy,
    setPointBuy,
    characterClass,
    setCharacterClass,
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
    partialCharacter,
    discardPartialCharacter,
    clearPartialCharacter,
  };
};
