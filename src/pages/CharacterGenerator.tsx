import { useEffect, useState } from "react";
import { Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { CampaignProvider } from "../contexts/CampaignContext";
import { CharacterProvider } from "../contexts/CharacterContext";
import { useCampaignManager } from "../hooks/useCampaignManager";
import { useCharacterManager } from "../hooks/useCharacterManager";
import { Dice } from "../utilities/DiceBox";
import ShareService from "../utilities/ShareService";
import { StorageService } from "../utilities/StorageService";
import AbilityScreen from "./AbilityScreen";
import CampaignLandingScreen from "./CampaignLandingScreen";
import CampaignSettingsScreen from "./CampaignSettingsScreen";
import CampaignsScreen from "./CampaignsScreen";
import CharacterSheetScreen from "./CharacterSheetScreen";
import CharacterStorageScreen from "./CharacterStorageScreen";
import ClassScreen from "./ClassScreen";
import DetailsScreen from "./DetailsScreen";
import EquipmentScreen from "./EquipmentScreen";
import ImportCharacterScreen from "./ImportCharacterScreen";
import LandingScreen from "./LandingScreen";
import PuristWebSheetScreen from "./PuristWebSheetScreen";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Rendered inside <Route path="/character/:id/*">.
 * On mount it looks up the character by ID from localStorage and hydrates
 * the context if needed. Renders null until hydration is done so the wizard
 * chrome doesn't flash in an empty state.
 */
function CharacterLoader({ characterContext }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { character, characterRolled, loadCharacterWithoutNavigate } = characterContext;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Already loaded and it's the same character — nothing to do.
    if (characterRolled && character.id === id) {
      setReady(true);
      return;
    }

    // Try saved characters first, then the partial character.
    const saved = StorageService.loadCharacters();
    const match = saved.find((c) => c.character.id === id);
    if (match) {
      loadCharacterWithoutNavigate(match);
      setReady(true);
      return;
    }

    const partial = StorageService.loadPartialCharacter();
    if (partial && partial.character.id === id) {
      loadCharacterWithoutNavigate(partial);
      setReady(true);
      return;
    }

    // ID not found — redirect to landing page.
    navigate('/');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ready) return null;
  return <Outlet />;
}

// TODO: Add typescript types to all props and state in this file, likely need
// to refactor some of the state management to make it more manageable and type
// safe. This is a large task and should be done in a separate branch.
export default function CharacterGenerator() {
  const campaignContext = useCampaignManager();
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
    <CampaignProvider value={campaignContext}>
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
                <Route
                  path="/character/:id/*"
                  element={<CharacterLoader characterContext={characterContext} />}
                >
                  <Route path="ability" element={<AbilityScreen />} />
                  <Route path="class" element={<ClassScreen />} />
                  <Route path="equipment" element={<EquipmentScreen />} />
                  <Route path="details" element={<DetailsScreen />} />
                  <Route path="sheet" element={<CharacterSheetScreen />} />
                </Route>
                <Route path="/tavern" element={<CharacterStorageScreen />} />
                <Route path="/campaigns" element={<CampaignsScreen />} />
                <Route path="/campaigns/:id/settings" element={<CampaignSettingsScreen />} />
                <Route path="/campaign/:id" element={<CampaignLandingScreen />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
      {/* Full-page sheet routes — outside wizard layout, covers all app chrome */}
      <Routes>
        <Route
          path="/character/:id/sheet/purist-web"
          element={<PuristWebSheetScreen />}
        />
      </Routes>
    </CharacterProvider>
    </CampaignProvider>
  );
}
