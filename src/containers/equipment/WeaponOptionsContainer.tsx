import PropTypes from "prop-types";
import weaponsData from "../../data/weaponsData";
import { isUniversalWeapon } from "../../utilities/WeaponUtils";
import ItemOptionsContainer, { ItemData } from "./ItemOptionsContainer";

export default function WeaponOptionsContainer(props) {
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

WeaponOptionsContainer.propTypes = {
  characterClass: PropTypes.object,
  purchaseLedger: PropTypes.object,
  handleUpdateLedger: PropTypes.func,
};
