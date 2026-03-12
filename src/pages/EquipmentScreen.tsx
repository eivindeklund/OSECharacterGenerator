import Header from "../components/general/Header";
import EquipmentStore from "../containers/equipment/EquipmentStore";
import { useCharacter } from "../contexts/CharacterContext";

export default function EquipmentScreen() {
  const {
    characterClass,
    characterModifiers,
    characterStatistics,
    setCharacterStatistics,
    characterEquipment,
    setCharacterEquipment,
    rollGold,
  } = useCharacter();

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
        rollGold={rollGold}
      ></EquipmentStore>
    </div>
  );
}


