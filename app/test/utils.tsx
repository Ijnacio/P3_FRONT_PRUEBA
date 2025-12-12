import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { ThemeProvider, createTheme } from "@mui/material";

const testTheme = createTheme({
  palette: {
    primary: { main: "#8B4513" },
    secondary: { main: "#FFC0CB" },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={testTheme}>{children}</ThemeProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
