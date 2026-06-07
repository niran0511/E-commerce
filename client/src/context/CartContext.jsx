import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Backend always returns: { success: true, data: { cart: { items: [...], savedForLater: [...] } } }
const extractCart = (res) => {
  const cart = res?.data?.data?.cart || res?.data?.data || {};
  const allItems = cart.items || [];
  const activeItems = allItems.filter(i => !i.savedForLater);
  const savedItems = allItems.filter(i => i.savedForLater);
  return { activeItems, savedItems };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 500 ? 0 : subtotal > 0 ? 50 : 0;
  const discount = coupon ? Math.round(subtotal * (coupon.discount || 0) / 100 * 100) / 100 : 0;
  const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/cart`);
      const { activeItems, savedItems: saved } = extractCart(res);
      setCartItems(activeItems);
      setSavedItems(saved);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      return { success: false };
    }
    try {
      const res = await axios.post(`${API_URL}/cart`, { productId, quantity });
      const { activeItems, savedItems: saved } = extractCart(res);
      setCartItems(activeItems);
      setSavedItems(saved);
      toast.success('Added to cart! 🛒');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete(`${API_URL}/cart/${itemId}`);
      const { activeItems, savedItems: saved } = extractCart(res);
      setCartItems(activeItems);
      setSavedItems(saved);
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      toast.error('Failed to remove item');
      return { success: false };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await axios.put(`${API_URL}/cart/${itemId}`, { quantity });
      const { activeItems, savedItems: saved } = extractCart(res);
      setCartItems(activeItems);
      setSavedItems(saved);
      return { success: true };
    } catch (error) {
      toast.error('Failed to update quantity');
      return { success: false };
    }
  };

  const toggleSaveForLater = async (itemId) => {
    try {
      const res = await axios.put(`${API_URL}/cart/${itemId}/save-for-later`);
      const { activeItems, savedItems: saved } = extractCart(res);
      setCartItems(activeItems);
      setSavedItems(saved);
      toast.success('Item saved for later');
      return { success: true };
    } catch (error) {
      toast.error('Failed to save item');
      return { success: false };
    }
  };

  const moveToCartFromSaved = async (itemId) => {
    try {
      const res = await axios.put(`${API_URL}/cart/${itemId}/move-to-cart`);
      const { activeItems, savedItems: saved } = extractCart(res);
      setCartItems(activeItems);
      setSavedItems(saved);
      toast.success('Item moved to cart');
      return { success: true };
    } catch (error) {
      toast.error('Failed to move item');
      return { success: false };
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await axios.post(`${API_URL}/coupons/apply`, { code, cartTotal: subtotal });
      const couponData = res.data?.data?.coupon || res.data?.coupon || res.data;
      setCoupon(couponData);
      toast.success('Coupon applied successfully! 🎉');
      return { success: true, coupon: couponData };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeCoupon = () => { setCoupon(null); toast.info('Coupon removed'); };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/cart`);
      setCartItems([]);
      setCoupon(null);
      return { success: true };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { success: false };
    }
  };

  const value = {
    cartItems, savedItems, cartCount, subtotal, tax, shipping,
    discount, total, coupon, loading, fetchCart, addToCart,
    removeFromCart, updateQuantity, toggleSaveForLater,
    moveToCartFromSaved, applyCoupon, removeCoupon, clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
