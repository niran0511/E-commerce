import api from './api';


const couponService = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  applyCoupon: (code, subtotal) => api.post('/coupons/apply', { code, subtotal }),
};

export default couponService;
