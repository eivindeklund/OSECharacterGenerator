import { useState } from "react";
import equipmentData from "../../data/equipmentData";
import ItemOptionsContainer from "./ItemOptionsContainer";

interface GearOptionsContainerProps {
  purchaseLedger: Record<string, number>;
  handleUpdateLedger: (name: string, qty: number) => void;
}

export default function GearOptionsContainer({
  purchaseLedger,
  handleUpdateLedger,
}: GearOptionsContainerProps) {
  const [bxOnly, setBxOnly] = useState(true);

  const filteredItems = bxOnly
    ? equipmentData.filter((item) => item.in_bx_basic || item.in_bx_expert)
    : equipmentData;

  return (
    <>
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
      <ItemOptionsContainer
        title="Adventuring Gear"
        items={filteredItems}
        purchaseLedger={purchaseLedger}
        handleUpdateLedger={handleUpdateLedger}
      />
    </>
  );
}

