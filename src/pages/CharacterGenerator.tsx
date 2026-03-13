import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CharacterProvider } from "../contexts/CharacterContext";
import { useCharacterManager } from "../hooks/useCharacterManager";
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// TODO: Add typescript types to all props and state in this file, likely need
// to refactor some of the state management to make it more manageable and type
// safe. This is a large task and should be done in a separate branch.
export default function CharacterGenerator() {
  const characterContext = useCharacterManager(Dice);
  const { importCharacter } = characterContext;

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

  let characterMenuStyle = characterContext.characterRolled ? {} : { display: "none" };

  return (
    <CharacterProvider value={characterContext}>
      <div className={"layout"}>
        <ScrollToTop />
        <div className={`wrapper-container`}>
          <div className={`wrapper ${rollButtonHover ? "wrapper-alt" : ""}`}>
            <LandingScreen
              rollButtonHover={rollButtonHover}
              setRollButtonHover={setRollButtonHover}
            />
            <ScrollToTop />
            <div
              className={"character-menu container"}
              style={characterMenuStyle}
            >
              <Routes>
                <Route path="/ability" element={<AbilityScreen />} />
                <Route path="/class" element={<ClassScreen />} />
                <Route path="/equipment" element={<EquipmentScreen />} />
                <Route path="/details" element={<DetailsScreen />} />
                <Route path="/sheet" element={<CharacterSheetScreen />} />
                <Route path="/tavern" element={<CharacterStorageScreen />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </CharacterProvider>
  );
}
