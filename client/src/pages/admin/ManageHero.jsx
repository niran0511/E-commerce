import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import { FaSearch, FaCheckCircle, FaStar, FaSave } from 'react-icons/fa';

export default function ManageHero() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await adminService.getProducts({ limit: 100 }); // Fetch top 100 for easy searching
      const allProducts = res.data?.data?.products || [];
      setProducts(allProducts);

      // Extract initially selected heroes
      const heroes = allProducts.filter(p => p.isHero).map(p => p._id);
      setSelectedIds(heroes);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      if (selectedIds.length >= 3) {
        toast.warning('You can only select exactly 3 Hero products. Unselect one first.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length !== 3) {
      toast.error('Please select exactly 3 products for the Hero Section.');
      return;
    }
    setSaving(true);
    try {
      await adminService.setHeroProducts({ productIds: selectedIds });
      toast.success('Hero products updated successfully! The homepage animation will now feature these products.');
      // Refresh to ensure sync
      fetchProducts();
    } catch (err) {
      console.error('Save Hero Error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save Hero products. Is the backend restarted?';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-4">Loading hero configuration...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">Manage Hero Section</h2>
          <p className="text-secondary mb-0">Select exactly 3 products to feature in the 3D floating animation on the homepage.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving || selectedIds.length !== 3}
          className="btn text-white px-4 py-2 fw-bold d-flex align-items-center gap-2"
          style={{ background: 'var(--gradient-primary)', borderRadius: 12 }}
        >
          {saving ? 'Saving...' : <><FaSave /> Save Hero Setup</>}
        </button>
      </div>

      <div className="row g-4">
        {/* Selected Preview Area */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16, background: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FaStar color="#f59e0b" /> Currently Selected ({selectedIds.length}/3)
            </h5>
            <div className="d-flex gap-3 flex-wrap">
              {selectedIds.length === 0 && <span className="text-muted">No products selected yet.</span>}
              {selectedIds.map(id => {
                const p = products.find(prod => prod._id === id);
                if (!p) return null;
                return (
                  <div key={p._id} className="card border-0 shadow-sm p-2" style={{ width: 140, borderRadius: 12 }}>
                    <div style={{ height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 8, background: 'var(--surface)' }}>
                      <img src={p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="text-truncate fw-bold" style={{ fontSize: 13 }} title={p.name}>{p.name}</div>
                    <div className="text-primary fw-bold" style={{ fontSize: 12 }}>₹{p.price?.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Selection List */}
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <div className="position-relative" style={{ maxWidth: 400 }}>
                <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: 16, transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search products to add..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 42, borderRadius: 10, background: 'var(--bg-secondary)', border: 'none' }}
                />
              </div>
            </div>
            
            <div className="card-body p-0 mt-3">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ background: 'var(--bg-secondary)' }}>
                    <tr>
                      <th className="px-4 py-3 border-0">Product</th>
                      <th className="px-4 py-3 border-0">Price</th>
                      <th className="px-4 py-3 border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const isSelected = selectedIds.includes(product._id);
                      return (
                        <tr key={product._id} style={{ background: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <img src={product.images?.[0] || 'https://via.placeholder.com/50'} alt={product.name} style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 8 }} />
                              <div>
                                <div className="fw-bold text-dark">{product.name}</div>
                                <div className="text-muted small">{product.category?.name || 'Uncategorized'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 fw-bold">₹{product.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-end">
                            <button 
                              onClick={() => handleToggleSelect(product._id)}
                              className={`btn btn-sm ${isSelected ? 'btn-success' : 'btn-outline-primary'}`}
                              style={{ borderRadius: 8, padding: '6px 16px', fontWeight: 600 }}
                            >
                              {isSelected ? <><FaCheckCircle /> Selected</> : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
