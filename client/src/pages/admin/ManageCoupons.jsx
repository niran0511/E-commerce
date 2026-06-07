import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTicketAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import adminService from '../../services/adminService';
import { Modal, Button, Form, Badge } from 'react-bootstrap';

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: 0,
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: 100,
    isActive: true
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCoupons();
      setCoupons(res.data?.data?.coupons || []);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (coupon = null) => {
    if (coupon) {
      setFormData({
        ...coupon,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      });
      setEditId(coupon._id);
    } else {
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: 0,
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: 100,
        isActive: true
      });
      setEditId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminService.updateCoupon(editId, formData);
        toast.success('Coupon updated successfully');
      } else {
        await adminService.createCoupon(formData);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await adminService.deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Manage Coupons">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="position-relative" style={{ maxWidth: 350, flex: 1 }}>
          <FaSearch className="position-absolute" style={{ top: 14, left: 14, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search coupon codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <button className="btn btn-gradient d-flex align-items-center gap-2 rounded-3" onClick={() => handleShowModal()}>
          <FaPlus size={14} /> Add Coupon
        </button>
      </div>

      <div className="custom-card p-0" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table mb-0 align-middle" style={{ color: 'var(--text-primary)' }}>
            <thead style={{ background: 'var(--bg-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              <tr>
                <th className="px-4 py-3 border-0">Code</th>
                <th className="py-3 border-0">Discount</th>
                <th className="py-3 border-0">Validity</th>
                <th className="py-3 border-0">Usage</th>
                <th className="py-3 border-0">Status</th>
                <th className="py-3 border-0 text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid var(--border-color)' }}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No coupons found.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--primary)' }}>
                        <FaTicketAlt /> {coupon.code}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-bold">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Min Purchase: ₹{coupon.minPurchase}</div>
                    </td>
                    <td className="py-3">
                      <div style={{ fontSize: 13 }}>{new Date(coupon.validUntil).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="py-3">
                      <div style={{ fontSize: 13 }}>{coupon.usedCount} / {coupon.usageLimit}</div>
                    </td>
                    <td className="py-3">
                      <Badge bg={coupon.isActive ? 'success' : 'danger'}>{coupon.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="py-3 text-end pe-4">
                      <button className="btn btn-sm btn-light me-2" onClick={() => handleShowModal(coupon)}><FaEdit color="var(--primary)" /></button>
                      <button className="btn btn-sm btn-light" onClick={() => handleDelete(coupon._id)}><FaTrash color="#ef4444" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit Coupon' : 'New Coupon'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Coupon Code</Form.Label>
              <Form.Control type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} style={{ textTransform: 'uppercase' }} />
            </Form.Group>
            
            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Discount Type</Form.Label>
                <Form.Select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Discount Value</Form.Label>
                <Form.Control type="number" required min="1" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Min Purchase (₹)</Form.Label>
                <Form.Control type="number" min="0" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })} />
              </Form.Group>
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Max Discount (₹)</Form.Label>
                <Form.Control type="number" min="0" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} placeholder="Leave blank for no limit" disabled={formData.discountType !== 'percentage'} />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Valid From</Form.Label>
                <Form.Control type="date" required value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
              </Form.Group>
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Valid Until</Form.Label>
                <Form.Control type="date" required value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Usage Limit</Form.Label>
                <Form.Control type="number" required min="1" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} />
              </Form.Group>
              <Form.Group className="col-md-6 mb-3 d-flex align-items-end">
                <Form.Check type="switch" label="Is Active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="btn-gradient">Save Coupon</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
