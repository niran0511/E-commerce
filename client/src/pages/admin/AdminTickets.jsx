import React, { useState, useEffect } from 'react';
import ticketService from '../../../services/ticketService';
import { toast } from 'react-toastify';

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

  if (loading) return <div>Loading tickets...</div>;

  return (
    <div>
      <h2 className="h4 fw-bold mb-4">Support Tickets</h2>
      <div className="card shadow-sm border-0" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-4 py-3 text-secondary fw-semibold">User</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Issue Type</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Message</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Date</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-secondary">
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td className="px-4 py-3">
                        <div className="fw-semibold text-dark">{ticket.user?.name || 'Unknown'}</div>
                        <div className="small text-secondary">{ticket.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-light text-dark border">
                          {ticket.issueType}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ maxWidth: '300px' }}>
                        <div className="text-truncate" title={ticket.message}>
                          {ticket.message}
                        </div>
                      </td>
                      <td className="px-4 py-3 small text-secondary">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ticket.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {ticket.status}
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
    </div>
  );
}
