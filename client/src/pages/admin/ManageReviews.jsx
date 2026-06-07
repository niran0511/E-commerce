import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaStar } from 'react-icons/fa';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import adminService from '../../services/adminService';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const LIMIT = 15;

  const fetchReviews = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getAllReviews({ page: p, limit: LIMIT });
      // Backend returns: { success, data: { reviews: [...], pagination: {} } }
      const d = res.data?.data;
      setReviews(d?.reviews || d || []);
      setTotal(d?.pagination?.total || res.data?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    try { await adminService.deleteReview(deleteId); toast.success('Review deleted'); setDeleteId(null); fetchReviews(); }
    catch { toast.error('Delete failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout title="Manage Reviews">
        <div className="custom-card">
          <div className="table-responsive">
            <table className="table mb-0" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
              <thead><tr>
                {['Product', 'User', 'Rating', 'Review', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600, padding: '12px 14px', borderColor: 'var(--border-color)', fontSize: 13 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: 12, borderColor: 'var(--border-color)' }}><div className="skeleton" style={{ height: 36, borderRadius: 6 }} /></td></tr>
                )) : reviews.map(r => (
                  <tr key={r._id} style={{ borderColor: 'var(--border-color)', fontSize: 14 }}>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', maxWidth: 180 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{r.product?.name || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{r.user?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex gap-1 align-items-center">
                        {Array(5).fill(0).map((_, i) => <FaStar key={i} size={13} color={i < r.rating ? '#f59e0b' : 'var(--border-color)'} />)}
                        <span style={{ fontSize: 13, marginLeft: 4, color: 'var(--text-muted)' }}>{r.rating}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', maxWidth: 250 }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</div>
                    </td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                      <button onClick={() => setDeleteId(r._id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && <div className="mt-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); fetchReviews(p); }} /></div>}
        <ConfirmModal show={!!deleteId} title="Delete Review" message="Delete this review permanently?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmText="Delete Review" />
    </AdminLayout>
  );
}
