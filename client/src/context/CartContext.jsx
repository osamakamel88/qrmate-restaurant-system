import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('qrmate_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumber] = useState(() => {
    // Check URL query param ?table=5 or localStorage
    const params = new URLSearchParams(window.location.search);
    const tblParam = params.get('table');
    return tblParam ? parseInt(tblParam, 10) : (parseInt(localStorage.getItem('qrmate_table_num'), 10) || 5);
  });

  const [guestNotes, setGuestNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('qrmate_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('qrmate_table_num', tableNumber.toString());
    }
  }, [tableNumber]);

  const addToCart = (item, selectedModifiers = [], quantity = 1, itemNotes = '') => {
    let modifierExtraPrice = 0;
    selectedModifiers.forEach(m => {
      if (m.price) modifierExtraPrice += m.price;
    });

    const unitPrice = item.price + modifierExtraPrice;
    const cartItemId = `${item.id}-${JSON.stringify(selectedModifiers)}-${itemNotes}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          ...item,
          cartItemId,
          quantity,
          unitPrice,
          selectedModifiers,
          itemNotes
        }];
      }
    });
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(ci => ci.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setGuestNotes('');
    localStorage.removeItem('qrmate_cart');
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const taxVat = Math.round((subtotal * 0.14) * 100) / 100;
  const serviceFee = Math.round((subtotal * 0.12) * 100) / 100;
  const grandTotal = Math.round((subtotal + taxVat + serviceFee) * 100) / 100;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItemsCount,
      subtotal,
      taxVat,
      serviceFee,
      grandTotal,
      tableNumber,
      setTableNumber,
      guestNotes,
      setGuestNotes
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
