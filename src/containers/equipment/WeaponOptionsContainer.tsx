import type { ClassOptionsData } from "../../types";
import weaponsData from "../../data/weaponsData";
import { isUniversalWeapon } from "../../utilities/WeaponUtils";
import ItemOptionsContainer, { ItemData } from "./ItemOptionsContainer";

type WeaponOptionsContainerProps = {
  characterClass: ClassOptionsData
  purchaseLedger: Record<string, number>
  handleUpdateLedger: (name: string, quantity: number) => void
}

export default function WeaponOptionsContainer(props: WeaponOptionsContainerProps) {
  const { characterClass, purchaseLedger, handleUpdateLedger } = props;

  const renderItemDetails = (item: ItemData) => (
    <div style={{ fontSize: "0.8em", color: "#666" }}>{item.damage}</div>
  );

  const isItemStandard = (item: ItemData) =>
    characterClass.isStandardWeapon ? characterClass.isStandardWeapon(item) : true;

  const isItemUsable = (item: ItemData) =>
    isItemStandard(item) || isUniversalWeapon(item);

  return (
    <ItemOptionsContainer
      title={`${characterClass.name} Weapons`}
      items={weaponsData}
      purchaseLedger={purchaseLedger}
      handleUpdateLedger={handleUpdateLedger}
      restrictions={`Allowed Weapons: ${characterClass.weapons}`}
      defaultOpen={true}
      autoCloseOnSelect={true}
      renderItemDetails={renderItemDetails}
      isItemUsable={isItemUsable}
      isItemStandard={isItemStandard}
    />
  );
}


