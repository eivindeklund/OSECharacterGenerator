import PropTypes from "prop-types";
import React, { useState } from "react";
import weaponsData from "../../data/weaponsData";
import { isUniversalWeapon } from "../../utilities/WeaponUtils";

const WeaponItemRow = ({
  item,
  qty,
  handleUpdateLedger,
  onSelect,
  isUsable,
  isStandard,
}) => (
  <li
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px",
      borderBottom: "1px solid #eee",
      cursor: qty === 0 ? "pointer" : "default",
      backgroundColor: qty > 0 ? "#f0f8ff" : "transparent",
      opacity: isUsable ? 1 : 0.6,
    }}
    onClick={() => {
      if (qty === 0) {
        handleUpdateLedger(item.name, 1);
        onSelect && onSelect();
      }
    }}
  >
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginRight: "10px",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: isStandard ? "bold" : "normal",
            textDecoration: isUsable ? "none" : "line-through",
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: "0.8em", color: "#666" }}>{item.damage}</div>
      </div>
      <div>{item.price} gp</div>
    </div>

    <div
      className="qty-controls"
      style={{ display: "flex", alignItems: "center", gap: "5px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="button button-small"
        style={{ padding: "0 5px", width: "25px" }}
        onClick={() => handleUpdateLedger(item.name, qty - 1)}
        disabled={qty === 0}
      >
        -
      </button>
      <span style={{ width: "20px", textAlign: "center" }}>{qty}</span>
      <button
        className="button button-small"
        style={{ padding: "0 5px", width: "25px" }}
        onClick={() => handleUpdateLedger(item.name, qty + 1)}
      >
        +
      </button>
    </div>
  </li>
);

WeaponItemRow.propTypes = {
  item: PropTypes.object.isRequired,
  qty: PropTypes.number.isRequired,
  handleUpdateLedger: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  isUsable: PropTypes.bool,
  isStandard: PropTypes.bool,
};

export default function WeaponOptionsContainer(props) {
  const { characterClass, purchaseLedger, handleUpdateLedger } = props;

  // "default open until a weapon is selected"
  // We initialize to true.
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Auto-close when a weapon is chosen (0 -> 1)
  const handleWeaponSelect = () => {
    setIsOpen(false);
  };

  // Filter items based on isOpen state
  // If open, show all. If closed, show only selected.
  const itemsToRender = isOpen
    ? weaponsData
    : weaponsData.filter((item) => (purchaseLedger[item.name] || 0) > 0);

  return (
    <React.Fragment>
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
        <span>{characterClass.name} Weapons</span>
        <span>{isOpen ? "▼" : "▶"}</span>
      </div>

      {isOpen && (
        <div className="equipment-restrictions">
          Allowed Weapons: {characterClass.weapons}
        </div>
      )}

      <div className="weapons-container" style={{ display: "block" }}>
        <ul className="weapons-list" style={{ listStyle: "none", padding: 0 }}>
          {itemsToRender.map((item) => {
            const isStandard = characterClass.isStandardWeapon
              ? characterClass.isStandardWeapon(item)
              : true;
            const isUsable = isStandard || isUniversalWeapon(item);

            return (
              <WeaponItemRow
                key={item.id}
                item={item}
                qty={purchaseLedger[item.name] || 0}
                handleUpdateLedger={handleUpdateLedger}
                onSelect={handleWeaponSelect}
                isUsable={isUsable}
                isStandard={isStandard}
              />
            );
          })}
          {!isOpen && itemsToRender.length === 0 && (
            <li style={{ fontStyle: "italic", color: "#888", padding: "5px" }}>
              No weapons selected. Click header to expand.
            </li>
          )}
        </ul>
      </div>
    </React.Fragment>
  );
}

WeaponOptionsContainer.propTypes = {
  characterClass: PropTypes.object,
  purchaseLedger: PropTypes.object,
  handleUpdateLedger: PropTypes.func,
};
