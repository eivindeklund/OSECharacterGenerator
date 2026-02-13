import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "../Header";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  Trans: ({ i18nKey }) => <>{i18nKey}</>,
}));

describe("Header", () => {
  it("renders the header text", () => {
    render(<Header name="test-header" text="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass(
      "header--test-header",
    );
  });

  it("renders the translation key if translation prop is provided", () => {
    render(<Header name="test-header" translation="my.translation.key" />);
    expect(screen.getByText("my.translation.key")).toBeInTheDocument();
  });
});
