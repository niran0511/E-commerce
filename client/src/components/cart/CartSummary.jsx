import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiX, FiShoppingBag, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const CartSummary = () => {
  const navigate = useNavigate();
  const { subtotal, tax, shipping, discount, total, coupon, applyCoupon, removeCoupon, cartItems } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode.trim());
    setApplying(false);
    setCouponCode('');
  };

  const hasItems = cartItems.length > 0;

  return (
    <div className="p-4" style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h5 className="mb-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#111827' }}>
        <FiShoppingBag className="me-2" />Order Summary
      </h5>

      {/* Coupon Input */}
      {!coupon && (
        <div className="mb-4">
          <div className="d-flex gap-2">
            <div className="position-relative flex-grow-1">
              <FiTag size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text" className="form-control"
                placeholder="Coupon code (try SAVE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                style={{ paddingLeft: 36, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
              />
            </div>
            <button className="btn btn-sm px-3 rounded-pill" onClick={handleApplyCoupon} disabled={applying || !couponCode.trim()}
              style={{ background: '#ff5722', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {applying ? '...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* Active Coupon Badge */}
      {coupon && (
        <div className="d-flex align-items-center justify-content-between mb-4 p-2 px-3"
          style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="d-flex align-items-center gap-2">
            <FiTag size={14} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>
              {coupon.code} — {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF applied!
            </span>
          </div>
          <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="d-flex flex-column gap-2 mb-3">
        {[
          { label: `Subtotal (${cartItems.length} item${cartItems.length !== 1 ? 's' : ''})`, value: `₹${(subtotal || 0).toLocaleString('en-IN')}` },
          { label: 'Tax (18% GST)', value: `₹${(tax || 0).toLocaleString('en-IN')}` },
          { label: 'Shipping', value: shipping === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span> : `₹${shipping}`, },
          ...(discount > 0 ? [{ label: 'Coupon Discount', value: <span style={{ color: 'var(--success)' }}>-₹{(discount || 0).toLocaleString('en-IN')}</span> }] : []),
        ].map((row, i) => (
          <div key={i} className="d-flex justify-content-between align-items-center">
            <span style={{ color: '#4b5563', fontSize: '0.88rem' }}>{row.label}</span>
            <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#111827' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <hr style={{ borderColor: '#f3f4f6', margin: '12px 0' }} />

      {/* Total */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>Total Payable</span>
        <span style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: "'Inter', sans-serif", color: '#ff5722' }}>
          ₹{(total || 0).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Free Shipping Progress */}
      {subtotal > 0 && subtotal < 500 && (
        <div className="mb-3 p-2 text-center" style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--warning)' }}>
          <FiTruck className="me-1" />Add ₹{(500 - subtotal).toLocaleString('en-IN')} more for FREE delivery!
        </div>
      )}
      {subtotal >= 500 && (
        <div className="mb-3 p-2 text-center" style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--success)' }}>
          <FiTruck className="me-1" />🎉 You qualify for FREE delivery!
        </div>
      )}

      {/* Checkout Button */}
      <button
        className="btn w-100 fw-700"
        onClick={() => navigate('/checkout')}
        disabled={!hasItems}
        style={{
          background: hasItems ? '#ff5722' : '#f3f4f6',
          color: hasItems ? 'white' : '#9ca3af',
          padding: '14px', fontSize: 16, fontWeight: 700,
          border: 'none', borderRadius: 8, transition: 'all 0.2s', cursor: hasItems ? 'pointer' : 'not-allowed',
        }}
      >
        {hasItems ? `Checkout` : 'Add items to checkout'}
      </button>

      {/* Trust Signals */}
      <div className="d-flex justify-content-center gap-3 mt-3">
        {[{ icon: '🔒', label: 'Secure' }, { icon: '🚚', label: 'Fast Delivery' }, { icon: '🔄', label: 'Easy Returns' }].map(t => (
          <div key={t.label} className="text-center">
            <div style={{ fontSize: 16 }}>{t.icon}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartSummary;
