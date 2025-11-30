import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Producto, CartItem } from "../types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Producto) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  neto: number;
  iva: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Producto) => {
    setItems(current => {
      const existing = current.find(i => i.producto.id === product.id);
      if (existing) {
        return current.map(i => 
          i.producto.id === product.id 
            ? { ...i, cantidad: i.cantidad + 1 } 
            : i
        );
      }
      return [...current, { producto: product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(current => current.filter(i => i.producto.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(current => current.map(i => 
      i.producto.id === productId ? { ...i, cantidad: quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  // Cálculos financieros (Chile: IVA 19%)
  const total = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  const neto = Math.round(total / 1.19);
  const iva = total - neto;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, neto, iva }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}