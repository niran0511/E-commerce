import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilter, FaTimes, FaStar } from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/common/SkeletonCard';
import Pagination from '../components/common/Pagination';
import BreadcrumbNav from '../components/common/Breadcrumb';
import productService from '../services/productService';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
  { label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: 999999 },
];

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Sort values that map to backend sort params
  const SORT_MAP = {
    newest: '-createdAt',
    price_low: 'price',
    price_high: '-price',
    bestselling: '-sold',
    rating: '-avgRating',
  };

  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    minPrice: '', maxPrice: '',
    rating: '',
    sort: 'newest',
  });

  const totalPages = Math.ceil(total / 12);

  const fetchProducts = useCallback(async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      // Map frontend sort key to backend sort param
      const mappedFilters = { ...currentFilters, sort: SORT_MAP[currentFilters.sort] || '-createdAt' };
      const query = { page, limit: 12, ...mappedFilters };
      // Remove empty values
      Object.keys(query).forEach(k => (query[k] === '' || query[k] === undefined) && delete query[k]);
      const res = await productService.getProducts(query);
      setProducts(res.data?.data?.products || []);
      setTotal(res.data?.data?.pagination?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    productService.getCategories().then(r => {
      const cats = r.data?.data?.categories || r.data?.data || [];
      setCategories(cats);
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const newFilters = { search: params.get('search') || '', category: params.get('category') || '', minPrice: '', maxPrice: '', rating: '', sort: 'newest' };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchProducts(1, newFilters);
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchProducts(1, newFilters);
  };

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    applyFilters(updated);
  };

  const clearAllFilters = () => {
    const cleared = { search: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest' };
    applyFilters(cleared);
    navigate('/products');
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.rating;

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    ...(filters.search ? [{ label: `"${filters.search}"` }] : []),
    ...(filters.category ? [{ label: filters.category }] : []),
  ];

  const FilterPanel = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-700 mb-0" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Filters</h6>
        {hasActiveFilters && <button onClick={clearAllFilters} className="btn btn-sm" style={{ color: 'var(--danger)', fontSize: 12, padding: '4px 8px' }}>Clear All</button>}
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <h6 className="fw-600 mb-2" style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Category</h6>
        {categories.map(cat => (
          <div key={cat._id} className="form-check mb-2">
            <input className="form-check-input" type="radio" name="category"
              checked={filters.category === cat.name}
              onChange={() => updateFilter('category', filters.category === cat.name ? '' : cat.name)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <label className="form-check-label" style={{ color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>{cat.name}</label>
          </div>
        ))}
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <h6 className="fw-600 mb-2" style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Price Range</h6>
        {PRICE_RANGES.map((range, i) => (
          <div key={i} className="form-check mb-2">
            <input className="form-check-input" type="radio" name="price"
              checked={Number(filters.minPrice) === range.min && Number(filters.maxPrice) === range.max}
              onChange={() => { const f = { ...filters, minPrice: range.min, maxPrice: range.max }; applyFilters(f); }}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <label className="form-check-label" style={{ color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>{range.label}</label>
          </div>
        ))}
      </div>

      {/* Rating Filter */}
      <div className="mb-4">
        <h6 className="fw-600 mb-2" style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Minimum Rating</h6>
        {[4, 3, 2, 1].map(r => (
          <div key={r} className="form-check mb-2">
            <input className="form-check-input" type="radio" name="rating"
              checked={Number(filters.rating) === r}
              onChange={() => updateFilter('rating', Number(filters.rating) === r ? '' : r)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <label className="form-check-label d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
              {Array(r).fill(0).map((_, i) => <FaStar key={i} size={13} color="#f59e0b" />)} & up
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1400 }}>
        <BreadcrumbNav items={breadcrumbs} />

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="section-title mb-1" style={{ fontSize: '1.8rem' }}>
              {filters.search ? `Results for "${filters.search}"` : filters.category || 'All Products'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{loading ? '...' : `${total} products found`}</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {/* Mobile filter button */}
            <button className="btn d-md-none d-flex align-items-center gap-2 rounded-3" onClick={() => setShowMobileFilter(true)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14 }}>
              <FaFilter size={13} /> Filters
            </button>
            {/* Sort */}
            <select className="form-select rounded-3" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: 14, padding: '8px 14px', width: 'auto' }}>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="bestselling">Best Selling</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {filters.search && <span className="badge d-flex align-items-center gap-1" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: 20, fontSize: 13 }}>
              Search: {filters.search} <FaTimes size={11} onClick={() => updateFilter('search', '')} style={{ cursor: 'pointer' }} /></span>}
            {filters.category && <span className="badge d-flex align-items-center gap-1" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: 20, fontSize: 13 }}>
              {filters.category} <FaTimes size={11} onClick={() => updateFilter('category', '')} style={{ cursor: 'pointer' }} /></span>}
          </div>
        )}

        <div className="row g-4">
          {/* Sidebar - Desktop */}
          <div className="col-md-3 d-none d-md-block">
            <div className="custom-card p-4" style={{ position: 'sticky', top: 80 }}>
              <FilterPanel />
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-12 col-md-9">
            {loading ? (
              <div className="row g-3">{Array(8).fill(0).map((_, i) => <div key={i} className="col-6 col-sm-6 col-md-4 col-lg-3"><SkeletonCard /></div>)}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
                <h3 style={{ color: 'var(--text-primary)' }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms</p>
                <button className="btn btn-gradient mt-2" onClick={clearAllFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {products.map(p => <div key={p._id} className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3"><ProductCard product={p} /></div>)}
                </div>
                {totalPages > 1 && (
                  <div className="mt-5">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); fetchProducts(p); window.scrollTo(0, 0); }} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Offcanvas */}
      {showMobileFilter && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowMobileFilter(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, background: 'var(--surface)', overflowY: 'auto', padding: 24, zIndex: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Filters</h5>
              <button onClick={() => setShowMobileFilter(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 20, cursor: 'pointer' }}><FaTimes /></button>
            </div>
            <FilterPanel />
            <button className="btn btn-gradient w-100 mt-3" onClick={() => setShowMobileFilter(false)}>Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}
