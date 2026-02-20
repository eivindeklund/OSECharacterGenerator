import React, { useState } from "react";
import equipmentData from "../../data/equipmentData";

interface EquipmentItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface GearItemRowProps {
  item: EquipmentItem;
  qty: number;
  handleUpdateLedger: (name: string, qty: number) => void;
}

const GearItemRow = ({ item, qty, handleUpdateLedger }: GearItemRowProps) => (
  <li
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px",
      borderBottom: "1px solid #eee",
      cursor: qty === 0 ? "pointer" : "default",
      backgroundColor: qty > 0 ? "#f0f8ff" : "transparent",
    }}
    onClick={() => {
      if (qty === 0) handleUpdateLedger(item.name, 1);
    }}
  >
    <span style={{ flex: 1, textAlign: "left" }}>{item.name}</span>
    <span style={{ width: "4em", textAlign: "right", marginRight: "0.7em" }}>
      {item.price} gp
    </span>

    <div
      className="qty-controls"
      style={{ display: "flex", alignItems: "center", gap: "5px" }}
      onClick={(e) => e.stopPropagation()} // Prevent row click from triggering when clicking controls
    >
      <button
        className="button button-small"
        style={{ padding: "0 5px", width: "1.5em" }}
        onClick={() => handleUpdateLedger(item.name, qty - 1)}
        disabled={qty === 0}
      >
        -
      </button>
      <span style={{ width: "20px", textAlign: "center" }}>{qty}</span>
      <button
        className="button button-small"
        style={{ padding: "0 5px", width: "1.5em" }}
        onClick={() => handleUpdateLedger(item.name, qty + 1)}
      >
        +
      </button>
    </div>
  </li>
);

interface GearOptionsContainerProps {
  purchaseLedger: Record<string, number>;
  handleUpdateLedger: (name: string, qty: number) => void;
}

export default function GearOptionsContainer(props: GearOptionsContainerProps) {
  const { purchaseLedger, handleUpdateLedger } = props;

  // State to track open categories
  // Initialize with all false (closed) or maybe true? User requested: "when a category is closed only the items in that category that has a count > 0 are visible"
  // Let's default to all closed for a cleaner UI initially? Or maybe open the first one?
  // Let's start with all closed.
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // group items by category
  const categories = equipmentData.reduce<Record<string, EquipmentItem[]>>((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <React.Fragment>
      <div className="equipment-container--header">Adventuring Gear</div>

      <div className="gear-container" style={{ display: "block" }}>
        {Object.entries(categories).map(([category, items]) => {
          const isOpen = openCategories[category];
          const itemsToRender = isOpen
            ? items
            : items.filter((item) => (purchaseLedger[item.name] || 0) > 0);

          const hasSelectedItems = items.some(
            (item) => (purchaseLedger[item.name] || 0) > 0,
          );

          if (!isOpen && itemsToRender.length === 0) {
            // If closed and no selected items, just show header
          }

          return (
            <div
              key={category}
              className="gear-category"
              style={{
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <div
                className="category-header"
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
                onClick={() => toggleCategory(category)}
              >
                <span>{category}</span>
                <span>{isOpen ? "▼" : "▶"}</span>
              </div>

              {(isOpen || itemsToRender.length > 0) && (
                <ul
                  className="gear-list"
                  style={{ listStyle: "none", padding: 0, margin: 0 }}
                >
                  {itemsToRender.map((item) => (
                    <GearItemRow
                      key={item.id}
                      item={item}
                      qty={purchaseLedger[item.name] || 0}
                      handleUpdateLedger={handleUpdateLedger}
                    />
                  ))}
                  {!isOpen &&
                    itemsToRender.length > 0 &&
                    items.length > itemsToRender.length && (
                      <li
                        style={{
                          padding: "5px",
                          color: "#888",
                          fontStyle: "italic",
                          fontSize: "0.9em",
                          textAlign: "center",
                        }}
                      >
                        + {items.length - itemsToRender.length} more items...
                      </li>
                    )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}

