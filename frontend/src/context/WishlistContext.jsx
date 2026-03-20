import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

const wishlistKey = (userId) => userId ? `miskara_wishlist_${userId}` : null;

const loadWishlist = (userId) => {
  const key = wishlistKey(userId);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

const saveWishlist = (userId, items) => {
  const key = wishlistKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load per-user wishlist on login/logout
  useEffect(() => {
    setWishlist(loadWishlist(user?._id));
  }, [user?._id]);

  const toggleWishlist = useCallback((product) => {
    if (!user) {
      toast.error('Please sign in to save favourites');
      return;
    }
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      const updated = exists
        ? prev.filter(p => p._id !== product._id)
        : [...prev, product];
      saveWishlist(user._id, updated);
      toast(exists ? 'Removed from Favourites' : 'Added to Favourites ♥', {
        icon: exists ? '🤍' : '❤️',
      });
      return updated;
    });
  }, [user]);

  const isWishlisted = useCallback((id) => {
    return wishlist.some(p => p._id === id);
  }, [wishlist]);

  const totalWishlist = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, totalWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};