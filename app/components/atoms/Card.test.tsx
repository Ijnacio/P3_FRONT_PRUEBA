import { describe, it, expect } from "vitest";
import { render, screen } from "~/test/utils";
import Card from "./Card";

describe("Card", () => {
  it("renders children content", () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies hoverable styles", () => {
    render(<Card hoverable>Hover me</Card>);
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("accepts custom sx props", () => {
    render(<Card sx={{ padding: 2 }}>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as different variants", () => {
    const { rerender } = render(<Card variant="outlined">Test</Card>);
    expect(screen.getByText("Test")).toBeInTheDocument();
    
    rerender(<Card variant="elevation">Test</Card>);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("handles nested elements", () => {
    render(
      <Card>
        <div>Header</div>
        <div>Body</div>
      </Card>
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
