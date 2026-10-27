import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
  useThree: () => ({ size: { width: 800, height: 600 } }),
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => null,
  Text: () => null,
}));

describe("Condominio 3D Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard header", () => {
    render(<App />);
    expect(screen.getByText(/Condominio 3D Dashboard/i)).toBeInTheDocument();
  });

  it("shows 5 buildings x 9 departments in header", () => {
    render(<App />);
    expect(screen.getByText(/5 bloques × 9 departamentos/i)).toBeInTheDocument();
  });
});
