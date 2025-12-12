import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "~/test/utils";
import Button from "./Button";

describe("Button", () => {
  it("renders with text content", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading spinner", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("is disabled while loading", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies fullWidth style", () => {
    render(<Button fullWidth>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ width: "100%" });
  });

  it("accepts custom className", () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders different variants", () => {
    const { rerender } = render(<Button variant="contained">Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    
    rerender(<Button variant="outlined">Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
