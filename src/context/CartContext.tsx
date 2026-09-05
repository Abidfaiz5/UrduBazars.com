import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Book, CartItem } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (book: Book, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (bookId: string, quantity: number) => boolean;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  generateWhatsAppOrderText: (customerInfo?: { name: string; phone: string; address: string; city: string; notes?: string }) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { books, settings } = useStore();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ub_cart_items');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ub_cart_items', JSON.stringify(cart));
  }, [cart]);

  // Keep cart items synchronized with latest book prices and stock availability
  useEffect(() => {
    if (books.length === 0) return;
    setCart(prevCart => {
      let modified = false;
      const updated = prevCart.map(item => {
        const liveBook = books.find(b => b.id === item.bookId);
        if (!liveBook) return item;

        // Cap quantity to current available stock
        const maxQty = Math.max(0, liveBook.availableStock);
        const newQty = Math.min(item.quantity, maxQty > 0 ? maxQty : 0);
        
        if (newQty !== item.quantity || liveBook.salePrice !== item.unitPrice) {
          modified = true;
          return {
            ...item,
            book: liveBook,
            unitPrice: liveBook.salePrice,
            quantity: newQty,
            subtotal: newQty * liveBook.salePrice
          };
        }
        return item;
      }).filter(item => item.quantity > 0);

      return modified ? updated : prevCart;
    });
  }, [books]);

  const addToCart = (book: Book, quantity: number = 1): { success: boolean; message?: string } => {
    // Check available stock in live database
    const liveBook = books.find(b => b.id === book.id) || book;
    if (liveBook.availableStock <= 0) {
      return { success: false, message: `Sorry, '${liveBook.title}' is currently Out of Stock.` };
    }

    const existingIndex = cart.findIndex(it => it.bookId === book.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > liveBook.availableStock) {
      return {
        success: false,
        message: `Only ${liveBook.availableStock} copy(ies) available. You already have ${currentQtyInCart} in cart.`
      };
    }

    setCart(prev => {
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          subtotal: newQty * next[existingIndex].unitPrice
        };
        return next;
      } else {
        const newItem: CartItem = {
          bookId: book.id,
          book: liveBook,
          quantity,
          unitPrice: liveBook.salePrice,
          discount: 0,
          subtotal: quantity * liveBook.salePrice
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
    return { success: true };
  };

  const updateQuantity = (bookId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return true;
    }

    const liveBook = books.find(b => b.id === bookId);
    const maxStock = liveBook ? liveBook.availableStock : 999;

    if (quantity > maxStock) {
      return false;
    }

    setCart(prev =>
      prev.map(it => {
        if (it.bookId === bookId) {
          return {
            ...it,
            quantity,
            subtotal: quantity * it.unitPrice
          };
        }
        return it;
      })
    );
    return true;
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(it => it.bookId !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, it) => sum + it.quantity, 0);
  const cartSubtotal = cart.reduce((sum, it) => sum + it.subtotal, 0);

  const generateWhatsAppOrderText = (customerInfo?: { name: string; phone: string; address: string; city: string; notes?: string }) => {
    const currency = settings?.currency || 'Rs.';
    let message = `📚 *NEW BOOK ORDER - URDU BAZARS*\n`;
    message += `----------------------------------------\n`;
    
    if (customerInfo) {
      message += `👤 *Customer:* ${customerInfo.name}\n`;
      message += `📞 *Phone:* ${customerInfo.phone}\n`;
      message += `📍 *Delivery Address:* ${customerInfo.address}, ${customerInfo.city}\n`;
      if (customerInfo.notes) message += `📝 *Notes:* ${customerInfo.notes}\n`;
      message += `----------------------------------------\n`;
    }

    message += `🛒 *ORDERED ITEMS:*\n`;
    cart.forEach((it, idx) => {
      message += `${idx + 1}. *${it.book.title}*\n   Qty: ${it.quantity} × ${currency} ${it.unitPrice} = ${currency} ${it.subtotal}\n`;
    });

    const delivery = cartSubtotal >= (settings?.freeDeliveryThreshold || 2500) ? 0 : (settings?.deliveryCharge || 200);
    const grandTotal = cartSubtotal + delivery;

    message += `----------------------------------------\n`;
    message += `📦 *Subtotal:* ${currency} ${cartSubtotal.toLocaleString()}\n`;
    message += `🚚 *Delivery Charge:* ${delivery === 0 ? 'FREE' : `${currency} ${delivery}`}\n`;
    message += `💰 *TOTAL AMOUNT:* ${currency} ${grandTotal.toLocaleString()}\n\n`;
    message += `_Sent via Urdu Bazars Online Portal ('کتاب سے دنیا تک')_`;

    return encodeURIComponent(message);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        generateWhatsAppOrderText
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
