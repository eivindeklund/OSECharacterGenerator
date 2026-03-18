import { useState } from "react";
import CharacterClasses from "../../components/class/CharacterClasses";
import ClassOptionsButton from "../../components/class/ClassOptionsButton";
import Button from "../../components/general/Button";
import Checkbox from "../../components/general/Checkbox";
import Modal from "../../components/general/Modal";
import { useCampaign } from "../../contexts/CampaignContext";
import type { AbilityScores, ClassOptionsData } from "../../types";
import ClassDescription from "./ClassDescription";

interface ClassOptionsProps {
  characterClass: Pick<ClassOptionsData, 'name'>;
  abilityScores: AbilityScores;
  changeCharacterClass: React.MouseEventHandler<HTMLButtonElement>;
}

/** Returns the CSS modifier class for the wrapper border based on the XP value. */
function xpWrapperClass(selectable: boolean, xpMod: string | null, scoresRolled: boolean): string {
  if (!scoresRolled) return '';
  if (!selectable) return 'class-option-wrapper--xp-zero';
  const value = xpMod !== null ? parseInt(xpMod, 10) : 0;
  if (value > 0) return 'class-option-wrapper--xp-positive';
  if (value < 0) return 'class-option-wrapper--xp-negative';
  return '';
}

/** Returns the visible XP badge text, or a non-breaking space to hold layout. */
export function xpBadgeLabel(xpMod: string | null): string {
  if (xpMod === null) return '\u00A0';
  const value = parseInt(xpMod, 10);
  if (value > 0) return `+${xpMod} XP`;
  if (value < 0) return `${xpMod} XP`;
  return '\u00A0';
}

export default function ClassOptions(props: ClassOptionsProps) {
  const { characterClass, abilityScores, changeCharacterClass } = props;

  const { availableClasses, activeCampaign } = useCampaign();
  const allClasses = availableClasses();

  // Campaign lock flags: null = player controls, false = deny+hidden, true = allow+hidden
  const advLock = activeCampaign.allowAdvancedClasses;
  const carcassLock = activeCampaign.allowCarcassClasses;

  const [showAdvancedClasses, setShowAdvancedClasses] = useState(false);
  const [showCarcassClasses, setShowCarcassClasses] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClass, setModalClass] = useState<ClassOptionsData | null>(null);

  const scoresRolled = Object.values(abilityScores).every((v) => v !== null);

  const openModal = (cls) => {
    setModalClass(cls);
    setIsModalOpen(true);
  };

  const listClassOptions = (classType) => {
    const classData = allClasses.filter((item) => item.category === classType);

    return classData.map((item) => {
      const selectable = item.checkAbilityScoreRequirements(abilityScores);
      const xpMod = scoresRolled && selectable ? item.xpModifierPercentage(abilityScores) : null;
      const wrapperClass = xpWrapperClass(selectable, xpMod, scoresRolled);

      return (
        <div key={item.name} className={`class-option-wrapper ${wrapperClass}`}>
          <ClassOptionsButton
            characterClass={item}
            abilityScores={abilityScores}
            changeCharacterClass={changeCharacterClass}
            selected={characterClass.name === item.name}
          ></ClassOptionsButton>
          <span className="class-option-xp-badge">
            {xpBadgeLabel(xpMod)}
          </span>
          <button
            className="button button--info-icon"
            onClick={(e) => {
              openModal(item);
              e.currentTarget.blur();
            }}
            title={`${item.name} Details`}
          >
            i
          </button>
        </div>
      );
    });
  };

  return (
    <div className="class-options-container container">
      {characterClass.name && (
        <div className="selected-class-details-trigger">
          <Button 
            callback={() => openModal(characterClass)}
            name="class-details"
          >
            {characterClass.name} Details
          </Button>
        </div>
      )}

      <CharacterClasses
        classType="basic"
        callback={listClassOptions}
      ></CharacterClasses>

      <div className="advanced-classes-container">
        {advLock === null && (
          <div className="advanced-class-item">
            <span>Advanced Classes</span>
            <Checkbox
              value="Advanced Classes"
              checkedCondition={showAdvancedClasses}
              callback={() => setShowAdvancedClasses(!showAdvancedClasses)}
            />
          </div>
        )}
        {carcassLock === null && (
          <div className="advanced-class-item">
            <span>Carcass Crawler Classes</span>
            <Checkbox
              value="Carcass Crawler Classes"
              checkedCondition={showCarcassClasses}
              callback={() => setShowCarcassClasses(!showCarcassClasses)}
            />
          </div>
        )}
      </div>

      {(advLock === true || (advLock === null && showAdvancedClasses)) && (
        <CharacterClasses
          classType="advanced"
          callback={listClassOptions}
        ></CharacterClasses>
      )}

      {(carcassLock === true || (carcassLock === null && showCarcassClasses)) && (
        <CharacterClasses
          classType="carcass"
          callback={listClassOptions}
        ></CharacterClasses>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalClass ? `${modalClass.name} Details` : "Class Details"}
      >
        {modalClass && <ClassDescription characterClass={modalClass} abilityScores={abilityScores} />}
      </Modal>
    </div>
  );
}

