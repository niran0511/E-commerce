import api from './api';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

const couponService = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  applyCoupon: (code, subtotal) => api.post('/coupons/apply', { code, subtotal }),
};

export default couponService;
