import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the Web heading", () => {
    render(<Home />);
    expect(screen.getByText("Web")).toBeInTheDocument();
  });
});
