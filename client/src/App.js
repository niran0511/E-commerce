import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ChatProvider } from './context/ChatContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWidget from './components/chatbot/ChatWidget';
import ErrorBoundary from './components/common/ErrorBoundary';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ReturnPolicy from './pages/policies/ReturnPolicy';
import ShippingInfo from './pages/policies/ShippingInfo';
import AdminDashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import ManageReviews from './pages/admin/ManageReviews';
import ManageCoupons from './pages/admin/ManageCoupons';
import AdminTickets from './pages/admin/AdminTickets';
import ManageHero from './pages/admin/ManageHero';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="spinner-border text-primary" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// UserRoute: logged-in users only, admins redirected to admin panel
function UserRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="spinner-border text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="spinner-border text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

// GuestRedirect: sends unauthenticated visitors to /login
function GuestRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="spinner-border text-primary" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// AlreadyAuth: if logged in, redirect to correct destination
function AlreadyAuth({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="spinner-border text-primary" /></div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
}

function isAdminPath(pathname) {
  return pathname.startsWith('/admin');
}

function Layout({ children }) {
  const location = useLocation();
  const admin = isAdminPath(location.pathname);
  return (
    <>
      {!admin && <Navbar />}
      <main style={{ minHeight: '70vh' }}>{children}</main>
      {!admin && <Footer />}
      {!admin && <ChatWidget />}
    </>
  );
}

function AppRoutes() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<GuestRedirect><Home /></GuestRedirect>} />
          <Route path="/products" element={<GuestRedirect><Products /></GuestRedirect>} />
          <Route path="/products/:id" element={<GuestRedirect><ProductDetail /></GuestRedirect>} />
          <Route path="/login" element={<AlreadyAuth><Login /></AlreadyAuth>} />
          <Route path="/register" element={<AlreadyAuth><Register /></AlreadyAuth>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/shipping-info" element={<ShippingInfo />} />
          <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
          <Route path="/wishlist" element={<UserRoute><Wishlist /></UserRoute>} />
          <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
          <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />
          <Route path="/orders/:id" element={<UserRoute><OrderDetail /></UserRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><ManageReviews /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><ManageCoupons /></AdminRoute>} />
          <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
          <Route path="/admin/hero" element={<AdminRoute><ManageHero /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ChatProvider>
                <AppRoutes />
              </ChatProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
