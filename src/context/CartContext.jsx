import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "shop_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Optimization: Memoize cart manipulation functions to prevent downstream consumers
  // from re-rendering if the provider's parent triggers a re-render.
  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, qty }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id, qty) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  // Optimization: Memoize calculated values (subtotal and count) so that they are only recalculated
  // when the list of items actually changes.
  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }, [items]);

  const count = useMemo(() => {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }, [items]);

  // Optimization: Memoize the entire context value object. Without this, a new object reference
  // is created on every render, triggering rendering in all components consuming CartContext.
  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    setQty,
    clearCart,
    subtotal,
    count
  }), [items, addItem, removeItem, setQty, clearCart, subtotal, count]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
