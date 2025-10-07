// src/pages/order management/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cartItems');
    if (stored) {
      // Ensure each item has quantity
      const parsed = JSON.parse(stored);
      return parsed.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i =>
        i.productId === item.productId &&
        i.variant.weight === item.variant.weight
      );
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && i.variant.weight === item.variant.weight
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (productId, variantWeight) => {
    setCartItems(prev => prev.filter(
      i => !(i.productId === productId && i.variant.weight === variantWeight)
    ));
  };

  const updateCart = (updatedItem) => {
    setCartItems(prev => prev.map(
      i => (i.productId === updatedItem.productId && i.variant.weight === updatedItem.variant.weight
        ? { ...i, ...updatedItem, quantity: updatedItem.quantity ?? i.quantity }
        : i)
    ));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
