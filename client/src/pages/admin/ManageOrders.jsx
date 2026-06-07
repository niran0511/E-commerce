import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTruck, FaTimes, FaSearch } from 'react-icons/fa';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import Pagination from '../../components/common/Pagination';
import adminService from '../../services/adminService';

// Admin can update status through the workflow — but CANNOT cancel orders (only users can cancel)
const STATUS_OPTIONS = ['Processing', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered'];
const STATUS_COLORS = {
  Processing: '#f59e0b', Confirmed: '#3b82f6', Shipped: '#8b5cf6',
  OutForDelivery: '#f97316', Delivered: '#10b981', Cancelled: '#ef4444'
};
const STATUS_ICONS = {
  Processing: <FiClock size={12} />, Confirmed: <FiPackage size={12} />,
  Shipped: <FaTruck size={12} />, OutForDelivery: <FiMapPin size={12} />,
  Delivered: <FiCheckCircle size={12} />, Cancelled: <FiXCircle size={12} />,
};

// Timeline bar for the modal
const ORDER_STEPS = ['Processing', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered'];
function TrackingBar({ status }) {
  const idx = ORDER_STEPS.indexOf(status);
  if (idx === -1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
      {ORDER_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i <= idx ? '#6366f1' : '#e2e8f0',
              color: i <= idx ? 'white' : '#94a3b8', fontSize: 11,
              boxShadow: i === idx ? '0 0 0 3px rgba(99,102,241,0.25)' : 'none',
            }}>{STATUS_ICONS[step]}</div>
            <div style={{ fontSize: 9, marginTop: 4, textAlign: 'center', color: i <= idx ? '#6366f1' : '#94a3b8', fontWeight: i === idx ? 700 : 400, maxWidth: 54, lineHeight: 1.2 }}>
              {step.replace('OutForDelivery', 'Out For\nDelivery')}
            </div>
          </div>
          {i < ORDER_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? '#6366f1' : '#e2e8f0', margin: '0 2px', marginBottom: 20 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// Update tracking modal
function TrackingModal({ order, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: order.orderStatus,
    carrier: order.trackingInfo?.carrier || '',
    trackingNumber: order.trackingInfo?.trackingNumber || '',
    estimatedDelivery: order.trackingInfo?.estimatedDelivery
      ? new Date(order.trackingInfo.estimatedDelivery).toISOString().split('T')[0]
      : '',
    location: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateOrderStatus(order._id, {
        status: form.status,
        carrier: form.carrier,
        trackingNumber: form.trackingNumber,
        estimatedDelivery: form.estimatedDelivery || undefined,
        location: form.location,
        reason: form.reason,
      });
      toast.success(`Order status updated to ${form.status}`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h5 style={{ color: 'var(--text-primary)', fontWeight: 800, margin: 0, fontSize: 18 }}>
              <FaTruck className="me-2" color="#6366f1" />Update Tracking
            </h5>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              Order: <strong>{order.orderNumber}</strong> — Customer: <strong>{order.user?.name}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><FaTimes size={14} /></button>
        </div>

        {/* Live tracking preview */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Tracking Preview</div>
          <TrackingBar status={form.status} />
        </div>

        <form onSubmit={handleSave}>
          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Order Status *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(s => (
                <button type="button" key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.status === s ? STATUS_COLORS[s] : 'var(--bg-secondary)',
                    color: form.status === s ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${form.status === s ? STATUS_COLORS[s] : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  {STATUS_ICONS[s]}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Shipping info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Carrier</label>
              <input className="form-control" placeholder="e.g. Blue Dart, DTDC" value={form.carrier}
                onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '9px 12px', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Tracking Number</label>
              <input className="form-control" placeholder="AWB / Tracking ID" value={form.trackingNumber}
                onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '9px 12px', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Est. Delivery Date</label>
              <input type="date" className="form-control" value={form.estimatedDelivery}
                onChange={e => setForm(f => ({ ...f, estimatedDelivery: e.target.value }))}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '9px 12px', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Current Location</label>
              <input className="form-control" placeholder="e.g. Mumbai Hub" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '9px 12px', fontSize: 13 }} />
            </div>
          </div>

          {form.status === 'Cancelled' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: 5 }}>Cancellation Reason</label>
              <textarea className="form-control" rows={2} value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Reason for cancellation..."
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, fontSize: 13, resize: 'none' }} />
            </div>
          )}

          {/* Order items summary */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Items ({order.items?.length})</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', borderRadius: 8, padding: '4px 10px' }}>
                  <img src={item.image || 'https://placehold.co/24x24?text=P'} alt={item.name} style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name?.slice(0, 20)} ×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {saving ? 'Saving...' : '✓ Save Tracking Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [trackingOrder, setTrackingOrder] = useState(null); // order being updated
  const LIMIT = 12;

  const fetchOrders = async (p = page, status = filterStatus) => {
    setLoading(true);
    try {
      const res = await adminService.getAllOrders({ page: p, limit: LIMIT, status });
      // Backend: { success, data: { orders: [...], pagination: {} } }
      const data = res.data?.data;
      setOrders(data?.orders || []);
      setTotal(data?.pagination?.total || 0);
    } catch (e) { console.error(e); toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line

  const totalPages = Math.ceil(total / LIMIT);

  // Local search filter
  const filtered = search.trim()
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <AdminLayout title="Manage Orders">
      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4 align-items-center">
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1); fetchOrders(1, s); }}
            style={{
              padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
              background: filterStatus === s ? '#6366f1' : 'var(--bg-secondary)',
              color: filterStatus === s ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filterStatus === s ? '#6366f1' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            {s && STATUS_ICONS[s]}{s || 'All Orders'}
          </button>
        ))}

        {/* Search */}
        <div className="ms-auto d-flex align-items-center gap-2" style={{ maxWidth: 280 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}><FaSearch size={12} color="var(--text-muted)" /></span>
            <input type="text" className="form-control" placeholder="Search order / customer..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderLeft: 'none' }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Total: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> orders
        </div>
        {filterStatus && <div style={{ fontSize: 13, color: STATUS_COLORS[filterStatus], fontWeight: 600 }}>Filtered: {filterStatus}</div>}
      </div>

      <div className="custom-card">
        <div className="table-responsive">
          <table className="table mb-0" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <thead>
              <tr style={{ borderColor: 'var(--border-color)' }}>
                {['Order #', 'Customer', 'Date', 'Items', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600, padding: '12px 14px', borderColor: 'var(--border-color)', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={8} style={{ padding: 12, borderColor: 'var(--border-color)' }}><div className="skeleton" style={{ height: 40, borderRadius: 6 }} /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order._id} style={{ borderColor: 'var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                    {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}
                  </td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.user?.name || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.user?.email}</div>
                  </td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {order.items?.slice(0, 2).map((item, i) => (
                        <img key={i} src={item.image || 'https://placehold.co/32x32?text=P'} alt={item.name} title={`${item.name} ×${item.quantity}`}
                          style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                      ))}
                      {order.items?.length > 2 && <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>+{order.items.length - 2}</div>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', fontSize: 12 }}>
                    <div style={{ color: 'var(--text-secondary)' }}>{order.paymentMethod}</div>
                    <div style={{ fontWeight: 600, color: order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontSize: 11 }}>{order.paymentStatus}</div>
                  </td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: (STATUS_COLORS[order.orderStatus] || '#6366f1') + '20',
                      color: STATUS_COLORS[order.orderStatus] || '#6366f1',
                      display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                    }}>
                      {STATUS_ICONS[order.orderStatus]}{order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                    <button onClick={() => setTrackingOrder(order)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <FaTruck size={12} /> Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); fetchOrders(p); }} />
        </div>
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onSaved={() => fetchOrders()}
        />
      )}
    </AdminLayout>
  );
}
