import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('shopsmart-token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('shopsmart-token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('shopsmart-token');
    }
  }, [token]);

  // Fetch user profile on mount if token exists
  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/auth/profile`);
      setUser(res.data?.data?.user || res.data?.user || res.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      // Backend returns: { success: true, data: { user, token } }
      const { token: newToken, user: userData } = res.data?.data || {};
      if (!newToken || !userData) throw new Error('Invalid response from server');
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('shopsmart-token', newToken);
      toast.success(`Welcome back, ${userData.name}! 🎉`);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      // Backend returns: { success: true, data: { user, token } }
      const { token: newToken, user: userData } = res.data?.data || {};
      if (!newToken || !userData) throw new Error('Invalid response from server');
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('shopsmart-token', newToken);
      toast.success('Account created successfully! 🎉');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  }, []);

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      setUser(res.data?.data?.user || res.data?.user || res.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_URL}/auth/change-password`, { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success('Password reset link sent to your email!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
