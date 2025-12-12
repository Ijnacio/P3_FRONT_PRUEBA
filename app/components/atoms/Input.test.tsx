import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "~/test/utils";
import Input from "./Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "John" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("displays error message", () => {
    render(<Input label="Email" error helperText="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("marks field as required", () => {
    render(<Input label="Name" required />);
    expect(screen.getByLabelText(/Name/)).toBeRequired();
  });

  it("can be disabled", () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("accepts different types", () => {
    const { rerender } = render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    
    rerender(<Input label="Password" type="password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("displays helper text", () => {
    render(<Input label="Password" helperText="Min 8 characters" />);
    expect(screen.getByText("Min 8 characters")).toBeInTheDocument();
  });
});
