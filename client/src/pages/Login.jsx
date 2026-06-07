import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect based on role
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result?.success !== false) {
        // Role-based redirect
        navigate(result.user?.role === 'admin' ? '/admin' : '/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Sunburst on Left Edge */}
      <div style={{ 
        position: 'absolute', left: -40, top: '65%', transform: 'translateY(-50%)', 
        width: 80, height: 80, borderRadius: '50%', background: 'transparent',
        border: '15px dashed #f97316', zIndex: 0, opacity: 0.8
      }} />

      {/* Left Pane - Login Form */}
      <div className="d-flex flex-column align-items-center justify-content-center p-4" style={{ flex: 1, zIndex: 1, position: 'relative' }}>
        
        <div className="w-100" style={{ maxWidth: 380 }}>
          <div className="text-center mb-5">
            <h1 style={{ color: '#111827', fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '3.5rem', letterSpacing: '-1px', marginBottom: 5 }}>Welcome</h1>
            <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>We are glad to see you back with us</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username / Email */}
            <div className="mb-3">
              <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                <span className="input-group-text border-0 bg-transparent ps-3 pe-2">
                  <FaUser size={14} color="#9ca3af" />
                </span>
                <input type="email" name="email" autoComplete="username" className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="Username" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                <span className="input-group-text border-0 bg-transparent ps-3 pe-2">
                  <FaLock size={14} color="#9ca3af" />
                </span>
                <input type={showPwd ? 'text' : 'password'} name="password" autoComplete="current-password" className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
                <button type="button" className="input-group-text border-0 bg-transparent pe-3 ps-2 shadow-none" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                  {showPwd ? <FaEyeSlash size={14} color="#9ca3af" /> : <FaEye size={14} color="#9ca3af" />}
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-end mb-4 me-2">
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn w-100 mb-4 shadow-sm" style={{ background: '#111827', color: 'white', borderRadius: 50, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px', transition: 'all 0.3s' }} disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />PROCESSING...</> : 'NEXT'}
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center mb-4">
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            <span style={{ padding: '0 15px', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Login with Others</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
          </div>

          {/* Social Logins */}
          <div className="d-flex flex-column gap-3 mb-5">
            <button type="button" onClick={() => toast.info('Google login coming soon!')} className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: 50, padding: '12px', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'background 0.2s' }}>
              <FaGoogle color="#DB4437" size={16} /> Login with Google
            </button>
            <button type="button" onClick={() => toast.info('Facebook login coming soon!')} className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: 50, padding: '12px', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'background 0.2s' }}>
              <FaFacebook color="#4267B2" size={16} /> Login with Facebook
            </button>
          </div>

          {/* Admin Demo Credentials helper */}
          <div className="text-center" style={{ fontSize: 11, color: '#9ca3af' }}>
            Demo: admin@shop.com / admin123 | <Link to="/register" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </div>
        </div>
      </div>

      {/* Right Pane - Image (Hidden on mobile) */}
      <div className="d-none d-lg-block" style={{ flex: 1.2, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("/login-bg-orange.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          margin: '40px'
        }} />
      </div>

    </div>
  );
}
