import { useState } from "react";
import { useCampaign } from "../../contexts/CampaignContext";
import ItemOptionsContainer from "./ItemOptionsContainer";

interface GearOptionsContainerProps {
  purchaseLedger: Record<string, number>;
  handleUpdateLedger: (name: string, qty: number) => void;
}

export default function GearOptionsContainer({
  purchaseLedger,
  handleUpdateLedger,
}: GearOptionsContainerProps) {
  const { availableEquipment, activeCampaign } = useCampaign();

  const nonBxLock = activeCampaign.allowNonBxEquipment;
  // null = player controls; false = B/X only forced+hidden; true = all allowed+hidden
  const [bxOnly, setBxOnly] = useState(true);

  const effectiveBxOnly = nonBxLock === null ? bxOnly : nonBxLock === false;
  const allItems = availableEquipment();
  const filteredItems = effectiveBxOnly
    ? allItems.filter((item) => item.in_bx_basic || item.in_bx_expert)
    : allItems;

  return (
    <>
      {nonBxLock === null && (
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
              onChange={(e) => setBxOnly(e.target.checked)}
            />
            B/X items only
          </label>
        </div>
      )}
      <ItemOptionsContainer
        title="Adventuring Gear"
        items={filteredItems}
        purchaseLedger={purchaseLedger}
        handleUpdateLedger={handleUpdateLedger}
      />
    </>
  );
}

