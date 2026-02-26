import { Dispatch, SetStateAction } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import CheckBox from "../components/general/Checkbox";
import { lngs } from "../constants/constants";
import designed from "../img/designed.png";
import type { StoredCharacterData } from "../types";
import { LinkText } from "../utilities/utilities";

interface LandingScreenProps {
  diceEnabled: boolean;
  setDiceEnabled: Dispatch<SetStateAction<boolean>>;
  characterRolled: boolean;
  setCharacterRolled: Dispatch<SetStateAction<boolean>>;
  rollButtonHover: boolean;
  setRollButtonHover: Dispatch<SetStateAction<boolean>>;
  rollCharacter: () => void;
  isMobile: boolean;
  storedCharacters: StoredCharacterData[];
  partialCharacter: StoredCharacterData | null;
  discardPartialCharacter: () => void;
  loadCharacter: (data: StoredCharacterData) => void;
}

export default function LandingScreen(props: LandingScreenProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    diceEnabled,
    setDiceEnabled,
    characterRolled,
    setCharacterRolled,
    rollButtonHover,
    setRollButtonHover,
    rollCharacter,
    isMobile,
    storedCharacters,
    partialCharacter,
    discardPartialCharacter,
    loadCharacter,
  } = props;

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const isAtLanding = location.pathname === '/';
  const isPartialLanding = isAtLanding && !!partialCharacter;
  const isInitialLanding = isAtLanding && !characterRolled;

  const myCharacters = storedCharacters;

  return (
    <header
      className={`header ${(characterRolled && !isPartialLanding) ? "" : "header--initial"} ${
        rollButtonHover ? "header--hover" : ""
      }`}
    >
      <h2
        className={`title ${rollButtonHover ? "fade" : ""}`}
        style={{ fontSize: (characterRolled && !isPartialLanding) ? "1.4rem" : "" }}
      >
        <Trans i18nKey="AppName">OSE Character Generator</Trans>
      </h2>
      {isInitialLanding && !partialCharacter && (
        <button
          className={"button--roll button-primary"}
          onClick={rollCharacter}
          onMouseEnter={() => setRollButtonHover(true)}
          onMouseLeave={() => setRollButtonHover(false)}
        >
          <div>
            <Trans i18nKey="start">Start</Trans>
          </div>
        </button>
      )}

      {isAtLanding && partialCharacter && (
        <div className="partial-character-resume">
          <div className="partial-character-resume--info">
            {partialCharacter.characterClass?.name
              ? `In progress: ${partialCharacter.characterClass.name}`
              : 'In progress: character started'}
            {partialCharacter.character?.name
              ? ` — ${partialCharacter.character.name}`
              : ''}
          </div>
          <button
            className="button--roll button-primary"
            onClick={() => loadCharacter(partialCharacter)}
            onMouseEnter={() => setRollButtonHover(true)}
            onMouseLeave={() => setRollButtonHover(false)}
          >
            Continue
          </button>
          <button
            className="button--roll button--discard-partial"
            onClick={discardPartialCharacter}
          >
            Discard &amp; start new
          </button>
        </div>
      )}

      {(isInitialLanding || isPartialLanding) && (myCharacters?.length > 0 || !!partialCharacter) && (
        <button
          className={`button button--storage button-primary ${
            rollButtonHover ? "fade" : ""
          }`}
          onClick={() => {
            setCharacterRolled(true);
            navigate('/tavern');
          }}
        >
          <Trans i18nKey="Tavern"></Trans>
        </button>
      )}

      {(isInitialLanding || isPartialLanding) && (
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

      {(isInitialLanding || isPartialLanding) && (
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

