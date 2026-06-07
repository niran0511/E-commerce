import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaImage, FaTag } from 'react-icons/fa';
import { FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import adminService from '../../services/adminService';
import productService from '../../services/productService';

const EMPTY_FORM = {
  name: '', description: '', price: '', mrp: '', brand: '', category: '',
  stock: '', images: '', isFeatured: false, isNewArrival: false, isBestSeller: false,
  tags: '', highlights: '', warranty: '12 Months domestic warranty', variantsStr: '', detailedSpecsStr: ''
};

// Tag chip input component
function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
  const addTag = (v) => {
    const trimmed = v.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed].join(', '));
    setInput('');
  };
  const removeTag = (t) => onChange(tags.filter(x => x !== t).join(', '));
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
  };
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-secondary)', padding: '8px 10px', minHeight: 42, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          {t}
          <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, lineHeight: 1, fontSize: 12 }}>×</button>
        </span>
      ))}
      <input
        value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        style={{ flex: 1, minWidth: 80, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13 }} />
    </div>
  );
}

// Image preview row
function ImagePreviews({ urls }) {
  const list = urls ? urls.split(',').map(u => u.trim()).filter(Boolean) : [];
  if (!list.length) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {list.map((url, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <img src={url} alt={`preview-${i}`}
            onError={e => { e.target.src = 'https://placehold.co/72x72?text=Error'; }}
            style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: 4 }} />
          {i === 0 && <span style={{ position: 'absolute', bottom: 3, left: 3, background: '#6366f1', color: 'white', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 6 }}>MAIN</span>}
        </div>
      ))}
    </div>
  );
}

// Product Add/Edit Modal
function ProductModal({ editProduct, categories, onClose, onSaved }) {
  const [form, setForm] = useState(
    editProduct
      ? { ...editProduct, category: editProduct.category?._id || editProduct.category, images: editProduct.images?.join(', ') || '', tags: editProduct.tags?.join(', ') || '', highlights: editProduct.highlights?.join('\n') || '', warranty: editProduct.warranty || '', variantsStr: editProduct.variants ? JSON.stringify(editProduct.variants, null, 2) : '', detailedSpecsStr: editProduct.detailedSpecs ? JSON.stringify(editProduct.detailedSpecs, null, 2) : '' }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!form.category) { toast.error('Please select a category'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : Number(form.price),
        stock: Number(form.stock) || 0,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        highlights: form.highlights ? form.highlights.split('\n').map(s => s.trim()).filter(Boolean) : [],
      };

      try {
        if (form.variantsStr) data.variants = JSON.parse(form.variantsStr);
        if (form.detailedSpecsStr) data.detailedSpecs = JSON.parse(form.detailedSpecsStr);
      } catch (e) {
        toast.error('Invalid JSON format in Variants or Detailed Specs. Please check your syntax.');
        setSaving(false);
        return;
      }
      if (editProduct) {
        await adminService.updateProduct(editProduct._id, data);
        toast.success('✅ Product updated successfully!');
      } else {
        await adminService.addProduct(data);
        toast.success('✅ Product added successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px', fontSize: 13, width: '100%' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 };
  const tabs = [
    { key: 'basic', label: '📦 Basic Info' },
    { key: 'pricing', label: '💰 Pricing & Stock' },
    { key: 'media', label: '🖼️ Images' },
    { key: 'advanced', label: '⚙️ Advanced Data' },
    { key: 'flags', label: '⭐ Flags' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h5 style={{ color: 'var(--text-primary)', fontWeight: 800, margin: 0, fontSize: 18 }}>
                {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h5>
              {editProduct && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>ID: {editProduct._id?.slice(-12)}</div>}
            </div>
            <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><FaTimes size={14} /></button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{
                padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab.key ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ── Basic Info Tab ─────────────────────────────────────── */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sony WH-1000XM5 Headphones" required />
              </div>
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed product description..." required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Sony, Samsung..." />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Pricing & Stock Tab ──────────────────────────────── */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Selling Price (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>₹</span>
                    <input type="number" min="0" style={{ ...inputStyle, paddingLeft: 28 }} value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" required />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>MRP / Original Price (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>₹</span>
                    <input type="number" min="0" style={{ ...inputStyle, paddingLeft: 28 }} value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>
              {form.price && form.mrp && Number(form.mrp) > Number(form.price) && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#059669' }}>
                  💸 Discount: {Math.round(((form.mrp - form.price) / form.mrp) * 100)}% off — Customer saves ₹{(form.mrp - form.price).toLocaleString('en-IN')}
                </div>
              )}
              <div>
                <label style={labelStyle}>Stock Quantity *</label>
                <input type="number" min="0" style={inputStyle} value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" required />
                {form.stock !== '' && Number(form.stock) < 5 && (
                  <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiAlertTriangle size={12} /> Low stock warning
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Images Tab ────────────────────────────────── */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}><FaImage style={{ marginRight: 4 }} />Image URLs (comma-separated)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  value={form.images} onChange={e => set('images', e.target.value)}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>First image is the main product image. Add multiple URLs separated by commas.</div>
                <ImagePreviews urls={form.images} />
              </div>
              <div>
                <label style={labelStyle}><FaTag style={{ marginRight: 4 }} />Tags</label>
                <TagInput value={form.tags} onChange={v => set('tags', v)} placeholder="Type a tag and press Enter..." />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Tags help customers find your product in search.</div>
              </div>
            </div>
          )}

          {/* ── Advanced Data Tab ────────────────────────────────── */}
          {activeTab === 'advanced' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Product Highlights (One per line)</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 120, fontFamily: 'monospace' }}
                    value={form.highlights} onChange={e => set('highlights', e.target.value)}
                    placeholder="12 GB RAM | 256 GB ROM&#10;5000 mAh Battery" />
                </div>
                <div>
                  <label style={labelStyle}>Warranty Information</label>
                  <input style={inputStyle} value={form.warranty} onChange={e => set('warranty', e.target.value)} placeholder="12 Months domestic warranty" />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>Variants (Valid JSON Array)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 150, fontFamily: 'monospace', fontSize: 12, background: '#1e1e1e', color: '#d4d4d4' }}
                  value={form.variantsStr} onChange={e => set('variantsStr', e.target.value)}
                  placeholder='[&#10;  { "color": "Blue", "memory": "128 GB + 8 GB", "price": 34990, "stock": 10 }&#10;]' />
              </div>

              <div>
                <label style={labelStyle}>Detailed Specifications (Valid JSON Array)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 150, fontFamily: 'monospace', fontSize: 12, background: '#1e1e1e', color: '#d4d4d4' }}
                  value={form.detailedSpecsStr} onChange={e => set('detailedSpecsStr', e.target.value)}
                  placeholder='[&#10;  {&#10;    "group": "General",&#10;    "attributes": [{ "key": "Brand", "value": "IQOO" }]&#10;  }&#10;]' />
              </div>
            </div>
          )}

          {/* ── Flags Tab ────────────────────────────────────────── */}
          {activeTab === 'flags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>These flags control where the product appears on the homepage and category pages.</div>
              {[
                { key: 'isFeatured', label: '⭐ Featured Product', desc: 'Shown in the "Featured" section on homepage' },
                { key: 'isNewArrival', label: '🆕 New Arrival', desc: 'Shown in "New Arrivals" section' },
                { key: 'isBestSeller', label: '🔥 Best Seller', desc: 'Tagged as bestseller throughout the store' },
              ].map(({ key, label, desc }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `2px solid ${form[key] ? 'var(--primary)' : 'var(--border-color)'}`, cursor: 'pointer', background: form[key] ? 'rgba(99,102,241,0.06)' : 'var(--bg-secondary)', transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: 'var(--primary)', width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </form>

        {/* Footer Buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Cancel
          </button>
          {activeTab !== 'flags' && (
            <button type="button" onClick={() => {
              const order = ['basic', 'pricing', 'media', 'flags'];
              const next = order[order.indexOf(activeTab) + 1];
              if (next) setActiveTab(next);
            }} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Next →
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {saving ? '⏳ Saving...' : editProduct ? '✅ Update Product' : '➕ Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchProducts = async (p = page, q = search, cat = filterCategory) => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ page: p, limit: LIMIT, search: q, ...(cat && { category: cat }) });
      const d = res.data?.data;
      if (Array.isArray(d)) { setProducts(d); setTotal(res.data?.total || 0); }
      else { setProducts(d?.products || []); setTotal(d?.pagination?.total || res.data?.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // Backend returns { success, data: { categories: [...] } }
    productService.getCategories().then(r => {
      const d = r.data?.data;
      setCategories(Array.isArray(d) ? d : (d?.categories || []));
    }).catch(console.error);
    fetchProducts();
  }, []); // eslint-disable-line

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(1, search); };
  const openAdd = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setShowModal(true); };
  const handleDelete = async () => {
    try { await adminService.deleteProduct(deleteId); toast.success('Product deleted'); setDeleteId(null); fetchProducts(); }
    catch { toast.error('Delete failed'); }
  };

  const stockBadge = (stock) => ({
    bg: stock === 0 ? '#fee2e2' : stock < 10 ? '#fef3c7' : '#dcfce7',
    color: stock === 0 ? '#b91c1c' : stock < 10 ? '#92400e' : '#15803d',
    text: stock === 0 ? 'Out' : stock,
  });

  return (
    <AdminLayout title="Manage Products">
      {/* Toolbar */}
      <div className="d-flex gap-3 mb-4 align-items-center flex-wrap">
        <form onSubmit={handleSearch} className="d-flex gap-2 flex-grow-1" style={{ maxWidth: 380 }}>
          <div className="input-group">
            <span className="input-group-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRight: 'none' }}><FaSearch size={12} color="var(--text-muted)" /></span>
            <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderLeft: 'none', borderRight: 'none' }} />
            <button type="submit" className="btn" style={{ background: 'var(--gradient-primary)', color: 'white', borderRadius: '0 10px 10px 0', border: 'none', padding: '0 14px' }}>Go</button>
          </div>
        </form>

        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); fetchProducts(1, search, e.target.value); }}
          style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Total: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong>
        </div>

        <button className="btn btn-gradient d-flex align-items-center gap-2" onClick={openAdd} style={{ borderRadius: 10, whiteSpace: 'nowrap' }}>
          <FaPlus size={13} /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="custom-card" style={{ borderRadius: 16 }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <thead>
              <tr style={{ borderColor: 'var(--border-color)' }}>
                {['Image', 'Product', 'Price', 'MRP', 'Stock', 'Category', 'Rating', 'Flags', 'Actions'].map(h => (
                  <th key={h} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600, padding: '12px 14px', borderColor: 'var(--border-color)', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={9} style={{ padding: 10, borderColor: 'var(--border-color)' }}><div className="skeleton" style={{ height: 44, borderRadius: 6 }} /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
                  <FiPackage size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                  No products found
                </td></tr>
              ) : products.map(p => {
                const sb = stockBadge(p.stock);
                return (
                  <tr key={p._id} style={{ borderColor: 'var(--border-color)', fontSize: 13 }}>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)' }}>
                      <img src={p.images?.[0] || 'https://placehold.co/48x48?text=P'} alt={p.name}
                        style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: 4 }} />
                    </td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)', maxWidth: 200 }}>
                      <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.brand}</div>
                    </td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)', fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>₹{p.price?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)', color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: 12 }}>
                      {p.mrp ? `₹${p.mrp?.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sb.bg, color: sb.color }}>{sb.text}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)', color: 'var(--text-secondary)', fontSize: 12 }}>{p.category?.name || '—'}</td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#f59e0b' }}>⭐</span> {p.avgRating?.toFixed(1) || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {p.isFeatured && <span style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>Featured</span>}
                        {p.isNewArrival && <span style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>New</span>}
                        {p.isBestSeller && <span style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>🔥 Best</span>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex gap-2">
                        <button onClick={() => openEdit(p)} title="Edit"
                          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 13 }}>
                          <FaEdit />
                        </button>
                        <button onClick={() => setDeleteId(p._id)} title="Delete"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 13 }}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); fetchProducts(p); }} />
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          editProduct={editProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => fetchProducts()}
        />
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This will also remove all its reviews."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
    </AdminLayout>
  );
}
