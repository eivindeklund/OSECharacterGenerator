import { useMemo, useState } from "react";
import "../../css/PackOptions.css";
import { equipmentPacks } from "../../data/equipmentData";
import type { ClassOptionsData } from "../../types";
import {
  calculatePackPrice,
  getOptimalEquipmentPack,
  resolvePackItems,
} from "../../utilities/PackUtils";

const HOLY_SYMBOL_IDS = ["holy_symbol_silver", "holy_symbol_wooden", "holy_symbol_gold"];

// Type definitions
interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

const HOLY_SYMBOL_NAMES = ["Holy symbol (silver)", "Holy symbol (wooden)", "Holy symbol (gold)"];

interface PackOptionsContainerProps {
  characterClass: ClassOptionsData | null;
  gold: number | null;
  bxOnly: boolean;
  onBxOnlyChange: (value: boolean) => void;
  handleAddToLedger: (items: EquipmentItem[]) => void;
  /** Current inventory counts (keyed by display name). Used to suppress the
   *  holy symbol warning when the player has already purchased one separately. */
  purchaseLedger?: Record<string, number>;
}

const OPTIMAL_TAB_INDEX = 0;
// A seeded random source for re-rolls — each click swaps in a new seed.
function makeSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const PackOptionsContainer: React.FC<PackOptionsContainerProps> = ({ 
  characterClass, 
  gold,
  bxOnly,
  onBxOnlyChange,
  handleAddToLedger,
  purchaseLedger = {},
}) => {
  const [activeTab, setActiveTab] = useState<number>(OPTIMAL_TAB_INDEX);
  // Initialise with Math.random() so the visual regression tests (which replace
  // Math.random with a seeded LCG before the page loads) get a deterministic
  // first pack, while production runs still get genuine variety on each mount.
  const [rollSeed, setRollSeed] = useState<number>(() => Math.random());

  const className = characterClass ? characterClass.name : "";

  // Compute the content for the active tab.
  // Tab 0 is the dynamic "Suggested" pack; tabs 1+ map to the static equipmentPacks.
  const isOptimalTab = activeTab === OPTIMAL_TAB_INDEX;

  const random = useMemo(() => makeSeededRandom(rollSeed), [rollSeed]);

  const optimalItems = isOptimalTab
    ? getOptimalEquipmentPack(characterClass, gold ?? 0, bxOnly, random)
    : null;

  const activeStaticPack = !isOptimalTab
    ? equipmentPacks[activeTab - 1]
    : null;

  const rawItems = isOptimalTab ? optimalItems! : activeStaticPack!.items;
  const price: number = calculatePackPrice(rawItems, className);
  const contents: EquipmentItem[] = resolvePackItems(rawItems, className);

  const activePackName = isOptimalTab
    ? "Suggested"
    : activeStaticPack!.name;

  const canShowOptimal = gold !== null && characterClass !== null;

  // Warn when a divine-caster pack is missing a holy symbol — the character
  // can still adventure but cannot turn undead without one.
  const playerOwnsHolySymbol =
    HOLY_SYMBOL_NAMES.some((name) => (purchaseLedger[name] ?? 0) > 0);
  const isMissingHolySymbol: boolean =
    isOptimalTab &&
    canShowOptimal &&
    !!(characterClass?.magicTypeId === 'divine') &&
    !optimalItems?.some((item) => HOLY_SYMBOL_IDS.includes(item.id)) &&
    !playerOwnsHolySymbol;

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
          Suggested
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
          <p className="pack-no-gold">Roll for gold first to see your suggested loadout.</p>
        </div>
      ) : (
        <div className="pack-content">
          <div className="pack-header">
            <span className="pack-name">{activePackName}</span>
            <span className="pack-price">{price} gp</span>
            {isOptimalTab && (
              <button
                className="button button-small"
                onClick={() => setRollSeed(Date.now())}
              >
                Re-roll
              </button>
            )}
            <button
              className="button button-small"
              onClick={() => handleAddToLedger(contents)}
            >
              Buy Pack
            </button>
          </div>
          {isMissingHolySymbol && (
            <p
              role="alert"
              style={{
                color: "var(--color-danger, #c0392b)",
                border: "1px solid var(--color-danger, #c0392b)",
                borderRadius: "4px",
                padding: "6px 10px",
                marginTop: "6px",
                fontSize: "0.9em",
              }}
            >
              <strong>No holy symbol</strong> — your starting funds are too low
              to afford one. Your DM may object to beginning play without a holy
              symbol; more importantly, a Cleric cannot turn undead without one.
              Consider purchasing a holy symbol before you leave town.
            </p>
          )}
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
