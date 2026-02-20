import PropTypes from "prop-types";
import { useState } from "react";
import CharacterClasses from "../../components/class/CharacterClasses";
import ClassOptionsButton from "../../components/class/ClassOptionsButton";
import Button from "../../components/general/Button";
import Checkbox from "../../components/general/Checkbox";
import Modal from "../../components/general/Modal";
import classOptionsData from "../../data/classOptionsData";
import ClassDescription from "./ClassDescription";

export default function ClassOptions(props) {
  const { characterClass, abilityScores, changeCharacterClass } = props;

  const [advancedClassesDisplay, setAdvancedClassesDisplay] = useState(false);
  const [carcassClassesDisplay, setCarcassClassesDisplay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClass, setModalClass] = useState(null);

  const openModal = (cls) => {
    setModalClass(cls);
    setIsModalOpen(true);
  };

  const listClassOptions = (classType) => {
    const classData = classOptionsData.filter((characterClass) => {
      return characterClass.category === classType;
    });

    const classOptions = classData.map((item) => {
      return (
        <div key={item.name} className="class-option-wrapper">
          <ClassOptionsButton
            characterClass={item}
            abilityScores={abilityScores}
            changeCharacterClass={changeCharacterClass}
            selected={characterClass.name === item.name}
          ></ClassOptionsButton>
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
    return classOptions;
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
        <div className="advanced-class-item">
          <span>Advanced Classes</span>
          <Checkbox
            value="Advanced Classes"
            checkedCondition={advancedClassesDisplay}
            callback={() => setAdvancedClassesDisplay(!advancedClassesDisplay)}
          />
        </div>
        <div className="advanced-class-item">
          <span>Carcass Crawler Classes</span>
          <Checkbox
            value="Carcass Crawler Classes"
            checkedCondition={carcassClassesDisplay}
            callback={() => setCarcassClassesDisplay(!carcassClassesDisplay)}
          />
        </div>
      </div>

      {advancedClassesDisplay && (
        <CharacterClasses
          classType="advanced"
          callback={listClassOptions}
        ></CharacterClasses>
      )}

      {carcassClassesDisplay && (
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
        {modalClass && <ClassDescription characterClass={modalClass} />}
      </Modal>
    </div>
  );
}

ClassOptions.propTypes = {
  characterClass: PropTypes.object,
  abilityScores: PropTypes.shape({
    strength: PropTypes.number,
    strengthOriginal: PropTypes.number,
    intelligence: PropTypes.number,
    intelligenceOriginal: PropTypes.number,
    wisdom: PropTypes.number,
    wisdomOriginal: PropTypes.number,
    dexterity: PropTypes.number,
    dexterityOriginal: PropTypes.number,
    constitution: PropTypes.number,
    constitutionOriginal: PropTypes.number,
    charisma: PropTypes.number,
    charismaOriginal: PropTypes.number,
  }),
  changeCharacterClass: PropTypes.func,
};
