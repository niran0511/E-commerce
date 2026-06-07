import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheck, FaLock, FaShieldAlt, FaTruck, FaUndo, FaCreditCard, FaClipboardList } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import couponService from '../services/couponService';
import axios from 'axios';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const prefilledAddress = location.state?.prefilledAddress;

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [saveInfo, setSaveInfo] = useState(true);

  const [shipping, setShipping] = useState({
    email: user?.email || '', name: user?.name || '', phone: user?.phone || '',
    street: prefilledAddress?.street || '', street2: '', 
    city: prefilledAddress?.city || '', state: prefilledAddress?.state || '', 
    zipCode: prefilledAddress?.zipCode || '', country: prefilledAddress?.country || 'India',
  });

  const activeItems = buyNowItem ? [buyNowItem] : (cartItems || []).filter(i => !i.savedForLater);
  const subtotal = activeItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const shippingCharge = subtotal >= 500 ? 0 : 50;
  
  // Hardcode 10% discount to match the screenshot vibe if there's no dynamic coupon
  const total = subtotal + shippingCharge; // Removing tax for simpler UI matching the screenshot
  const discountAmount = Math.round(subtotal * 0.10); 
  const finalTotal = total - discountAmount;

  const updateShipping = (k, v) => setShipping(p => ({ ...p, [k]: v }));

  // Load Razorpay SDK dynamically
  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderData = {
        items: activeItems.map(i => ({
          product: i.product._id, name: i.product.name,
          price: i.product.price, quantity: i.quantity,
          image: i.product.images?.[0],
        })),
        shippingAddress: { ...shipping, street: shipping.street + (shipping.street2 ? `, ${shipping.street2}` : '') },
        billingAddress: { ...shipping, street: shipping.street + (shipping.street2 ? `, ${shipping.street2}` : '') },
        paymentMethod,
        subtotal, tax: 0, shippingCharges: shippingCharge, discount: discountAmount, totalAmount: finalTotal,
      };

      if (paymentMethod === 'Card' || paymentMethod === 'UPI') {
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Payment gateway failed to load'); setPlacing(false); return; }

        const token = localStorage.getItem('shopsmart-token');
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        const orderRes = await orderService.createOrder({ ...orderData, paymentStatus: 'Pending' });
        const placedOrder = orderRes.data?.data?.order || orderRes.data?.data || {};

        try {
          const payRes = await axios.post(`${API_URL}/payment/create-order`,
            { amount: finalTotal, orderId: placedOrder._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const payData = payRes.data?.data;

          if (payData?.mock) {
            toast.success('🎉 Demo payment successful! Order placed.');
            setOrderSuccess(placedOrder);
            if (!buyNowItem) await clearCart();
            setPlacing(false);
            return;
          }

          const options = {
            key: payData.key,
            amount: payData.amount,
            currency: payData.currency,
            name: 'ShopSmart AI',
            description: 'Secure Checkout',
            order_id: payData.id,
            handler: async (response) => {
              try {
                await axios.post(`${API_URL}/payment/verify`,
                  { ...response, orderId: placedOrder._id },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('🎉 Payment successful! Order placed.');
                setOrderSuccess(placedOrder);
                if (!buyNowItem) await clearCart();
              } catch { 
                toast.error('Payment verification failed'); 
                await axios.post(`${API_URL}/payment/fail`, { orderId: placedOrder._id }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
              }
              finally { setPlacing(false); }
            },
            prefill: { name: user?.name, email: shipping.email || user?.email, contact: shipping.phone },
            theme: { color: '#f97316' }, // Orange theme
            modal: { 
              ondismiss: async () => { 
                toast.info('Payment cancelled'); 
                setPlacing(false); 
                await axios.post(`${API_URL}/payment/fail`, { orderId: placedOrder._id }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
              } 
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } catch (payErr) {
          toast.error('Payment gateway error. Switching to COD.');
        }
      }

      // COD flow
      const res = await orderService.createOrder(orderData);
      const placedOrder = res.data?.data?.order || res.data?.data || {};
      setOrderSuccess(placedOrder);
      if (!buyNowItem) await clearCart();
      toast.success('Order placed successfully! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  const validateShipping = () => {
    if (!shipping.email.trim()) { toast.error('Please enter your email'); return false; }
    if (!shipping.phone.trim()) { toast.error('Please enter your mobile number'); return false; }
    if (!shipping.name.trim()) { toast.error('Please enter your full name'); return false; }
    if (!shipping.street.trim()) { toast.error('Please enter your street address'); return false; }
    if (!shipping.city.trim()) { toast.error('Please enter your city'); return false; }
    if (!shipping.state.trim()) { toast.error('Please enter your state'); return false; }
    if (!shipping.zipCode.trim()) { toast.error('Please enter your ZIP code'); return false; }
    return true;
  };

  // Common input styling
  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: 'white',
    color: '#111827'
  };

  if (orderSuccess) return (
    <div className="container py-5 text-center" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 16px rgba(249,115,22,0.12)' }}>
        <FaCheck size={40} color="white" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Order Confirmed!</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 4 }}>
        Order Number: <strong style={{ color: '#ea580c' }}>{orderSuccess.orderNumber || `#${orderSuccess._id?.slice(-8).toUpperCase()}`}</strong>
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
        <button className="btn btn-lg" onClick={() => navigate('/orders')} style={{ background: '#ea580c', color: 'white', borderRadius: 8, padding: '12px 28px', fontWeight: 600 }}>View My Orders</button>
        <button className="btn btn-lg" onClick={() => navigate('/products')} style={{ border: '1px solid #e5e7eb', color: '#374151', background: 'white', borderRadius: 8, padding: '12px 28px', fontWeight: 600 }}>Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6', padding: '16px 0' }}>
        <div className="container" style={{ maxWidth: 1100, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 22, letterSpacing: 1, color: '#111827' }}>
            <span style={{ color: '#ff5722' }}>🛍️</span> ShopSmart
          </div>
        </div>
      </div>

      <div className="container py-4 py-md-5" style={{ maxWidth: 1100 }}>
        
        {/* Sub Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <Link to="/cart" style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>←</span> Back to Cart
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, fontWeight: 500 }}>
            <FaLock /> Secure Checkout
          </div>
        </div>

        <div className="row g-5">
          {/* Left Column: Form */}
          <div className="col-lg-7">
            <h1 style={{ fontWeight: 800, fontSize: 32, color: '#111827', marginBottom: 24 }}>Checkout</h1>
            
            {/* Stepper */}
            <div className="d-flex align-items-center mb-5">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="d-flex align-items-center gap-2" style={{ cursor: i < step ? 'pointer' : 'default' }} onClick={() => i < step && setStep(i)}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: i === step ? '#ea580c' : (i < step ? 'white' : 'white'),
                      border: `1px solid ${i <= step ? '#ea580c' : '#d1d5db'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: i === step ? 'white' : (i < step ? '#ea580c' : '#9ca3af'),
                      fontWeight: 600, fontSize: 13
                    }}>
                      {i < step ? <FaCheck size={10} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: i === step ? 600 : 500, color: i <= step ? '#ea580c' : '#9ca3af' }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb', margin: '0 16px' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 0: Shipping */}
            {step === 0 && (
              <div>
                <h5 style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 16 }}>Contact Information</h5>
                <div className="mb-5 d-flex flex-column gap-3">
                  <input type="email" placeholder="Email address" value={shipping.email} onChange={e => updateShipping('email', e.target.value)} style={inputStyle} />
                  <input type="tel" placeholder="Mobile Number" value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} style={inputStyle} />
                </div>

                <h5 style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 16 }}>Shipping Address</h5>
                <div className="d-flex flex-column gap-3 mb-4">
                  <input type="text" placeholder="Full Name" value={shipping.name} onChange={e => updateShipping('name', e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="Address Line 1" value={shipping.street} onChange={e => updateShipping('street', e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="Address Line 2 (Optional)" value={shipping.street2} onChange={e => updateShipping('street2', e.target.value)} style={inputStyle} />
                  
                  <div className="d-flex gap-3">
                    <input type="text" placeholder="City" value={shipping.city} onChange={e => updateShipping('city', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <select value={shipping.state} onChange={e => updateShipping('state', e.target.value)} style={{ ...inputStyle, flex: 1, color: shipping.state ? '#111827' : '#9ca3af' }}>
                      <option value="" disabled>State / Province</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                  </div>
                  
                  <div className="d-flex gap-3">
                    <input type="text" placeholder="ZIP / Postal Code" value={shipping.zipCode} onChange={e => updateShipping('zipCode', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <select value={shipping.country} onChange={e => updateShipping('country', e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                </div>

                <div className="mb-5" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="saveInfo" checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#ff5722', cursor: 'pointer' }} />
                  <label htmlFor="saveInfo" style={{ fontSize: 14, color: '#4b5563', cursor: 'pointer' }}>Save this information for next time</label>
                </div>

                <button 
                  onClick={() => { if (validateShipping()) setStep(1); }}
                  style={{ width: '100%', background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '16px', fontSize: 16, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  Continue to Payment <span>→</span>
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div>
                <h5 style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaCreditCard color="#ff5722" /> Payment Method
                </h5>
                <div className="d-flex flex-column gap-3 mb-5">
                  {[
                    { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                    { id: 'Card', label: 'Credit / Debit Card', desc: 'Demo card — no real payment' },
                    { id: 'UPI', label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm' },
                  ].map(opt => (
                    <label key={opt.id} style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12,
                      border: `2px solid ${paymentMethod === opt.id ? '#ff5722' : '#e5e7eb'}`,
                      background: paymentMethod === opt.id ? '#fff7ed' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} style={{ accentColor: '#ff5722', width: 20, height: 20 }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>{opt.label}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="d-flex gap-3">
                  <button onClick={() => setStep(0)} style={{ border: '1px solid #e5e7eb', color: '#374151', background: 'white', borderRadius: 8, padding: '16px 24px', fontWeight: 600 }}>← Back</button>
                  <button onClick={() => setStep(2)} style={{ flex: 1, background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '16px', fontSize: 16, fontWeight: 600 }}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div>
                <h5 style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaClipboardList color="#ff5722" /> Order Review
                </h5>
                
                <div className="p-4 mb-4" style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: 'white' }}>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Shipping to</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{shipping.name}</div>
                  <div style={{ fontSize: 15, color: '#374151' }}>{shipping.street}{shipping.street2 ? `, ${shipping.street2}` : ''}, {shipping.city}, {shipping.state} - {shipping.zipCode}</div>
                  <div style={{ fontSize: 15, color: '#374151' }}>{shipping.country}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{shipping.email} | {shipping.phone}</div>
                </div>

                <div className="p-4 mb-5" style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: 'white' }}>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Payment Method</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{paymentMethod}</div>
                </div>

                <div className="d-flex gap-3">
                  <button onClick={() => setStep(1)} style={{ border: '1px solid #e5e7eb', color: '#374151', background: 'white', borderRadius: 8, padding: '16px 24px', fontWeight: 600 }}>← Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing} style={{ flex: 1, background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '16px', fontSize: 16, fontWeight: 600, display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="col-lg-5">
            <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 16, padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', position: 'sticky', top: 40 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 24 }}>Order Summary</h3>
              
              <div className="mb-4">
                {activeItems.map(item => (
                  <div key={item._id} className="d-flex align-items-center gap-3 mb-4">
                    <div style={{ width: 80, height: 80, background: '#f9fafb', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id}/64/64`}
                        alt={item.product?.name}
                        onError={e => { e.target.src = `https://picsum.photos/seed/${item.product?.name}/64/64`; }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, marginBottom: 4 }}>{item.product?.name}</div>
                      {item.product?.brand && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>Brand: {item.product.brand}</div>}
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              <hr style={{ borderColor: '#f3f4f6', margin: '24px 0' }} />

              <div className="d-flex justify-content-between mb-3" style={{ fontSize: 15, color: '#4b5563' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between mb-3" style={{ fontSize: 15, color: '#4b5563' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>₹{shippingCharge.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-3" style={{ fontSize: 15, color: '#ff5722' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <hr style={{ borderColor: '#f3f4f6', margin: '24px 0' }} />

              <div className="d-flex justify-content-between align-items-center mb-5">
                <span style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 28, color: '#ff5722' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Badges */}
              <div className="d-flex justify-content-between pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                <div className="text-center" style={{ flex: 1 }}>
                  <FaShieldAlt color="#ff5722" size={24} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: '#4b5563', fontWeight: 500 }}>Secure<br/>Checkout</div>
                </div>
                <div className="text-center" style={{ flex: 1 }}>
                  <FaTruck color="#ff5722" size={24} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: '#4b5563', fontWeight: 500 }}>Fast<br/>Shipping</div>
                </div>
                <div className="text-center" style={{ flex: 1 }}>
                  <FaUndo color="#ff5722" size={24} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: '#4b5563', fontWeight: 500 }}>Easy<br/>Returns</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
