import type { Dispatch, SetStateAction } from "react";
import Header from "../components/general/Header";
import EquipmentStore from "../containers/equipment/EquipmentStore";
import type {
  CharacterEquipment,
  CharacterModifiers,
  CharacterStatistics,
  ClassOptionsData,
} from "../types";

type EquipmentScreenProps = {
  diceEnabled?: boolean
  characterClass: ClassOptionsData
  characterModifiers: CharacterModifiers
  characterStatistics: CharacterStatistics
  setCharacterStatistics: Dispatch<SetStateAction<CharacterStatistics>>
  characterEquipment: CharacterEquipment
  setCharacterEquipment: Dispatch<SetStateAction<CharacterEquipment>>
  rollGold: () => void
}

export default function EquipmentScreen(props: EquipmentScreenProps) {
  const {
    characterClass,
    characterModifiers,
    characterStatistics,
    setCharacterStatistics,
    characterEquipment,
    setCharacterEquipment,
    diceEnabled,
    rollGold,
  } = props;

  return (
    <div className="equipment-screen">
      <Header translation="equipment"></Header>

      <EquipmentStore
        characterClass={characterClass}
        characterModifiers={characterModifiers}
        characterStatistics={characterStatistics}
        setCharacterStatistics={setCharacterStatistics}
        characterEquipment={characterEquipment}
        setCharacterEquipment={setCharacterEquipment}
        diceEnabled={diceEnabled}
        rollGold={rollGold}
      ></EquipmentStore>
    </div>
  );
}


