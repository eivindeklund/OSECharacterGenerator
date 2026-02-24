import { useState } from "react";
import "../../css/PackOptions.css";
import { equipmentPacks } from "../../data/equipmentData";
import type { ClassOptionsData } from "../../types";
import {
  calculatePackPrice,
  getOptimalEquipmentPack,
  resolvePackItems,
} from "../../utilities/PackUtils";

// Type definitions
interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

interface PackOptionsContainerProps {
  characterClass: ClassOptionsData | null;
  gold: number | null;
  bxOnly: boolean;
  onBxOnlyChange: (value: boolean) => void;
  handleAddToLedger: (items: EquipmentItem[]) => void;
}

const OPTIMAL_TAB_INDEX = 0;

const PackOptionsContainer: React.FC<PackOptionsContainerProps> = ({ 
  characterClass, 
  gold,
  bxOnly,
  onBxOnlyChange,
  handleAddToLedger 
}) => {
  const [activeTab, setActiveTab] = useState<number>(OPTIMAL_TAB_INDEX);

  const className = characterClass ? characterClass.name : "";

  // Compute the content for the active tab.
  // Tab 0 is the dynamic "Optimal" pack; tabs 1+ map to the static equipmentPacks.
  const isOptimalTab = activeTab === OPTIMAL_TAB_INDEX;

  const optimalItems = isOptimalTab
    ? getOptimalEquipmentPack(characterClass, gold ?? 0, bxOnly)
    : null;

  const activeStaticPack = !isOptimalTab
    ? equipmentPacks[activeTab - 1]
    : null;

  const rawItems = isOptimalTab ? optimalItems! : activeStaticPack!.items;
  const price: number = calculatePackPrice(rawItems, className);
  const contents: EquipmentItem[] = resolvePackItems(rawItems, className);

  const activePackName = isOptimalTab
    ? "Optimal"
    : activeStaticPack!.name;

  const canShowOptimal = gold !== null && characterClass !== null;

  return (
    <div className="pack-options-container">
      <h3>Equipment Packs</h3>
      {isOptimalTab && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
            fontSize: "0.85em",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={bxOnly}
              onChange={(e) => onBxOnlyChange(e.target.checked)}
            />
            B/X items only
          </label>
        </div>
      )}
      <div className="pack-tabs">
        <button
          key="optimal"
          className={`pack-tab-button ${isOptimalTab ? "active" : ""}`}
          onClick={() => setActiveTab(OPTIMAL_TAB_INDEX)}
        >
          Optimal
        </button>
        {equipmentPacks.map((pack, index) => (
          <button
            key={pack.name}
            className={`pack-tab-button ${index + 1 === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(index + 1)}
          >
            {pack.name}
          </button>
        ))}
      </div>

      {isOptimalTab && !canShowOptimal ? (
        <div className="pack-content">
          <p className="pack-no-gold">Roll for gold first to see your optimal loadout.</p>
        </div>
      ) : (
        <div className="pack-content">
          <div className="pack-header">
            <span className="pack-name">{activePackName}</span>
            <span className="pack-price">{price} gp</span>
            <button
              className="button button-small"
              onClick={() => handleAddToLedger(contents)}
            >
              Buy Pack
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
      )}
    </div>
  );
};

export default PackOptionsContainer;
