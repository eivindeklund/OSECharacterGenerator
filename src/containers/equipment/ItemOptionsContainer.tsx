import React, { useState } from "react";

export interface ItemData {
  id: string;
  name: string;
  price: number;
  category?: string;
  [key: string]: any;
}

interface ItemRowProps {
  item: ItemData;
  qty: number;
  handleUpdateLedger: (name: string, qty: number) => void;
  onSelect?: () => void;
  isUsable?: boolean;
  isStandard?: boolean;
  renderDetails?: (item: ItemData) => React.ReactNode;
}

const ItemRow = ({
  item,
  qty,
  handleUpdateLedger,
  onSelect,
  isUsable = true,
  isStandard = true,
  renderDetails,
}: ItemRowProps) => (
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
        handleUpdateLedger(item.id, 1);
        onSelect?.();
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
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontWeight: isStandard ? "bold" : "normal",
            textDecoration: isUsable ? "none" : "line-through",
          }}
        >
          {item.name}
        </div>
        {renderDetails && renderDetails(item)}
      </div>
      <div style={{ textAlign: "right", minWidth: "3.5em" }}>
        {item.price} gp
      </div>
    </div>

    <div
      className="qty-controls"
      style={{ display: "flex", alignItems: "center", gap: "5px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="button button-small"
        style={{ padding: "0 5px", width: "25px" }}
        onClick={() => handleUpdateLedger(item.id, qty - 1)}
        disabled={qty === 0}
      >
        -
      </button>
      <span style={{ width: "20px", textAlign: "center" }}>{qty}</span>
      <button
        className="button button-small"
        style={{ padding: "0 5px", width: "25px" }}
        onClick={() => handleUpdateLedger(item.id, qty + 1)}
      >
        +
      </button>
    </div>
  </li>
);

interface ItemOptionsContainerProps {
  title: string;
  items: ItemData[];
  purchaseLedger: Record<string, number>;
  handleUpdateLedger: (name: string, qty: number) => void;
  restrictions?: string;
  defaultOpen?: boolean;
  autoCloseOnSelect?: boolean;
  renderItemDetails?: (item: ItemData) => React.ReactNode;
  isItemUsable?: (item: ItemData) => boolean;
  isItemStandard?: (item: ItemData) => boolean;
}

export default function ItemOptionsContainer({
  title,
  items,
  purchaseLedger,
  handleUpdateLedger,
  restrictions,
  defaultOpen = false,
  autoCloseOnSelect = false,
  renderItemDetails,
  isItemUsable,
  isItemStandard,
}: ItemOptionsContainerProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      if (!defaultOpen) return {};
      const cats = [...new Set(items.map((i) => i.category ?? "General"))];
      return Object.fromEntries(cats.map((c) => [c, true]));
    },
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const categories = items.reduce<Record<string, ItemData[]>>((acc, item) => {
    const cat = item.category ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <React.Fragment>
      <div className="equipment-container--header">{title}</div>
      {restrictions && (
        <div className="equipment-restrictions">{restrictions}</div>
      )}

      <div className="gear-container" style={{ display: "block" }}>
        {Object.entries(categories).map(([category, catItems]) => {
          const isOpen = !!openCategories[category];
          const itemsToRender = isOpen
            ? catItems
            : catItems.filter((item) => (purchaseLedger[item.id] || 0) > 0);

          const handleSelect = autoCloseOnSelect
            ? () =>
                setOpenCategories((prev) => ({ ...prev, [category]: false }))
            : undefined;

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
                    <ItemRow
                      key={item.id}
                      item={item}
                      qty={purchaseLedger[item.id] || 0}
                      handleUpdateLedger={handleUpdateLedger}
                      onSelect={handleSelect}
                      isUsable={isItemUsable ? isItemUsable(item) : true}
                      isStandard={isItemStandard ? isItemStandard(item) : true}
                      renderDetails={renderItemDetails}
                    />
                  ))}
                  {!isOpen &&
                    itemsToRender.length > 0 &&
                    catItems.length > itemsToRender.length && (
                      <li
                        style={{
                          padding: "5px",
                          color: "#888",
                          fontStyle: "italic",
                          fontSize: "0.9em",
                          textAlign: "center",
                        }}
                      >
                        + {catItems.length - itemsToRender.length} more
                        items...
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
