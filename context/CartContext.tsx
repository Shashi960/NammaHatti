'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types/order';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  uniqueShopsCount: number;
  getShopsInCart: () => Array<{ shopId: string; shopName: string; items: CartItem[]; shopSubtotal: number }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lm_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('lm_cart', JSON.stringify(newItems));
    } catch (e) {
      // ignore
    }
  };

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const existingIndex = items.findIndex((it) => it.productId === item.productId);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...items, { ...item, quantity }]);
    }
  };

  const removeItem = (productId: string) => {
    saveCart(items.filter((it) => it.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const updated = items.map((it) => (it.productId === productId ? { ...it, quantity } : it));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const getShopsInCart = () => {
    const map = new Map<string, { shopId: string; shopName: string; items: CartItem[]; shopSubtotal: number }>();
    for (const item of items) {
      if (!map.has(item.shopId)) {
        map.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
          items: [],
          shopSubtotal: 0,
        });
      }
      const entry = map.get(item.shopId)!;
      entry.items.push(item);
      entry.shopSubtotal += item.price * item.quantity;
    }
    return Array.from(map.values());
  };

  const uniqueShopsCount = new Set(items.map((it) => it.shopId)).size;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        uniqueShopsCount,
        getShopsInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
