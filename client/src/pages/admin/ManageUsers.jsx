import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import adminService from '../../services/adminService';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const LIMIT = 15;

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({ page: p, limit: LIMIT });
      // Backend returns: { success, data: { users: [...], pagination: {} } }
      const d = res.data?.data;
      setUsers(d?.users || d || []);
      setTotal(d?.pagination?.total || res.data?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBlock = async (userId, currentlyBlocked) => {
    try {
      await adminService.blockUser(userId);
      toast.success(currentlyBlocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async () => {
    try { await adminService.deleteUser(deleteId); toast.success('User deleted'); setDeleteId(null); fetchUsers(); }
    catch { toast.error('Delete failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout title="Manage Users">
        <div className="custom-card">
          <div className="table-responsive">
            <table className="table mb-0" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
              <thead><tr>
                {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600, padding: '12px 14px', borderColor: 'var(--border-color)', fontSize: 13 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: 12, borderColor: 'var(--border-color)' }}><div className="skeleton" style={{ height: 36, borderRadius: 6 }} /></td></tr>
                )) : users.map(u => (
                  <tr key={u._id} style={{ borderColor: 'var(--border-color)', fontSize: 14 }}>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{u.name?.[0]}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.role === 'admin' ? '#fef3c7' : '#e0e7ff', color: u.role === 'admin' ? '#92400e' : '#3730a3' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.isBlocked ? '#fee2e2' : '#dcfce7', color: u.isBlocked ? '#b91c1c' : '#15803d' }}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex gap-2">
                        <button onClick={() => handleBlock(u._id, u.isBlocked)} title={u.isBlocked ? 'Unblock' : 'Block'}
                          style={{ background: u.isBlocked ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: u.isBlocked ? '#10b981' : '#f59e0b', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>
                          {u.isBlocked ? <FaToggleOff /> : <FaToggleOn />}
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => setDeleteId(u._id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                            <FaTrash size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && <div className="mt-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); fetchUsers(p); }} /></div>}
        <ConfirmModal show={!!deleteId} title="Delete User" message="Delete this user permanently? All their data will be removed." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmText="Delete User" />
    </AdminLayout>
  );
}
