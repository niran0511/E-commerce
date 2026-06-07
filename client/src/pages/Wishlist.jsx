import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import BreadcrumbNav from '../components/common/Breadcrumb';
import { useWishlist } from '../context/WishlistContext';

import { toast } from 'react-toastify';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, moveToCart, loading } = useWishlist();
  const navigate = useNavigate();

  const handleMoveToCart = async (productId) => {
    try { await moveToCart(productId); toast.success('Moved to cart!'); }
    catch { toast.error('Failed to move to cart'); }
  };

  if (loading) return <div className="container py-5"><div className="row g-3">{Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-3"><div className="skeleton" style={{ height: 300, borderRadius: 12 }} /></div>)}</div></div>;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
      <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1400 }}>
        <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'Wishlist' }]} />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.8rem', margin: 0 }}>
            <FaHeart color="#ef4444" className="me-2" />My Wishlist <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>({wishlistItems.length} items)</span>
          </h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-5" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 100, marginBottom: 24 }}>💝</div>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 28 }}>Save items you love to your wishlist. Review them anytime and move them to cart.</p>
            <button className="btn btn-gradient btn-lg" onClick={() => navigate('/products')}>Explore Products</button>
          </div>
        ) : (
          <div className="row g-4">
            {wishlistItems.map(item => {
              const product = item.product;
              if (!product) return null;
              const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
              return (
                <div key={item._id} className="col-6 col-md-4 col-lg-3">
                  <div className="custom-card h-100" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative' }}>
                      {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
                      <Link to={`/products/${product._id}`}>
                        <img src={product.images?.[0] || 'https://placehold.co/400x300?text=Product'} alt={product.name}
                          style={{ width: '100%', height: 200, objectFit: 'contain', background: 'var(--bg-secondary)', padding: 16, transition: 'transform 0.3s' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                      </Link>
                    </div>
                    <div className="p-3 d-flex flex-column" style={{ flex: 1 }}>
                      <Link to={`/products/${product._id}`} className="text-decoration-none">
                        <h6 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>{product.name}</h6>
                      </Link>
                      <div className="d-flex align-items-baseline gap-2 mb-3">
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>₹{product.price?.toLocaleString('en-IN')}</span>
                        {product.mrp > product.price && <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.mrp?.toLocaleString('en-IN')}</span>}
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        <button onClick={() => handleMoveToCart(product._id)} className="btn btn-sm flex-1 d-flex align-items-center justify-content-center gap-1"
                          style={{ background: 'var(--gradient-primary)', color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 600, flex: 1 }}>
                          <FaShoppingCart size={11} /> Move to Cart
                        </button>
                        <button onClick={() => removeFromWishlist(product._id)} className="btn btn-sm" style={{ border: '1px solid var(--border-color)', background: 'var(--surface)', color: '#ef4444', borderRadius: 8, padding: '6px 10px' }}>
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
