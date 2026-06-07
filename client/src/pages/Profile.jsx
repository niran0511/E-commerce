import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave,
  FaShoppingBag, FaHeart, FaWallet, FaSignOutAlt, FaStar,
  FaPlus, FaTrash, FaCamera, FaCheck, FaBox, FaTimes
} from 'react-icons/fa';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TABS = [
  { key: 'overview', label: 'Overview', icon: <FaUser /> },
  { key: 'orders', label: 'My Orders', icon: <FiPackage /> },
  { key: 'edit', label: 'Edit Profile', icon: <FaEdit /> },
  { key: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
  { key: 'wishlist', label: 'Wishlist', icon: <FaHeart /> },
];

const ORDER_STATUS_COLOR = {
  Pending: '#f59e0b', Processing: '#6366f1', Shipped: '#3b82f6',
  Delivered: '#10b981', Cancelled: '#ef4444', Refunded: '#8b5cf6',
};

const ORDER_STATUS_ICON = {
  Pending: <FiClock />, Processing: <FiPackage />, Shipped: <FiTruck />,
  Delivered: <FiCheckCircle />, Cancelled: <FiXCircle />, Refunded: <FiXCircle />,
};

export default function Profile() {
  const { user, logout, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
  const [addingAddress, setAddingAddress] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user) setEditForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'wishlist') fetchWishlist();
  }, [activeTab]); // eslint-disable-line

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      // Backend: GET /api/orders → { data: { orders: [...], pagination: {} } }
      const res = await orderService.getOrders();
      setOrders(res.data?.data?.orders || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setOrdersLoading(false); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API}/wishlist`);
      setWishlistItems(res.data?.data?.wishlist?.products || []);
    } catch {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(editForm);
    if (result?.success) toast.success('Profile updated successfully!');
    setSaving(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill all address fields'); return;
    }
    try {
      const updatedAddresses = [...(user?.addresses || []), newAddress];
      await updateProfile({ addresses: updatedAddresses });
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
      setAddingAddress(false);
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (idx) => {
    const updated = user.addresses.filter((_, i) => i !== idx);
    await updateProfile({ addresses: updated });
    toast.success('Address removed');
  };

  const handleSetDefault = async (idx) => {
    const updated = user.addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
    await updateProfile({ addresses: updated });
    toast.success('Default address updated');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const statCards = [
    { label: 'Orders', value: orders.length || '—', icon: <FaShoppingBag />, color: '#6366f1', to: null },
    { label: 'Wishlist', value: wishlistItems.length || '—', icon: <FaHeart />, color: '#ef4444', to: '/wishlist' },
    { label: 'Rewards', value: '0 pts', icon: <FaStar />, color: '#f59e0b', to: null },
    { label: 'Wallet', value: '₹0', icon: <FaWallet />, color: '#10b981', to: null },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1200 }}>

        {/* Header Banner */}
        <div className="rounded-4 mb-4 p-4 d-flex align-items-center gap-4 flex-wrap" style={{
          background: 'var(--gradient-primary)', color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          {/* Avatar */}
          <div className="position-relative" style={{ flexShrink: 0 }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
              width: 80, height: 80, background: 'rgba(255,255,255,0.25)', fontSize: 32, fontWeight: 800, border: '3px solid rgba(255,255,255,0.5)'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button className="btn btn-sm rounded-circle position-absolute" style={{ bottom: 0, right: 0, width: 28, height: 28, padding: 0, background: 'white', color: 'var(--primary)' }}>
              <FaCamera size={12} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, margin: 0, fontSize: '1.6rem' }}>{user?.name}</h2>
            <p style={{ opacity: 0.85, margin: '4px 0 0', fontSize: 14 }}>{user?.email} {user?.phone && `• ${user.phone}`}</p>
            {user?.role === 'admin' && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 700, marginTop: 6, display: 'inline-block' }}>ADMIN</span>}
          </div>
          <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10 }}>
            <FaSignOutAlt className="me-1" />Logout
          </button>
        </div>

        <div className="row g-4">
          {/* Sidebar Tabs */}
          <div className="col-md-3">
            <div className="custom-card p-2 mb-3">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="w-100 d-flex align-items-center gap-3 btn text-start mb-1"
                  style={{
                    borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 500,
                    background: activeTab === tab.key ? 'var(--gradient-primary)' : 'transparent',
                    color: activeTab === tab.key ? 'white' : 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ opacity: 0.85 }}>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>

            {/* Stat Cards */}
            <div className="d-flex flex-column gap-2">
              {statCards.map(s => (
                <div key={s.label} className="custom-card p-3 d-flex align-items-center gap-3" style={{ cursor: s.to ? 'pointer' : 'default' }}
                  onClick={() => s.to && navigate(s.to)}>
                  <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: s.color + '20', color: s.color, fontSize: 16 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">

            {/* ── OVERVIEW ─────────────────────────────── */}
            {activeTab === 'overview' && (
              <div>
                <div className="custom-card p-4 mb-4">
                  <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Account Details</h5>
                  {[
                    { icon: <FaUser />, label: 'Full Name', value: user?.name },
                    { icon: <FaEnvelope />, label: 'Email', value: user?.email },
                    { icon: <FaPhone />, label: 'Phone', value: user?.phone || 'Not set' },
                    { icon: <FaBox />, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                    { icon: <FaStar />, label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Customer' },
                  ].map((row, i) => (
                    <div key={i} className="d-flex align-items-center gap-3 py-3" style={{ borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 14, flexShrink: 0 }}>{row.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-gradient" style={{ borderRadius: 12, padding: '12px 28px', fontWeight: 700 }} onClick={() => setActiveTab('edit')}>
                  <FaEdit className="me-2" />Edit Profile
                </button>
              </div>
            )}

            {/* ── MY ORDERS ────────────────────────────── */}
            {activeTab === 'orders' && (
              <div>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>My Orders</h5>
                {ordersLoading ? (
                  <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary)' }} /></div>
                ) : orders.length === 0 ? (
                  <div className="custom-card p-5 text-center">
                    <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
                    <h5 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>No orders yet</h5>
                    <p style={{ color: 'var(--text-muted)' }}>Start shopping to see your orders here</p>
                    <Link to="/products" className="btn btn-gradient mt-2" style={{ borderRadius: 12, padding: '10px 24px' }}>Browse Products</Link>
                  </div>
                ) : orders.map(order => (
                  <div key={order._id} className="custom-card p-4 mb-3">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: 12, fontWeight: 700, color: ORDER_STATUS_COLOR[order.orderStatus] || '#6b7280', background: (ORDER_STATUS_COLOR[order.orderStatus] || '#6b7280') + '20', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {ORDER_STATUS_ICON[order.orderStatus]}{order.orderStatus}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {item.product?.name || 'Product'} × {item.quantity}
                        </div>
                      ))}
                      {order.items?.length > 3 && <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: 'var(--text-muted)' }}>+{order.items.length - 3} more</div>}
                    </div>
                    <Link to={`/orders/${order._id}`} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View Details →</Link>
                  </div>
                ))}
              </div>
            )}

            {/* ── EDIT PROFILE ─────────────────────────── */}
            {activeTab === 'edit' && (
              <div className="custom-card p-4">
                <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Edit Profile</h5>
                <form onSubmit={handleSaveProfile}>
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', icon: <FaUser />, placeholder: 'John Doe' },
                    { key: 'email', label: 'Email Address', type: 'email', icon: <FaEnvelope />, placeholder: 'john@example.com' },
                    { key: 'phone', label: 'Phone Number', type: 'tel', icon: <FaPhone />, placeholder: '+91 98765 43210' },
                  ].map(field => (
                    <div className="mb-4" key={field.key}>
                      <label className="form-label fw-600" style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>{field.label}</label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRight: 'none', color: 'var(--primary)' }}>{field.icon}</span>
                        <input type={field.type} className="form-control" placeholder={field.placeholder}
                          value={editForm[field.key]} onChange={e => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderLeft: 'none', padding: '12px 16px', fontSize: 15 }} />
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-gradient" disabled={saving} style={{ borderRadius: 12, padding: '12px 32px', fontWeight: 700, fontSize: 15 }}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><FaSave className="me-2" />Save Changes</>}
                  </button>
                </form>
              </div>
            )}

            {/* ── ADDRESSES ────────────────────────────── */}
            {activeTab === 'addresses' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Saved Addresses</h5>
                  <button className="btn btn-gradient btn-sm" onClick={() => setAddingAddress(!addingAddress)} style={{ borderRadius: 10, fontWeight: 600 }}>
                    <FaPlus className="me-1" />Add New
                  </button>
                </div>

                {addingAddress && (
                  <div className="custom-card p-4 mb-4" style={{ border: '2px dashed var(--primary)' }}>
                    <h6 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 16 }}>New Address</h6>
                    <form onSubmit={handleAddAddress}>
                      <div className="row g-3">
                        <div className="col-12">
                          <input className="form-control" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                        </div>
                        <div className="col-md-6">
                          <input className="form-control" placeholder="City" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                        </div>
                        <div className="col-md-6">
                          <input className="form-control" placeholder="State" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                        </div>
                        <div className="col-md-6">
                          <input className="form-control" placeholder="ZIP / Pincode" value={newAddress.zipCode} onChange={e => setNewAddress(p => ({ ...p, zipCode: e.target.value }))} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                        </div>
                        <div className="col-md-6">
                          <input className="form-control" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress(p => ({ ...p, country: e.target.value }))} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                        </div>
                        <div className="col-12 d-flex align-items-center gap-2">
                          <input type="checkbox" id="default-addr" checked={newAddress.isDefault} onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))} style={{ accentColor: 'var(--primary)' }} />
                          <label htmlFor="default-addr" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Set as default address</label>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button type="submit" className="btn btn-gradient btn-sm" style={{ borderRadius: 10, fontWeight: 600 }}><FaCheck className="me-1" />Save Address</button>
                        <button type="button" className="btn btn-sm" onClick={() => setAddingAddress(false)} style={{ borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}><FaTimes className="me-1" />Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {user?.addresses?.length === 0 || !user?.addresses ? (
                  <div className="custom-card p-5 text-center">
                    <div style={{ fontSize: 50, marginBottom: 12 }}>📍</div>
                    <h6 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>No addresses saved</h6>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add a delivery address for faster checkout</p>
                  </div>
                ) : user.addresses.map((addr, idx) => (
                  <div key={idx} className="custom-card p-4 mb-3 d-flex gap-3" style={{ border: addr.isDefault ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                      <FaMapMarkerAlt />
                    </div>
                    <div style={{ flex: 1 }}>
                      {addr.isDefault && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--gradient-primary)', color: 'white', borderRadius: 20, padding: '2px 10px', marginBottom: 6, display: 'inline-block' }}>DEFAULT</span>}
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{addr.street}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{addr.city}, {addr.state} — {addr.zipCode}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{addr.country}</div>
                      <div className="d-flex gap-2 mt-2">
                        {!addr.isDefault && <button className="btn btn-sm" onClick={() => handleSetDefault(idx)} style={{ fontSize: 12, background: 'var(--bg-secondary)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 8 }}>Set Default</button>}
                        <button className="btn btn-sm" onClick={() => handleDeleteAddress(idx)} style={{ fontSize: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8 }}><FaTrash className="me-1" />Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── WISHLIST ─────────────────────────────── */}
            {activeTab === 'wishlist' && (
              <div>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>My Wishlist</h5>
                {wishlistItems.length === 0 ? (
                  <div className="custom-card p-5 text-center">
                    <div style={{ fontSize: 60, marginBottom: 16 }}>❤️</div>
                    <h5 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Your wishlist is empty</h5>
                    <Link to="/products" className="btn btn-gradient mt-2" style={{ borderRadius: 12, padding: '10px 24px' }}>Explore Products</Link>
                  </div>
                ) : (
                  <div className="row g-3">
                    {wishlistItems.map((item, i) => {
                      const p = item.product || item;
                      return (
                        <div key={i} className="col-sm-6 col-lg-4">
                          <div className="custom-card p-3 h-100">
                            <img src={p.images?.[0] || 'https://via.placeholder.com/200x150?text=No+Image'} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'contain', borderRadius: 10, background: 'var(--bg-secondary)' }} />
                            <div className="mt-2">
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }} className="line-clamp-2">{p.name}</div>
                              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>₹{p.price?.toLocaleString('en-IN')}</div>
                              <Link to={`/products/${p._id}`} className="btn btn-sm w-100 mt-2 btn-gradient" style={{ borderRadius: 8, fontSize: 12 }}>View Product</Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
