import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaKey, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!emailOrPhone) { toast.error('Please enter your email or mobile number'); return; }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(emailOrPhone);
      toast.success(res.data?.message || 'OTP Sent!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) { toast.error('Please enter the OTP'); return; }
    if (otp.length !== 6) { toast.error('OTP must be 6 digits'); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOTP(emailOrPhone, otp);
      setResetSessionToken(res.data?.data?.resetSessionToken);
      toast.success('OTP Verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) { toast.error('Please fill both password fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(resetSessionToken, password);
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Sunburst */}
      <div style={{ 
        position: 'absolute', left: -40, top: '65%', transform: 'translateY(-50%)', 
        width: 80, height: 80, borderRadius: '50%', background: 'transparent',
        border: '15px dashed #f97316', zIndex: 0, opacity: 0.8
      }} />

      {/* Left Pane - Forms */}
      <div className="d-flex flex-column align-items-center justify-content-center p-4 overflow-auto" style={{ flex: 1, zIndex: 1, position: 'relative' }}>
        <div className="w-100" style={{ maxWidth: 380 }}>
          
          <div className="text-center mb-5">
            <h1 style={{ color: '#111827', fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-1px', marginBottom: 5 }}>Reset Password</h1>
            <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>
              {step === 1 && "Enter your registered email or mobile number."}
              {step === 2 && `Enter the 6-digit OTP sent to ${emailOrPhone}`}
              {step === 3 && "Create a new, secure password."}
            </p>
          </div>

          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                  <span className="input-group-text border-0 bg-transparent ps-3 pe-2"><FaUser size={14} color="#9ca3af" /></span>
                  <input type="text" className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="Email or Mobile Number" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)}
                    style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
                </div>
              </div>
              <button type="submit" className="btn w-100 mb-4 shadow-sm" style={{ background: '#111827', color: 'white', borderRadius: 50, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px', transition: 'all 0.3s' }} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />SENDING OTP...</> : 'SEND OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                  <span className="input-group-text border-0 bg-transparent ps-3 pe-2"><FaKey size={14} color="#9ca3af" /></span>
                  <input type="text" maxLength={6} className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)}
                    style={{ fontSize: 16, color: '#374151', fontWeight: 700, letterSpacing: 4, textAlign: 'center' }} />
                </div>
              </div>
              <button type="submit" className="btn w-100 mb-4 shadow-sm" style={{ background: '#111827', color: 'white', borderRadius: 50, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px', transition: 'all 0.3s' }} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />VERIFYING...</> : 'VERIFY OTP'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setStep(1)} className="btn btn-link" style={{ fontSize: 12, color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Use a different email/phone</button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                  <span className="input-group-text border-0 bg-transparent ps-3 pe-2"><FaLock size={14} color="#9ca3af" /></span>
                  <input type={showPwd ? 'text' : 'password'} className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)}
                    style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
                  <button type="button" className="input-group-text border-0 bg-transparent pe-3 ps-2 shadow-none" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                    {showPwd ? <FaEyeSlash size={14} color="#9ca3af" /> : <FaEye size={14} color="#9ca3af" />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <div className="input-group input-group-lg" style={{ background: '#f3f4f6', borderRadius: 50, overflow: 'hidden', padding: '4px 8px' }}>
                  <span className="input-group-text border-0 bg-transparent ps-3 pe-2"><FaLock size={14} color="#9ca3af" /></span>
                  <input type={showPwd ? 'text' : 'password'} className="form-control border-0 bg-transparent ps-1 shadow-none" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    style={{ fontSize: 14, color: '#374151', fontWeight: 500 }} />
                </div>
              </div>
              <button type="submit" className="btn w-100 mb-4 shadow-sm" style={{ background: '#111827', color: 'white', borderRadius: 50, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px', transition: 'all 0.3s' }} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />UPDATING...</> : 'RESET PASSWORD'}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center mt-4">
            <Link to="/login" className="d-inline-flex align-items-center gap-2" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <FaArrowLeft size={12} /> Back to Login
            </Link>
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
