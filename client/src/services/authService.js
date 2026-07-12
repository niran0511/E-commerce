import api from './api';


const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (emailOrPhone) => api.post('/auth/forgot-password', { emailOrPhone }),
  verifyOTP: (emailOrPhone, otp) => api.post('/auth/verify-otp', { emailOrPhone, otp }),
  resetPassword: (resetSessionToken, password) => api.post('/auth/reset-password', { resetSessionToken, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export default authService;
