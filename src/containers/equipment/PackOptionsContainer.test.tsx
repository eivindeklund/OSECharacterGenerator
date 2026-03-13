import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PackOptionsContainer from "./PackOptionsContainer";

// Minimal class fixtures
const fighterClass = {
  name: "Fighter",
  armour: "any leather, chainmail, plate, shields",
  weapons: "any",
  divine: false,
  arcane: false,
  canUseWeapon: () => true,
};

const clericClass = {
  name: "Cleric",
  armour: "any leather, chainmail, plate, shields",
  weapons: "blunt",
  divine: true,
  arcane: false,
  canUseWeapon: (w: { id: string }) =>
    ["mace", "warhammer", "club", "staff", "sling"].includes(w.id),
};

const defaultProps = {
  characterClass: fighterClass as any,
  gold: 100,
  bxOnly: true,
  onBxOnlyChange: vi.fn(),
  handleAddToLedger: vi.fn(),
};

describe("PackOptionsContainer", () => {
  describe("tab label", () => {
    it('shows "Suggested" as the first tab label', () => {
      render(<PackOptionsContainer {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Suggested" })).toBeInTheDocument();
    });

    it('does NOT show "Optimal" as a tab label', () => {
      render(<PackOptionsContainer {...defaultProps} />);
      expect(screen.queryByRole("button", { name: "Optimal" })).not.toBeInTheDocument();
    });

    it('shows "Suggested" as the active pack name in the content header', () => {
      render(<PackOptionsContainer {...defaultProps} />);
      // The pack name inside the pack-header span
      const packName = document.querySelector(".pack-name");
      expect(packName).toHaveTextContent("Suggested");
    });
  });

  describe("re-roll button", () => {
    it("renders a re-roll button on the Suggested tab", () => {
      render(<PackOptionsContainer {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /re-?roll/i })
      ).toBeInTheDocument();
    });

    it("clicking re-roll generates a new pack (content may change)", () => {
      // We verify the button is clickable without throwing, and that the
      // pack content area is still rendered afterwards.
      render(<PackOptionsContainer {...defaultProps} />);
      const rerollBtn = screen.getByRole("button", { name: /re-?roll/i });
      fireEvent.click(rerollBtn);
      expect(document.querySelector(".pack-contents-list")).toBeInTheDocument();
    });

    it("does NOT render the re-roll button on static pack tabs", () => {
      render(<PackOptionsContainer {...defaultProps} />);
      // Switch to Pack A (index 1)
      fireEvent.click(screen.getByRole("button", { name: "Pack A" }));
      expect(
        screen.queryByRole("button", { name: /re-?roll/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("cleric holy symbol warning", () => {
    it("does NOT show a warning when a non-cleric is selected", () => {
      render(<PackOptionsContainer {...defaultProps} />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does NOT show a warning when the Cleric pack already includes a holy symbol", () => {
      // At 100 gp the optimal Cleric pack should always include a holy symbol.
      render(
        <PackOptionsContainer
          {...defaultProps}
          characterClass={clericClass as any}
          gold={100}
        />
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does NOT show a warning when the player has already bought a holy symbol separately", () => {
      render(
        <PackOptionsContainer
          {...defaultProps}
          characterClass={clericClass as any}
          gold={20}
          purchaseLedger={{ "Holy symbol (silver)": 1 }}
        />
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows a warning when the Cleric pack is missing a holy symbol", () => {
      // 20 gp: warhammer (5 gp) exhasts all budget before the holy symbol (25 gp).
      render(
        <PackOptionsContainer
          {...defaultProps}
          characterClass={clericClass as any}
          gold={20}
        />
      );
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("warning mentions that the DM may object", () => {
      render(
        <PackOptionsContainer
          {...defaultProps}
          characterClass={clericClass as any}
          gold={20}
        />
      );
      const alert = screen.getByRole("alert");
      expect(alert.textContent?.toLowerCase()).toMatch(/dm|dungeon master/i);
    });

    it("warning mentions that the cleric cannot turn undead", () => {
      render(
        <PackOptionsContainer
          {...defaultProps}
          characterClass={clericClass as any}
          gold={20}
        />
      );
      const alert = screen.getByRole("alert");
      expect(alert.textContent?.toLowerCase()).toMatch(/turn undead|turning/i);
    });

    it("does NOT show a cleric warning on static pack tabs", () => {
      // Static packs always include a holy symbol placeholder; no warning needed.
      render(
        <PackOptionsContainer
          {...defaultProps}
          characterClass={clericClass as any}
          gold={20}
        />
      );
      // Switch to Pack A
      fireEvent.click(screen.getByRole("button", { name: "Pack A" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
