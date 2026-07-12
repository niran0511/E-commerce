import api from './api';


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
