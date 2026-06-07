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

const orderService = {
  // POST /api/orders — create a new order
  createOrder: (orderData) => api.post('/orders', orderData),

  // GET /api/orders — get current user's orders
  // Response: { success, data: { orders: [...], pagination: {} } }
  getOrders: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/orders${queryStr ? '?' + queryStr : ''}`);
  },

  // alias for getOrders (same endpoint)
  getMyOrders: (params = {}) => orderService.getOrders(params),

  // GET /api/orders/:id
  getOrderById: (id) => api.get(`/orders/${id}`),

  // PUT /api/orders/:id/cancel
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),

  // PUT /api/orders/:id/return
  returnOrder: (id, reason) => api.put(`/orders/${id}/return`, { reason }),
};

export default orderService;
