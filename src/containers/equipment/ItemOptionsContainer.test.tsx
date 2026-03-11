import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ItemOptionsContainer, { ItemData } from "./ItemOptionsContainer";

const sword: ItemData = { id: "sword", name: "Sword", price: 10, category: "Blades" };
const dagger: ItemData = { id: "dagger", name: "Dagger", price: 3, category: "Blades" };
const torch: ItemData = { id: "torch", name: "Torch", price: 1, category: "Supplies" };
const rope: ItemData = { id: "rope", name: "Rope", price: 2 }; // no category → "General"

const defaultProps = {
  title: "My Items",
  items: [sword, dagger, torch],
  purchaseLedger: {},
  handleUpdateLedger: vi.fn(),
};

describe("ItemOptionsContainer", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<ItemOptionsContainer {...defaultProps} />);
      expect(screen.getByText("My Items")).toBeInTheDocument();
    });

    it("renders restrictions when provided", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          restrictions="Edged weapons only"
        />,
      );
      expect(screen.getByText("Edged weapons only")).toBeInTheDocument();
    });

    it("does not render restrictions element when not provided", () => {
      render(<ItemOptionsContainer {...defaultProps} />);
      expect(
        document.querySelector(".equipment-restrictions"),
      ).not.toBeInTheDocument();
    });

    it("renders category headers for each group", () => {
      render(<ItemOptionsContainer {...defaultProps} />);
      expect(screen.getByText("Blades")).toBeInTheDocument();
      expect(screen.getByText("Supplies")).toBeInTheDocument();
    });

    it("groups items without a category under 'General'", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          items={[rope]}
        />,
      );
      expect(screen.getByText("General")).toBeInTheDocument();
    });

    it("renders extra details via renderItemDetails", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          renderItemDetails={(item) => (
            <span data-testid="detail">{item.price} gold</span>
          )}
        />,
      );
      const details = screen.getAllByTestId("detail");
      expect(details.length).toBe(3);
      expect(details[0]).toHaveTextContent("10 gold");
    });
  });

  describe("closed by default", () => {
    it("hides items when a category is closed", () => {
      render(<ItemOptionsContainer {...defaultProps} />);
      expect(screen.queryByText("Sword")).not.toBeInTheDocument();
      expect(screen.queryByText("Torch")).not.toBeInTheDocument();
    });

    it("shows selected items (qty > 0) even when category is closed", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          purchaseLedger={{ sword: 1 }}
        />,
      );
      expect(screen.getByText("Sword")).toBeInTheDocument();
      expect(screen.queryByText("Dagger")).not.toBeInTheDocument();
    });

    it("shows 'N more items...' hint when some selected and some hidden", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          purchaseLedger={{ sword: 1 }}
        />,
      );
      expect(screen.getByText(/1 more/)).toBeInTheDocument();
    });
  });

  describe("defaultOpen", () => {
    it("shows all items when defaultOpen is true", () => {
      render(<ItemOptionsContainer {...defaultProps} defaultOpen={true} />);
      expect(screen.getByText("Sword")).toBeInTheDocument();
      expect(screen.getByText("Dagger")).toBeInTheDocument();
      expect(screen.getByText("Torch")).toBeInTheDocument();
    });
  });

  describe("toggling categories", () => {
    it("opens a closed category when its header is clicked", () => {
      render(<ItemOptionsContainer {...defaultProps} />);
      expect(screen.queryByText("Sword")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Blades"));

      expect(screen.getByText("Sword")).toBeInTheDocument();
      expect(screen.getByText("Dagger")).toBeInTheDocument();
    });

    it("closes an open category when its header is clicked again", () => {
      render(<ItemOptionsContainer {...defaultProps} defaultOpen={true} />);
      expect(screen.getByText("Sword")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Blades"));

      expect(screen.queryByText("Sword")).not.toBeInTheDocument();
    });

    it("toggling one category does not affect other categories", () => {
      render(<ItemOptionsContainer {...defaultProps} />);
      fireEvent.click(screen.getByText("Blades"));

      expect(screen.getByText("Sword")).toBeInTheDocument();
      expect(screen.queryByText("Torch")).not.toBeInTheDocument();
    });
  });

  describe("qty controls", () => {
    it("clicking + increments qty", () => {
      const handleUpdateLedger = vi.fn();
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          purchaseLedger={{ sword: 1 }}
          handleUpdateLedger={handleUpdateLedger}
        />,
      );

      const plusButtons = screen.getAllByText("+");
      fireEvent.click(plusButtons[0]); // first item in Blades = Sword

      expect(handleUpdateLedger).toHaveBeenCalledWith("sword", 2);
    });

    it("clicking - decrements qty", () => {
      const handleUpdateLedger = vi.fn();
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          purchaseLedger={{ sword: 2 }}
          handleUpdateLedger={handleUpdateLedger}
        />,
      );

      const minusButtons = screen.getAllByText("-");
      fireEvent.click(minusButtons[0]); // Sword

      expect(handleUpdateLedger).toHaveBeenCalledWith("sword", 1);
    });

    it("- button is disabled when qty is 0", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          purchaseLedger={{}}
        />,
      );

      const minusButtons = screen.getAllByRole("button", { name: "-" });
      minusButtons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  describe("row click", () => {
    it("clicking a row with qty=0 adds the item", () => {
      const handleUpdateLedger = vi.fn();
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          handleUpdateLedger={handleUpdateLedger}
        />,
      );

      fireEvent.click(screen.getByText("Sword").closest("li")!);

      expect(handleUpdateLedger).toHaveBeenCalledWith("sword", 1);
    });

    it("clicking a row with qty>0 does not add the item again", () => {
      const handleUpdateLedger = vi.fn();
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          purchaseLedger={{ sword: 1 }}
          handleUpdateLedger={handleUpdateLedger}
        />,
      );

      fireEvent.click(screen.getByText("Sword").closest("li")!);

      expect(handleUpdateLedger).not.toHaveBeenCalled();
    });
  });

  describe("autoCloseOnSelect", () => {
    it("closes the category after a row click when autoCloseOnSelect is true", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          autoCloseOnSelect={true}
          handleUpdateLedger={vi.fn()}
        />,
      );

      expect(screen.getByText("Sword")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Sword").closest("li")!);

      // Blades should now be closed — Sword only visible if qty > 0, which it isn't
      expect(screen.queryByText("Sword")).not.toBeInTheDocument();
    });

    it("does not auto-close when autoCloseOnSelect is false", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          autoCloseOnSelect={false}
          handleUpdateLedger={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText("Sword").closest("li")!);

      expect(screen.getByText("Sword")).toBeInTheDocument();
    });
  });

  describe("item usability and standard styling", () => {
    it("applies line-through when isItemUsable returns false", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          isItemUsable={(item) => item.name !== "Sword"}
        />,
      );

      const swordName = screen.getByText("Sword");
      expect(swordName).toHaveStyle({ textDecoration: "line-through" });

      const daggerName = screen.getByText("Dagger");
      expect(daggerName).toHaveStyle({ textDecoration: "none" });
    });

    it("applies bold when isItemStandard returns true", () => {
      render(
        <ItemOptionsContainer
          {...defaultProps}
          defaultOpen={true}
          isItemStandard={(item) => item.name === "Sword"}
        />,
      );

      expect(screen.getByText("Sword")).toHaveStyle({ fontWeight: "bold" });
      expect(screen.getByText("Dagger")).toHaveStyle({ fontWeight: "normal" });
    });
  });
});
