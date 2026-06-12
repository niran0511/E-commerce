import React, { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import { toast } from 'react-toastify';
import { FaPhoneAlt, FaEnvelope, FaUserCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await ticketService.getAdminTickets();
      setTickets(res.data.data.tickets);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)' }} role="status"></div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">Customer Support Tickets</h2>
          <p className="text-secondary mb-0">Manage and respond to customer issues</p>
        </div>
        <div className="badge" style={{ background: 'var(--primary-lighter)', color: 'var(--primary-dark)', padding: '10px 16px', fontSize: 14 }}>
          {tickets.length} Total Tickets
        </div>
      </div>
      
      <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th className="px-4 py-3 text-secondary fw-semibold text-uppercase" style={{ fontSize: 12, letterSpacing: 0.5 }}>Customer Details</th>
                <th className="px-4 py-3 text-secondary fw-semibold text-uppercase" style={{ fontSize: 12, letterSpacing: 0.5 }}>Issue Type</th>
                <th className="px-4 py-3 text-secondary fw-semibold text-uppercase" style={{ fontSize: 12, letterSpacing: 0.5 }}>Message</th>
                <th className="px-4 py-3 text-secondary fw-semibold text-uppercase" style={{ fontSize: 12, letterSpacing: 0.5 }}>Date</th>
                <th className="px-4 py-3 text-secondary fw-semibold text-uppercase" style={{ fontSize: 12, letterSpacing: 0.5 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div style={{ color: 'var(--text-muted)' }}>
                      <FaCheckCircle size={40} className="mb-3" style={{ opacity: 0.5 }} />
                      <h5>No Support Tickets</h5>
                      <p>You're all caught up! There are no pending issues.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} style={{ transition: 'background-color 0.2s' }}>
                    <td className="px-4 py-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 45, height: 45, background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                          {ticket.user?.name ? ticket.user.name[0].toUpperCase() : <FaUserCircle />}
                        </div>
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{ticket.user?.name || 'Unknown User'}</div>
                          <div className="d-flex align-items-center gap-1 text-secondary mt-1" style={{ fontSize: 13 }}>
                            <FaEnvelope size={11} /> {ticket.user?.email}
                          </div>
                          <div className="d-flex align-items-center gap-1 text-secondary mt-1" style={{ fontSize: 13 }}>
                            <FaPhoneAlt size={11} /> {ticket.phone || ticket.user?.phone || <span className="fst-italic text-muted">No phone number</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="badge rounded-pill" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600, padding: '8px 14px' }}>
                        {ticket.issueType}
                      </span>
                    </td>
                    <td className="px-4 py-4" style={{ maxWidth: '350px' }}>
                      <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, position: 'relative' }}>
                        <FaExclamationCircle className="position-absolute" style={{ top: -8, left: -8, color: 'var(--warning)', background: 'white', borderRadius: '50%' }} size={16} />
                        {ticket.message}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-secondary fw-medium" style={{ fontSize: 14 }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <div className="text-muted small mt-1">{new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="badge rounded-pill" style={{ 
                        padding: '8px 16px',
                        fontWeight: 600,
                        background: ticket.status === 'Resolved' ? 'var(--success)' : 'rgba(245, 158, 11, 0.15)',
                        color: ticket.status === 'Resolved' ? 'white' : '#d97706',
                        border: ticket.status === 'Resolved' ? 'none' : '1px solid rgba(245, 158, 11, 0.3)'
                      }}>
                        {ticket.status === 'Resolved' ? '✓ Resolved' : '• Open'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
