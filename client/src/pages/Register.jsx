import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!agreed) { toast.error('Please agree to terms'); return; }
    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password);
      if (result?.success !== false) {
        navigate('/');
      }
    } catch (err) {
      toast.error('Registration failed');
    } finally { setLoading(false); }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result?.success) {
        navigate(result.user?.role === 'admin' ? '/admin' : '/', { replace: true });
      }
    } catch (err) {
      // Error already handled in AuthContext
    } finally { setGoogleLoading(false); }
  };

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Sunburst on Left Edge */}
      <div style={{ 
        position: 'absolute', left: -40, top: '65%', transform: 'translateY(-50%)', 
        width: 80, height: 80, borderRadius: '50%', background: 'transparent',
        border: '15px dashed #f97316', zIndex: 0, opacity: 0.8
      }} />

      {/* Left Pane - Register Form */}
      <div className="d-flex flex-column align-items-center justify-content-center p-4 overflow-auto" style={{ flex: 1, zIndex: 1, position: 'relative', maxHeight: '100vh' }}>
        
        <div className="w-100 py-4" style={{ maxWidth: 380 }}>
          <div className="text-center mb-4">
            <h1 style={{ color: '#111827', fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-1px', marginBottom: 5 }}>Join Us</h1>
            <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>Create your account to start shopping</p>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', type: 'text', icon: <FaUser size={14} color="#9ca3af" />, placeholder: 'Full Name', autocomplete: 'name' },
              { key: 'email', type: 'email', icon: <FaEnvelope size={14} color="#9ca3af" />, placeholder: 'Email Address', autocomplete: 'username' },
            ].map(field => (
              <div className="mb-3" key={field.key}>
                <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                  <span className="input-group-text border-0 bg-transparent ps-3 pe-2">{field.icon}</span>
                  <input type={field.type} name={field.key} autoComplete={field.autocomplete} className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder={field.placeholder} value={form[field.key]} onChange={e => update(field.key, e.target.value)}
                    style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
                </div>
              </div>
            ))}

            {/* Password */}
            <div className="mb-3">
              <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                <span className="input-group-text border-0 bg-transparent ps-3 pe-2"><FaLock size={14} color="#9ca3af" /></span>
                <input type={showPwd ? 'text' : 'password'} name="password" autoComplete="new-password" className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="Password (Min. 6 chars)" value={form.password} onChange={e => update('password', e.target.value)}
                  style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
                <button type="button" className="input-group-text border-0 bg-transparent pe-3 ps-2 shadow-none" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                  {showPwd ? <FaEyeSlash size={14} color="#9ca3af" /> : <FaEye size={14} color="#9ca3af" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                <span className="input-group-text border-0 bg-transparent ps-3 pe-2"><FaLock size={14} color="#9ca3af" /></span>
                <input type="password" name="confirmPassword" autoComplete="new-password" className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                  style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
              </div>
            </div>

            <div className="form-check mb-4 d-flex align-items-center gap-2">
              <input className="form-check-input mt-0" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: '#f97316', cursor: 'pointer', width: 16, height: 16 }} />
              <label className="form-check-label" style={{ fontSize: 12, color: '#6b7280', cursor: 'pointer', marginTop: 2 }}>
                I agree to the <span style={{ color: '#f97316', fontWeight: 600 }}>Terms</span> and <span style={{ color: '#f97316', fontWeight: 600 }}>Privacy Policy</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn w-100 mb-4 shadow-sm" style={{ background: '#111827', color: 'white', borderRadius: 50, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px', transition: 'all 0.3s' }} disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />CREATING ACCOUNT...</> : 'SIGN UP'}
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center mb-4">
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            <span style={{ padding: '0 15px', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Sign Up with Others</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
          </div>

          {/* Social Logins */}
          <div className="d-flex flex-column gap-3 mb-4">
            <button type="button" onClick={handleGoogleSignUp} disabled={googleLoading} className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: 50, padding: '12px', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'background 0.2s' }}>
              {googleLoading ? <><span className="spinner-border spinner-border-sm me-2" />Connecting...</> : <><FaGoogle color="#DB4437" size={16} /> Sign up with Google</>}
            </button>
            <button type="button" onClick={() => toast.info('Facebook registration coming soon!')} className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: 50, padding: '12px', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'background 0.2s' }}>
              <FaFacebook color="#4267B2" size={16} /> Sign up with Facebook
            </button>
          </div>

          <div className="text-center" style={{ fontSize: 13, color: '#6b7280' }}>
            Already have an account? <Link to="/login" style={{ color: '#111827', textDecoration: 'none', fontWeight: 700, marginLeft: 4 }}>Login</Link>
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
