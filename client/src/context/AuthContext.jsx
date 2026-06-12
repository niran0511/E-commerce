import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

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
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
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

  // Sync user with backend (find-or-create MongoDB user from Firebase user)
  const syncUserWithBackend = useCallback(async (idToken) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
      const res = await axios.post(`${API_URL}/auth/firebase-sync`);
      const userData = res.data?.data?.user;
      setUser(userData);
      setToken(idToken);
      return userData;
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const idToken = await fbUser.getIdToken();
        await syncUserWithBackend(idToken);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserWithBackend]);

  // Refresh Firebase token periodically (tokens expire every 1 hour)
  useEffect(() => {
    if (!firebaseUser) return;
    const interval = setInterval(async () => {
      try {
        const newToken = await firebaseUser.getIdToken(true);
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes
    return () => clearInterval(interval);
  }, [firebaseUser]);

  // Google Sign-In
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const userData = await syncUserWithBackend(idToken);
      if (userData) {
        toast.success(`Welcome, ${userData.name}! 🎉`);
        return { success: true, user: userData };
      }
      throw new Error('Sync failed');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') return { success: false };
      const message = error.message || 'Google sign-in failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      const userData = await syncUserWithBackend(idToken);
      if (userData) {
        toast.success(`Welcome back, ${userData.name}! 🎉`);
        return { success: true, user: userData };
      }
      throw new Error('Sync failed');
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  // Email/Password Registration
  const register = async (name, email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name on Firebase profile
      await firebaseUpdateProfile(result.user, { displayName: name });
      const idToken = await result.user.getIdToken();
      const userData = await syncUserWithBackend(idToken);
      if (userData) {
        toast.success('Account created successfully! 🎉');
        return { success: true, user: userData };
      }
      throw new Error('Sync failed');
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
    toast.info('You have been logged out.');
  }, []);

  // Update profile (backend only — name, phone, addresses etc.)
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

  // Change password (not applicable for Google-only users)
  const changePassword = async (currentPassword, newPassword) => {
    toast.info('Please use "Forgot Password" to reset your password.');
    return { success: false, message: 'Use forgot password flow.' };
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset link sent to your email!');
      return { success: true };
    } catch (error) {
      let message = 'Failed to send reset link.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/profile`);
      setUser(res.data?.data?.user || res.data?.user || res.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
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
