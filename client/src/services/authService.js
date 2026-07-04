import api from './api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach token

// Response interceptor - handle errors
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
