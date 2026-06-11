import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

// Cart key per user — agar user nahi to null
const cartKey = (userId) => userId ? `miskara_cart_${userId}` : null;

const loadCart = (userId) => {
  const key = cartKey(userId);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

const saveCartToStorage = (userId, items) => {
  const key = cartKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Jab bhi user change ho (login/logout) — us user ka cart load karo
  useEffect(() => {
    setCartItems(loadCart(user?._id));
  }, [user?._id]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return false; // signal to caller: not added
    }
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      const updated = existing
        ? prev.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...product, quantity }];
      saveCartToStorage(user._id, updated);
      return updated;
    });
    toast.success(`${product.name} added to cart`);
    return true;
  }, [user]);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i._id !== id);
      saveCartToStorage(user?._id, updated);
      return updated;
    });
  }, [user]);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) => {
      const updated = prev.map((i) => i._id === id ? { ...i, quantity } : i);
      saveCartToStorage(user?._id, updated);
      return updated;
    });
  }, [user]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    saveCartToStorage(user?._id, []);
  }, [user]);

  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart,
      updateQuantity, clearCart, totalPrice, totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
