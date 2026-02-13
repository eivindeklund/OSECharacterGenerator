import PropTypes from "prop-types";
import { useState } from "react";
import armourData from "../../data/armourData";

export default function ArmourOptionsContainer(props) {
  const { characterClass, purchaseLedger, handleUpdateLedger } = props;

  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleArmourSelect = (armourName) => {
    // Get list of all main armour names (excluding shield)
    const allArmours = armourData
      .filter((a) => a.id !== "shield")
      .map((a) => a.name);

    // Remove all existing armour from ledger
    allArmours.forEach((name) => {
      if (purchaseLedger[name]) handleUpdateLedger(name, 0);
    });
    // Add new armour to ledger
    handleUpdateLedger(armourName, 1);
  };

  const handleShieldToggle = (e) => {
    handleUpdateLedger("Shield", e.target.checked ? 1 : 0);
  };

  const currentArmour = armourData.find(
    (a) => a.id !== "shield" && purchaseLedger[a.name] > 0,
  );
  const selectedArmourName = currentArmour ? currentArmour.name : "Unarmoured";

  const hasShield = purchaseLedger["Shield"] > 0;

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
                  value="Unarmoured"
                  className="form-check-input"
                  onChange={() => handleArmourSelect("Unarmoured")} // Unarmoured means AC 10, no item. We should clear ledger.
                  // Actually "Unarmoured" is not an item in ledger usually.
                  // If "Unarmoured" is selected, we just ensure no other armour is in ledger.
                  checked={
                    selectedArmourName === "Unarmoured" || !selectedArmourName
                  }
                />
                Unarmoured - AC 9 [10] - 0 gp
              </label>

              {characterClass.armour.includes("leather") && (
                <label className="armour-radio">
                  <input
                    type="radio"
                    value="Leather"
                    className="form-check-input"
                    checked={selectedArmourName === "Leather"}
                    onChange={() => handleArmourSelect("Leather")}
                  />
                  <span className="radio--label">
                    Leather - AC 7 [12] - 20 gp
                  </span>
                </label>
              )}

              {characterClass.armour.includes("chainmail") && (
                <label className="armour-radio">
                  <input
                    type="radio"
                    value="Chainmail"
                    className="form-check-input"
                    checked={selectedArmourName === "Chainmail"}
                    onChange={() => handleArmourSelect("Chainmail")}
                  />
                  <span className="radio--label">
                    Chainmail - AC 5 [14] - 40 gp
                  </span>
                </label>
              )}

              {characterClass.armour.includes("plate") && (
                <label className="armour-radio">
                  <input
                    type="radio"
                    value="Plate mail"
                    className="form-check-input"
                    checked={selectedArmourName === "Plate mail"}
                    onChange={() => handleArmourSelect("Plate mail")}
                  />
                  <span className="radio--label">
                    Plate mail - AC 3 [16] - 60 gp
                  </span>
                </label>
              )}

              {characterClass.armour.includes("shield") && (
                <label className="armour-radio">
                  <input
                    type="checkbox"
                    value="Shield"
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

ArmourOptionsContainer.propTypes = {
  characterClass: PropTypes.object,
  purchaseLedger: PropTypes.object,
  handleUpdateLedger: PropTypes.func,
};
