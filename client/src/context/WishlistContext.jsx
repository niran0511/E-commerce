import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Backend returns: { data: { wishlist: { products: [{ product: {...} }] } } }
const extractProducts = (res) => {
  const wishlist = res?.data?.data?.wishlist || {};
  return wishlist.products || [];
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]); // array of { product: {...} }
  const [loading, setLoading] = useState(false);

  const wishlistCount = wishlistItems.length;

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/wishlist`);
      setWishlistItems(extractProducts(res));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to wishlist');
      return { success: false };
    }
    try {
      const res = await axios.post(`${API_URL}/wishlist`, { productId });
      setWishlistItems(extractProducts(res));
      toast.success('Added to wishlist! ❤️');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.delete(`${API_URL}/wishlist/${productId}`);
      setWishlistItems(extractProducts(res));
      toast.success('Removed from wishlist');
      return { success: true };
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      return { success: false };
    }
  };

  const moveToCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/wishlist/${productId}/move-to-cart`);
      // Remove from local state
      setWishlistItems(prev => prev.filter(item => {
        const id = item.product?._id?.toString() || item._id?.toString();
        return id !== productId;
      }));
      toast.success('Moved to cart! 🛒');
      return { success: true };
    } catch (error) {
      toast.error('Failed to move to cart');
      return { success: false };
    }
  };

  // productId can be a string ID — checks if any wishlist entry matches
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => {
      const id = item.product?._id?.toString() || item._id?.toString() || item?.toString();
      return id === productId?.toString();
    });
  }, [wishlistItems]);

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) return await removeFromWishlist(productId);
    return await addToWishlist(productId);
  };

  const value = {
    wishlistItems, wishlistCount, loading, fetchWishlist,
    addToWishlist, removeFromWishlist, moveToCart, isInWishlist, toggleWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export default WishlistContext;
