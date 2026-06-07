import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopsmart-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/${itemId}`),
  toggleSaveForLater: (itemId) => api.put(`/cart/${itemId}/save-for-later`),
  moveToCart: (itemId) => api.put(`/cart/${itemId}/move-to-cart`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/apply-coupon', { code })
};

export default cartService;
