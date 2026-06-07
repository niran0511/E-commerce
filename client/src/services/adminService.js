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

const adminService = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Products
  getProducts: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/admin/products?${queryStr}`);
  },
  addProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Orders
  getAllOrders: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/admin/orders?${queryStr}`);
  },
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

  // Users
  getAllUsers: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${queryStr}`);
  },
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Reviews
  getAllReviews: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/admin/reviews?${queryStr}`);
  },
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  addCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`)
};

export default adminService;
