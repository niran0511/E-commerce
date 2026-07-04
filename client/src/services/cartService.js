import api from './api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
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
