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
  return (
    <ItemOptionsContainer
      title="Adventuring Gear"
      items={equipmentData}
      purchaseLedger={purchaseLedger}
      handleUpdateLedger={handleUpdateLedger}
    />
  );
}

