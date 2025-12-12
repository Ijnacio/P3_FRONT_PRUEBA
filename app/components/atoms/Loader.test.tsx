import { describe, it, expect } from "vitest";
import { render, screen } from "~/test/utils";
import Loader from "./Loader";

describe("Loader", () => {
  it("renders with default message", () => {
    render(<Loader />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<Loader message="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("shows circular progress indicator", () => {
    render(<Loader />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders without message when empty string", () => {
    render(<Loader message="" />);
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });

  it("accepts custom size", () => {
    render(<Loader size={60} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders fullscreen mode", () => {
    render(<Loader fullScreen />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
  });
});
