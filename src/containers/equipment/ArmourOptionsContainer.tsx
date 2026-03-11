import { useState } from "react";
import armourData, { ARMOUR_ID } from "../../data/armourData";
import type { ClassOptionsData } from "../../types";

type ArmourOptionsContainerProps = {
  characterClass: ClassOptionsData
  purchaseLedger: Record<string, number>
  handleUpdateLedger: (id: string, quantity: number) => void
}

export default function ArmourOptionsContainer(props: ArmourOptionsContainerProps) {
  const { characterClass, purchaseLedger, handleUpdateLedger } = props;

  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleArmourSelect = (armourId: string) => {
    // Get list of all main armour IDs (excluding shield)
    const allArmourIds = armourData
      .filter((a) => a.id !== ARMOUR_ID.shield)
      .map((a) => a.id);

    // Remove all existing armour from ledger
    allArmourIds.forEach((id) => {
      if (purchaseLedger[id]) handleUpdateLedger(id, 0);
    });
    // Add new armour to ledger (empty string = unarmoured, clears selection)
    if (armourId) {
      handleUpdateLedger(armourId, 1);
    }
  };

  const handleShieldToggle = (e) => {
    handleUpdateLedger(ARMOUR_ID.shield, e.target.checked ? 1 : 0);
  };

  const currentArmourEntry = armourData.find(
    (a) => a.id !== "shield" && a.id !== "unarmoured" && (purchaseLedger[a.id] || 0) > 0,
  );
  const selectedArmourId = currentArmourEntry ? currentArmourEntry.id : "unarmoured";

  const hasShield = (purchaseLedger[ARMOUR_ID.shield] || 0) > 0;

  return (
    <div className="armour-container-parent">
      <div
        className="equipment-container--header"
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={toggleOpen}
      >
        <span>{characterClass.name} Armour</span>
        <span>{isOpen ? "▼" : "▶"}</span>
      </div>

      {isOpen && (
        <>
          <div className="equipment-restrictions">
            Allowed Armour: {characterClass.armour}
          </div>

          <div className="armour-container">
            <div className="radio-container">
              <label className="armour-radio">
                <input
                  type="radio"
                  value="unarmoured"
                  className="form-check-input"
                  onChange={() => handleArmourSelect("")}
                  checked={selectedArmourId === "unarmoured"}
                />
                Unarmoured - AC 9 [10] - 0 gp
              </label>

              {characterClass.allowedArmour.includes(ARMOUR_ID.leather) && (
                <label className="armour-radio">
                  <input
                    type="radio"
                    value={ARMOUR_ID.leather}
                    className="form-check-input"
                    checked={selectedArmourId === ARMOUR_ID.leather}
                    onChange={() => handleArmourSelect(ARMOUR_ID.leather)}
                  />
                  <span className="radio--label">
                    Leather - AC 7 [12] - 20 gp
                  </span>
                </label>
              )}

              {characterClass.allowedArmour.includes(ARMOUR_ID.chainmail) && (
                <label className="armour-radio">
                  <input
                    type="radio"
                    value={ARMOUR_ID.chainmail}
                    className="form-check-input"
                    checked={selectedArmourId === ARMOUR_ID.chainmail}
                    onChange={() => handleArmourSelect(ARMOUR_ID.chainmail)}
                  />
                  <span className="radio--label">
                    Chainmail - AC 5 [14] - 40 gp
                  </span>
                </label>
              )}

              {characterClass.allowedArmour.includes(ARMOUR_ID.plateMail) && (
                <label className="armour-radio">
                  <input
                    type="radio"
                    value={ARMOUR_ID.plateMail}
                    className="form-check-input"
                    checked={selectedArmourId === ARMOUR_ID.plateMail}
                    onChange={() => handleArmourSelect(ARMOUR_ID.plateMail)}
                  />
                  <span className="radio--label">
                    Plate mail - AC 3 [16] - 60 gp
                  </span>
                </label>
              )}

              {characterClass.allowedArmour.includes(ARMOUR_ID.shield) && (
                <label className="armour-radio">
                  <input
                    type="checkbox"
                    value={ARMOUR_ID.shield}
                    className="form-check-input"
                    checked={hasShield}
                    onChange={handleShieldToggle}
                  />
                  Shield (AC +1 bonus) - 10gp
                </label>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


