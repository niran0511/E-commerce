import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegUser, FaRegListAlt, FaHeadset, FaRegCreditCard, FaRegClock, FaGift, FaChevronRight } from 'react-icons/fa';
import Pagination from '../components/common/Pagination';
import orderService from '../services/orderService';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('My Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Select date range');
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 5;
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getOrders()
      .then(r => setOrders(r.data?.data?.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    // Status Filter
    if (filter === 'In Progress' && !['Processing', 'Confirmed', 'Shipped', 'OutForDelivery'].includes(o.orderStatus)) return false;
    if (filter === 'Delivered' && o.orderStatus !== 'Delivered') return false;
    if (filter === 'Cancelled' && !['Cancelled', 'Returned', 'Refunded'].includes(o.orderStatus)) return false;

    // Date Filter
    if (dateFilter !== 'Select date range') {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === 'Last 30 days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < thirtyDaysAgo) return false;
      } else if (dateFilter === 'Last 6 months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        if (orderDate < sixMonthsAgo) return false;
      } else {
        // Assume it's a specific year like "2023"
        const year = parseInt(dateFilter, 10);
        if (orderDate.getFullYear() !== year) return false;
      }
    }
    return true;
  });

  const paginated = filteredOrders.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);
  const totalPages = Math.ceil(filteredOrders.length / LIMIT);

  const SIDEBAR_MENU = [
    { name: 'My Profile', icon: <FaRegUser />, path: '/profile' },
    { name: 'My Orders', icon: <FaRegListAlt /> },
    { name: 'Customer Care', icon: <FaHeadset /> },
    { name: 'Saved cards', icon: <FaRegCreditCard /> },
    { name: 'Pending payments', icon: <FaRegClock /> },
    { name: 'Gift cards', icon: <FaGift /> },
  ];

  const getStatusDisplay = (status) => {
    if (['Processing', 'Confirmed', 'Shipped', 'OutForDelivery'].includes(status)) {
      return { text: 'In progress', color: '#e65100', bg: '#fff3e0' }; // Orange
    }
    if (status === 'Delivered') {
      return { text: 'Delivered', color: '#2e7d32', bg: '#e8f5e9' }; // Green
    }
    return { text: status, color: '#c62828', bg: '#ffebee' }; // Red/Cancelled
  };

  if (loading) return (
    <div className="container py-5">
      {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton mb-4" style={{ height: 160, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', background: 'white', borderRadius: 16, display: 'flex', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '80vh' }}>
        
        {/* Sidebar */}
        <div style={{ width: 280, borderRight: '1px solid #f0f0f0', padding: '40px 20px', flexShrink: 0 }}>
          {SIDEBAR_MENU.map(item => {
            const isActive = activeTab === item.name;
            return (
              <div key={item.name} 
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                  } else {
                    setActiveTab(item.name);
                  }
                }}
                style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', 
                borderRadius: 8, cursor: 'pointer', marginBottom: 8,
                background: isActive ? '#fff0f3' : 'transparent',
                color: isActive ? '#8e1c2e' : '#6b7280',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 15 }}>{item.name}</span>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          
          {/* Top Nav (Breadcrumbs) */}
          <div className="mb-4">
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, display: 'flex', gap: 8 }}>
              <span>Home</span>
              <span>&gt;</span>
              <span>My Account</span>
              <span>&gt;</span>
              <span style={{ color: '#111827' }}>{activeTab}</span>
            </div>
          </div>

          {activeTab === 'My Orders' && (
            <>
              {/* Filters */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex gap-3">
              {['All', 'In Progress', 'Delivered', 'Cancelled'].map(f => (
                <button key={f} 
                  onClick={() => { setFilter(f); setCurrentPage(1); }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 20,
                    border: f === filter ? '1px solid #8e1c2e' : '1px solid #e5e7eb',
                    background: 'white',
                    color: f === filter ? '#8e1c2e' : '#6b7280',
                    fontWeight: f === filter ? 600 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                  {f}
                </button>
              ))}
            </div>
            
            <div>
              <select 
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e5e7eb', color: '#6b7280', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                <option value="Select date range">Select date range</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 6 months">Last 6 months</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          {/* Order List */}
          <div className="d-flex flex-column gap-4">
            {filteredOrders.length === 0 ? (
               <div className="text-center py-5" style={{ color: '#6b7280' }}>
                 No orders found for this filter.
               </div>
            ) : (
              paginated.map(order => {
                const s = getStatusDisplay(order.orderStatus);
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                
                // Get item names summary
                let itemNames = order.items?.[0]?.name || 'Product';
                if (order.items?.length > 1) {
                  itemNames += ` & ${order.items.length - 1} more items`;
                }

                return (
                  <div key={order._id} 
                    onClick={() => navigate(`/orders/${order._id}`)}
                    style={{ 
                      border: '1px solid #f0f0f0', borderRadius: 12, padding: '20px', 
                      background: 'white', cursor: 'pointer', transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    {/* Header: Status and Date */}
                    <div className="d-flex align-items-center gap-3 mb-3" style={{ fontSize: 12 }}>
                      <div style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }}></span>
                        {s.text}
                      </div>
                      <div style={{ color: '#9ca3af' }}>|</div>
                      <div style={{ color: '#6b7280', fontWeight: 500 }}>{orderDate}</div>
                    </div>

                    {/* Content: Image, Details, Arrow */}
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-4 align-items-center">
                        <div style={{ width: 70, height: 70, borderRadius: 8, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={order.items?.[0]?.image || 'https://placehold.co/70x70?text=P'} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ color: '#111827', fontSize: 14, marginBottom: 4 }}>
                            <span style={{ fontWeight: 500, color: '#6b7280' }}>Order ID:</span> <span style={{ fontWeight: 700 }}>{order.orderNumber || order._id?.slice(-10).toUpperCase()}</span>
                          </div>
                          <div style={{ color: '#4b5563', fontSize: 14, marginBottom: 6, maxWidth: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {itemNames}
                          </div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>
                            ₹ {order.totalAmount?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div style={{ color: '#8e1c2e' }}>
                        <FaChevronRight />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
          </>
          )}

          {activeTab === 'Customer Care' && (
            <div className="text-center py-5" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <FaHeadset size={60} color="#e5e7eb" style={{ marginBottom: 20 }} />
              <h4 style={{ color: '#111827', fontWeight: 700 }}>How can we help?</h4>
              <p style={{ color: '#6b7280', maxWidth: 400 }}>Contact our 24/7 customer support for any queries regarding your orders, returns, or account.</p>
              <button className="btn mt-3" style={{ background: '#8e1c2e', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600 }}>Chat with us</button>
            </div>
          )}

          {activeTab === 'Saved cards' && (
            <div className="text-center py-5" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <FaRegCreditCard size={60} color="#e5e7eb" style={{ marginBottom: 20 }} />
              <h4 style={{ color: '#111827', fontWeight: 700 }}>Saved Cards</h4>
              <p style={{ color: '#6b7280', maxWidth: 400 }}>You haven't saved any credit or debit cards yet. Save a card for faster checkout.</p>
              <button className="btn mt-3" style={{ border: '1px solid #8e1c2e', color: '#8e1c2e', padding: '10px 24px', borderRadius: 8, fontWeight: 600 }}>Add New Card</button>
            </div>
          )}

          {activeTab === 'Pending payments' && (
            <div className="text-center py-5" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <FaRegClock size={60} color="#e5e7eb" style={{ marginBottom: 20 }} />
              <h4 style={{ color: '#111827', fontWeight: 700 }}>No Pending Payments</h4>
              <p style={{ color: '#6b7280', maxWidth: 400 }}>All your orders are fully paid. You have no pending invoices.</p>
            </div>
          )}

          {activeTab === 'Gift cards' && (
            <div className="text-center py-5" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <FaGift size={60} color="#e5e7eb" style={{ marginBottom: 20 }} />
              <h4 style={{ color: '#111827', fontWeight: 700 }}>Gift Cards</h4>
              <p style={{ color: '#6b7280', maxWidth: 400 }}>You don't have any active gift cards linked to your account.</p>
              <button className="btn mt-3" style={{ border: '1px solid #8e1c2e', color: '#8e1c2e', padding: '10px 24px', borderRadius: 8, fontWeight: 600 }}>Redeem Gift Card</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
