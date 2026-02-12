import PropTypes from "prop-types";
import { useState } from "react";
import "../../css/PackOptions.css";
import { equipmentPacks } from "../../data/equipmentData";
import {
  calculatePackPrice,
  resolvePackItems,
} from "../../utilities/PackUtils";

const PackOptionsContainer = ({ characterClass, storeHandler }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Assuming characterClass prop is an object with a name property, based on EquipmentStore usage
  const className = characterClass ? characterClass.name : "";
  const activePack = equipmentPacks[activeTab];

  if (!activePack) return null;

  const price = calculatePackPrice(activePack.items, className);
  const contents = resolvePackItems(activePack.items, className);

  return (
    <div className="pack-options-container">
      <h3>Equipment Packs</h3>
      <div className="pack-tabs">
        {equipmentPacks.map((pack, index) => (
          <button
            key={pack.name}
            className={`pack-tab-button ${index === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            {pack.name}
          </button>
        ))}
      </div>

      <div className="pack-content">
        <div className="pack-header">
          <span className="pack-name">{activePack.name}</span>
          <span className="pack-price">{price} gp</span>
          <button
            className="button button-small"
            onClick={() => storeHandler(activePack, "buy", "pack")}
          >
            Buy
          </button>
        </div>
        <ul className="pack-contents-list">
          {contents.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              {item.quantity > 1 ? `${item.quantity}x ` : ""}
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

PackOptionsContainer.propTypes = {
  characterClass: PropTypes.object,
  storeHandler: PropTypes.func,
};

export default PackOptionsContainer;
