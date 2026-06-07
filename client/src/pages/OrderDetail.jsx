import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTruck, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import BreadcrumbNav from '../components/common/Breadcrumb';
import ConfirmModal from '../components/common/ConfirmModal';
import orderService from '../services/orderService';

const ORDER_STEPS = ['Processing', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered'];

const STATUS_COLORS = {
  Processing: { bg: '#fef9c3', color: '#a16207' },
  Confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
  Shipped: { bg: '#e0e7ff', color: '#4338ca' },
  OutForDelivery: { bg: '#ffedd5', color: '#c2410c' },
  Delivered: { bg: '#dcfce7', color: '#15803d' },
  'Return Requested': { bg: '#fef3c7', color: '#d97706' },
  Returned: { bg: '#e0e7ff', color: '#4338ca' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Item is defective or damaged');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    // Backend returns: { success, data: { order: {...} } }
    orderService.getOrderById(id)
      .then(r => setOrder(r.data?.data?.order || r.data?.data))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      toast.success('Order cancelled');
      const r = await orderService.getOrderById(id);
      setOrder(r.data?.data?.order || r.data?.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot cancel order'); }
    finally { setCancelling(false); setShowCancel(false); }
  };

  const handleReturnSubmit = async () => {
    const finalReason = returnReason === 'Other' ? customReason : returnReason;
    if (!finalReason.trim()) {
      toast.error('Please provide a reason for the return');
      return;
    }
    
    setReturning(true);
    try {
      await orderService.returnOrder(id, finalReason);
      toast.success('Return requested successfully');
      const r = await orderService.getOrderById(id);
      setOrder(r.data?.data?.order || r.data?.data);
      setShowReturnModal(false);
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot return order'); }
    finally { setReturning(false); }
  };

  if (loading) return (
    <div className="container py-5">{[200, 120, 100].map((h, i) => <div key={i} className="skeleton mb-4" style={{ height: h, borderRadius: 12 }} />)}</div>
  );

  if (!order) return null;
  const sc = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.Processing;
  const stepIndex = ORDER_STEPS.indexOf(order.orderStatus);
  const canCancel = ['Processing', 'Confirmed'].includes(order.orderStatus);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1000 }}>
        <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'My Orders', path: '/orders' }, { label: order.orderNumber }]} />
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.6rem', marginBottom: 4 }}>Order {order.orderNumber}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span style={{ padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: 14, background: sc.bg, color: sc.color }}>{order.orderStatus}</span>
            {canCancel && <button onClick={() => setShowCancel(true)} className="btn btn-sm" style={{ border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, background: 'transparent' }}>Cancel Order</button>}
            {order.orderStatus === 'Delivered' && (
              <button onClick={() => setShowReturnModal(true)} disabled={returning} className="btn btn-sm" style={{ border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: 8, background: 'transparent' }}>
                Return Order
              </button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="custom-card p-4 mb-4">
            <h6 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Tracking</h6>
            <div className="d-flex align-items-start">
              {ORDER_STEPS.map((s, i) => {
                const done = i <= stepIndex;
                const active = i === stepIndex;
                return (
                  <React.Fragment key={s}>
                    <div className="d-flex flex-column align-items-center" style={{ minWidth: 60 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? 'var(--gradient-primary)' : 'var(--bg-secondary)', border: `2px solid ${done ? 'var(--primary)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? 'white' : 'var(--text-muted)', transition: 'all 0.3s', fontSize: 14 }}>
                        {done && i === stepIndex ? <FaTruck size={14} /> : done ? <FaCheckCircle size={14} /> : i + 1}
                      </div>
                      <div style={{ fontSize: 10, marginTop: 8, textAlign: 'center', color: done ? 'var(--primary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400, maxWidth: 60 }}>{s.replace('OutFor', 'Out For ')}</div>
                    </div>
                    {i < ORDER_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIndex ? 'var(--primary)' : 'var(--border-color)', margin: '18px 4px 0', transition: 'background 0.3s' }} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {order.orderStatus === 'Cancelled' && (
          <div className="custom-card p-4 mb-4 d-flex align-items-center gap-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
            <FaTimesCircle size={28} color="#b91c1c" />
            <div>
              <div style={{ fontWeight: 700, color: '#b91c1c' }}>Order Cancelled</div>
              {order.cancelReason && <div style={{ fontSize: 13, color: '#991b1b' }}>Reason: {order.cancelReason}</div>}
            </div>
          </div>
        )}

        {/* Tracking Details (set by admin) */}
        {order.trackingInfo && (order.trackingInfo.carrier || order.trackingInfo.trackingNumber) && (
          <div className="custom-card p-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaTruck color="var(--primary)" /> Shipping & Tracking Details
            </h6>
            <div className="row g-3 mb-3">
              {order.trackingInfo.carrier && (
                <div className="col-sm-4">
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Carrier</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{order.trackingInfo.carrier}</div>
                </div>
              )}
              {order.trackingInfo.trackingNumber && (
                <div className="col-sm-4">
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Tracking Number</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 2, fontFamily: 'monospace', fontSize: 15 }}>{order.trackingInfo.trackingNumber}</div>
                </div>
              )}
              {order.trackingInfo.estimatedDelivery && (
                <div className="col-sm-4">
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Est. Delivery</div>
                  <div style={{ fontWeight: 600, color: '#10b981', marginTop: 2 }}>
                    {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
            {order.trackingInfo.updates?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Tracking History</div>
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--border-color)', borderRadius: 2 }} />
                  {[...order.trackingInfo.updates].reverse().map((upd, i) => (
                    <div key={i} style={{ position: 'relative', paddingLeft: 16, marginBottom: 14 }}>
                      <div style={{ position: 'absolute', left: -16, top: 5, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'var(--border-color)', border: '2px solid var(--surface)' }} />
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{upd.status}</div>
                      {upd.location && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>📍 {upd.location}</div>}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{new Date(upd.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        <div className="row g-4">
          <div className="col-md-7">
            {/* Items */}
            <div className="custom-card p-4 mb-4">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Items Ordered ({order.items?.length})</h6>
              {order.items?.map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-3 mb-3">
                  <img src={item.image || 'https://placehold.co/60x60?text=P'} alt={item.name} style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 10, background: 'var(--bg-secondary)', padding: 6, border: '1px solid var(--border-color)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="custom-card p-4">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}><FaMapMarkerAlt className="me-2" color="var(--primary)" />Delivery Address</h6>
              {order.shippingAddress && (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.street}</div>
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</div>
                  <div>{order.shippingAddress.country}</div>
                  {order.shippingAddress.phone && <div>📞 {order.shippingAddress.phone}</div>}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-5">
            {/* Price Summary */}
            <div className="custom-card p-4 mb-4">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Price Details</h6>
              {[
                ['Subtotal', `₹${order.subtotal?.toLocaleString('en-IN')}`],
                ['Tax', `₹${order.tax?.toLocaleString('en-IN')}`],
                ['Shipping', order.shippingCharges === 0 ? 'FREE' : `₹${order.shippingCharges}`],
                ...(order.discount > 0 ? [['Discount', `-₹${order.discount?.toLocaleString('en-IN')}`]] : []),
              ].map(([label, val]) => (
                <div key={label} className="d-flex justify-content-between mb-2" style={{ fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
              <hr style={{ borderColor: 'var(--border-color)' }} />
              <div className="d-flex justify-content-between">
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="custom-card p-4">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Payment</h6>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ color: order.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal show={showCancel} title="Cancel Order" message="Are you sure you want to cancel this order? This action cannot be undone." onConfirm={handleCancel} onCancel={() => setShowCancel(false)} confirmText={cancelling ? 'Cancelling...' : 'Yes, Cancel'} />
      
      {/* Return Order Modal */}
      {showReturnModal && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1045 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Request Return</h5>
                  <button type="button" className="btn-close" onClick={() => setShowReturnModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3" style={{ fontSize: 14 }}>Please select a reason for returning your order:</p>
                  
                  <div className="d-flex flex-column gap-2 mb-3">
                    {['Item is defective or damaged', 'Wrong item was sent', 'Item does not match description', 'No longer needed', 'Other'].map(reason => (
                      <label key={reason} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: returnReason === reason ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', border: returnReason === reason ? '1px solid var(--border-color)' : '1px solid transparent', transition: 'all 0.2s' }}>
                        <input type="radio" name="returnReason" value={reason} checked={returnReason === reason} onChange={(e) => setReturnReason(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {returnReason === 'Other' && (
                    <div className="mb-3">
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Please specify your reason:</label>
                      <textarea className="form-control" rows="3" value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Type your reason here..." style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 8, fontSize: 14 }}></textarea>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn" onClick={() => setShowReturnModal(false)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: 8 }}>Cancel</button>
                  <button type="button" className="btn" onClick={handleReturnSubmit} disabled={returning} style={{ background: '#f59e0b', color: 'white', borderRadius: 8 }}>
                    {returning ? 'Submitting...' : 'Submit Return'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
