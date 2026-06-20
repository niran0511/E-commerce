import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import BreadcrumbNav from '../components/common/Breadcrumb';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, savedItems, removeFromCart, updateQuantity, toggleSaveForLater, loading } = useCart();
  const navigate = useNavigate();
  const activeItems = cartItems.filter(i => !i.savedForLater);
  const savedForLaterItems = cartItems.filter(i => i.savedForLater);

  if (loading) return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-8">{[1,2,3].map(i => <div key={i} className="skeleton mb-3" style={{ height: 100, borderRadius: 12 }} />)}</div>
        <div className="col-lg-4"><div className="skeleton" style={{ height: 300, borderRadius: 12 }} /></div>
      </div>
    </div>
  );

  if (activeItems.length === 0 && savedForLaterItems.length === 0) return (
    <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 100, marginBottom: 24 }}>🛒</div>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 28 }}>Looks like you haven't added anything yet. Explore our amazing products!</p>
      <button className="btn btn-lg rounded-pill px-4" onClick={() => navigate('/products')} style={{ background: '#ff5722', color: 'white' }}>
        <FaShoppingBag className="me-2" /> Continue Shopping
      </button>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1400 }}>
        <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'Cart' }]} />
        <h1 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: 24 }}>
          Shopping Cart <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 400 }}>({activeItems.length} items)</span>
        </h1>

        <div className="row g-4">
          <div className="col-lg-8">
            {/* Cart Items */}
            {activeItems.length > 0 && (
              <div className="custom-card mb-4" style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                {activeItems.map((item, i) => (
                  <div key={item._id || i}>
                    <CartItem item={item} onUpdateQty={updateQuantity} onRemove={removeFromCart} onSaveForLater={toggleSaveForLater} />
                    {i < activeItems.length - 1 && <hr style={{ margin: 0, borderColor: 'var(--border-color)' }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Saved for Later */}
            {savedForLaterItems.length > 0 && (
              <div>
                <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 16 }}>Saved for Later ({savedForLaterItems.length})</h5>
                <div className="custom-card" style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                  {savedForLaterItems.map((item, i) => (
                    <div key={item._id || i}>
                      <CartItem item={item} onUpdateQty={updateQuantity} onRemove={removeFromCart} onSaveForLater={toggleSaveForLater} />
                      {i < savedForLaterItems.length - 1 && <hr style={{ margin: 0, borderColor: 'var(--border-color)' }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link to="/products" className="d-inline-flex align-items-center gap-2 mt-3" style={{ color: '#ea580c', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <FaArrowLeft size={12} /> Continue Shopping
            </Link>
          </div>

          <div className="col-lg-4">
            <div style={{ position: 'sticky', top: 80 }}>
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
