import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          brand: product.brand,
          unit: product.unit,
          pricePerUnit: product.pricePerUnit,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
    }
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
