import api from './api';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

const reviewService = {
  addReview: (data) => api.post('/reviews', data),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
};

export default reviewService;
