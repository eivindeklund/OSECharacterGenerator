import { useMemo, useState } from "react";
import type { ClassOptionsData } from "../../types";
import { useCampaign } from "../../contexts/CampaignContext";
import { checkWeaponQuality, isUniversalWeapon } from "../../utilities/WeaponUtils";
import ItemOptionsContainer, { ItemData } from "./ItemOptionsContainer";

// Qualities to expose as filter toggle buttons
const QUALITY_FILTERS = [
  "Blunt",
  "Two-handed",
  "Slow",
  "Missile",
  "Brace",
  "Charge",
  "Reload",
  "Splash weapon",
];

type WeaponOptionsContainerProps = {
  characterClass: ClassOptionsData
  purchaseLedger: Record<string, number>
  handleUpdateLedger: (name: string, quantity: number) => void
}

export default function WeaponOptionsContainer(props: WeaponOptionsContainerProps) {
  const { characterClass, purchaseLedger, handleUpdateLedger } = props;

  const { availableWeapons } = useCampaign();

  const [classAppropriate, setClassAppropriate] = useState(true);
  const [activeQualities, setActiveQualities] = useState<Set<string>>(new Set());

  // TODO: Remove guard; canUseWeapon is always defined on characterClass.
  const isItemStandard = (item: ItemData) =>
    characterClass.canUseWeapon ? characterClass.canUseWeapon(item) : true;

  const isItemUsable = (item: ItemData) =>
    isItemStandard(item) || isUniversalWeapon(item);

  const toggleQuality = (quality: string) => {
    setActiveQualities(prev => {
      const next = new Set(prev);
      if (next.has(quality)) {
        next.delete(quality);
      } else {
        next.add(quality);
      }
      return next;
    });
  };

  const filteredWeapons = useMemo(() => {
    let weapons = availableWeapons() as ItemData[];

    if (classAppropriate) {
      weapons = weapons.filter(w => isItemUsable(w));
    }

    // Quality filter: OR logic — show weapons matching any selected quality
    if (activeQualities.size > 0) {
      weapons = weapons.filter(w =>
        [...activeQualities].some(q => checkWeaponQuality(w, q))
      );
    }

    return weapons;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classAppropriate, activeQualities, characterClass]);

  const renderItemDetails = (item: ItemData) => (
    <div style={{ display: "flex", gap: "8px", fontSize: "0.8em", color: "#666", flexWrap: "wrap" }}>
      <span>{item.damage}</span>
      {item.qualities && item.qualities.map((q: string) => (
        <span
          key={q}
          style={{
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            padding: "0 5px",
          }}
        >
          {q}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      <div
        className="weapon-filters"
        style={{
          padding: "8px 10px",
          backgroundColor: "#fafafa",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          <button
            className="button button-small"
            style={{
              backgroundColor: classAppropriate ? "#4a7c59" : "#e0e0e0",
              color: classAppropriate ? "#fff" : "#555",
              border: classAppropriate ? "1px solid #3a6347" : "1px solid #bbb",
              borderRadius: "12px",
              padding: "2px 10px",
              cursor: "pointer",
              fontSize: "0.85em",
              fontWeight: classAppropriate ? "bold" : "normal",
            }}
            onClick={() => setClassAppropriate(prev => !prev)}
          >
            ★ Class appropriate
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {QUALITY_FILTERS.map(quality => {
            const isActive = activeQualities.has(quality);
            return (
              <button
                key={quality}
                className="button button-small"
                style={{
                  backgroundColor: isActive ? "#2c5f8a" : "#e0e0e0",
                  color: isActive ? "#fff" : "#555",
                  border: isActive ? "1px solid #1e4a6e" : "1px solid #bbb",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontSize: "0.8em",
                  fontWeight: isActive ? "bold" : "normal",
                }}
                onClick={() => toggleQuality(quality)}
              >
                {quality}
              </button>
            );
          })}
        </div>
      </div>

      <ItemOptionsContainer
        title={`${characterClass.name} Weapons`}
        items={filteredWeapons}
        purchaseLedger={purchaseLedger}
        handleUpdateLedger={handleUpdateLedger}
        restrictions={`Allowed Weapons: ${characterClass.weapons}`}
        defaultOpen={true}
        autoCloseOnSelect={true}
        renderItemDetails={renderItemDetails}
        isItemUsable={classAppropriate ? undefined : isItemUsable}
        isItemStandard={classAppropriate ? undefined : isItemStandard}
      />
    </div>
  );
}


