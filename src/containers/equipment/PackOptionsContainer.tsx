import { useState } from "react";
import "../../css/PackOptions.css";
import { equipmentPacks } from "../../data/equipmentData";
import {
  calculatePackPrice,
  resolvePackItems,
} from "../../utilities/PackUtils";

// Type definitions
interface CharacterClass {
  name: string;
  category?: string;
  requirements?: string | null;
  primeReqs?: string[];
  hd?: number;
  maxLevel?: number;
  armour?: string;
  weapons?: string;
  isStandardWeapon?: (weapon: any) => boolean;
  languages?: string;
  description?: string;
  savingThrows?: number[];
  nextLevel?: number;
  abilities?: string[];
  link?: string;
  arcane?: boolean;
  divine?: boolean;
}

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

interface PackItem {
  id: string;
  quantity: number;
  options?: Array<{
    class?: string;
    default?: boolean;
    id: string;
  }>;
}

interface PackOptionsContainerProps {
  characterClass: CharacterClass | null;
  handleAddToLedger: (items: EquipmentItem[]) => void;
}

const PackOptionsContainer: React.FC<PackOptionsContainerProps> = ({ 
  characterClass, 
  handleAddToLedger 
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const className = characterClass ? characterClass.name : "";
  const activePack = equipmentPacks[activeTab];

  if (!activePack) return null;

  const price: number = calculatePackPrice(activePack.items, className);
  const contents: EquipmentItem[] = resolvePackItems(activePack.items, className);

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
            onClick={() => handleAddToLedger(contents)}
          >
            Add to Ledger
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

export default PackOptionsContainer;
