import { Dispatch, SetStateAction } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CircleLoader } from "react-spinners";
import CheckBox from "../components/general/Checkbox";
import { lngs } from "../constants/constants";
import designed from "../img/designed.png";
import type { ScreenState, StoredCharacterData } from "../types";
import { LinkText } from "../utilities/utilities";

interface LandingScreenProps {
  diceEnabled: boolean;
  setDiceEnabled: Dispatch<SetStateAction<boolean>>;
  characterRolled: boolean;
  setCharacterRolled: Dispatch<SetStateAction<boolean>>;
  rollButtonHover: boolean;
  setRollButtonHover: Dispatch<SetStateAction<boolean>>;
  loadingRandomNumbers: boolean;
  setLoadingRandomNumbers: Dispatch<SetStateAction<boolean>>;
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  rollCharacter: () => void;
  isMobile: boolean;
  storedCharacters: StoredCharacterData[];
}

export default function LandingScreen(props: LandingScreenProps) {
  const { t, i18n } = useTranslation();

  const {
    diceEnabled,
    setDiceEnabled,
    characterRolled,
    setCharacterRolled,
    rollButtonHover,
    setRollButtonHover,
    loadingRandomNumbers,
    screen,
    setScreen,
    rollCharacter,
    isMobile,
    storedCharacters,
  } = props;

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const myCharacters = storedCharacters;

  return (
    <header
      className={`header ${characterRolled ? "" : "header--initial"} ${
        rollButtonHover ? "header--hover" : ""
      }`}
    >
      <h2
        className={`title ${rollButtonHover ? "fade" : ""}`}
        style={{ fontSize: characterRolled ? "1.4rem" : "" }}
      >
        <Trans i18nKey="AppName">OSE Character Generator</Trans>
      </h2>
      {screen.abilityScreen && !characterRolled && (
        <button
          className={"button button--roll button-primary"}
          onClick={rollCharacter}
          disabled={!!loadingRandomNumbers}
          onMouseEnter={() => setRollButtonHover(true)}
          onMouseLeave={() => setRollButtonHover(false)}
        >
          {!loadingRandomNumbers && (
            <div>
              <Trans i18nKey="start">Start</Trans>
            </div>
          )}

          <div className="sweet-loading">
            <CircleLoader
              size={50}
              color={"white"}
              loading={loadingRandomNumbers}
            />
          </div>
        </button>
      )}

      {screen.abilityScreen && !characterRolled && myCharacters && myCharacters.length > 0 && (
        <button
          className={`button button--storage button-primary ${
            rollButtonHover ? "fade" : ""
          }`}
          onClick={() => {
            setScreen({
              ...screen,
              abilityScreen: false,
              characterStorageScreen: true,
            });
            setCharacterRolled(true);
          }}
        >
          <Trans i18nKey="Tavern"></Trans>
        </button>
      )}

      {screen.abilityScreen && !characterRolled && (
        <div
          className={`main-page--subheader ${rollButtonHover ? "fade" : ""} `}
        >
          {!isMobile && (
            <div className="dice-enabled-container">
              Dice Animations
              <CheckBox
                value={"dice-enabled"}
                callback={() => {
                  setDiceEnabled(!diceEnabled);
                }}
                checkedCondition={diceEnabled}
              ></CheckBox>
            </div>
          )}

          <div className="main-page--description">
            <a
              href="https://necroticgnome.com/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={designed}
                alt="Designed for use with Old-School Essentials"
                width="35%"
                height="35%"
              />
            </a>
          </div>

          <div className="main-page--language-options">
            {Object.keys(lngs).map((lng) => (
              <button
                key={lng}
                style={{
                  fontWeight: i18n.resolvedLanguage === lng ? "bold" : "normal",
                }}
                type="submit"
                onClick={() => i18n.changeLanguage(lng)}
                className="button button-primary"
              >
                {lngs[lng].nativeName}
              </button>
            ))}
          </div>
        </div>
      )}

      {screen.abilityScreen && !characterRolled && (
        <div
          className="main-page--created-by"
          style={{ opacity: rollButtonHover ? 0 : 1 }}
        >
          <Trans
            i18nKey="Footer"
            t={t}
            components={[
              <LinkText
                key={"link"}
                href="https://eviltables.dev/ose-character-generator/"
              />,
              <LinkText
                key={"link2"}
                href="https://github.com/matthewfee/OSECharacterGenerator/graphs/contributors"
              />,
              <LinkText
                key="Necrotic-Gnome"
                href="https://necroticgnome.com/"
              />,
              <LinkText
                key="James-Maliszewski."
                href="https://grognardia.blogspot.com/"
              />,
            ]}
          />
        </div>
      )}
    </header>
  );
}

