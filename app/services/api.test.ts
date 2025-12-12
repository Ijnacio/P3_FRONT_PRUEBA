import { describe, it, expect } from "vitest";
import { 
  login, 
  register,
  getProductos, 
  getProducto,
  createVenta,
  getMisPedidos,
  updateProfile,
  getCategorias
} from "./api";

describe("API Service - Function Exports", () => {
  describe("Auth functions", () => {
    it("exports login function", () => {
      expect(login).toBeDefined();
      expect(typeof login).toBe("function");
    });

    it("exports register function", () => {
      expect(register).toBeDefined();
      expect(typeof register).toBe("function");
    });

    it("exports updateProfile function", () => {
      expect(updateProfile).toBeDefined();
      expect(typeof updateProfile).toBe("function");
    });
  });

  describe("Product functions", () => {
    it("exports getProductos function", () => {
      expect(getProductos).toBeDefined();
      expect(typeof getProductos).toBe("function");
    });

    it("exports getProducto function", () => {
      expect(getProducto).toBeDefined();
      expect(typeof getProducto).toBe("function");
    });

    it("exports getCategorias function", () => {
      expect(getCategorias).toBeDefined();
      expect(typeof getCategorias).toBe("function");
    });
  });

  describe("Venta functions", () => {
    it("exports createVenta function", () => {
      expect(createVenta).toBeDefined();
      expect(typeof createVenta).toBe("function");
    });

    it("exports getMisPedidos function", () => {
      expect(getMisPedidos).toBeDefined();
      expect(typeof getMisPedidos).toBe("function");
    });
  });
});
