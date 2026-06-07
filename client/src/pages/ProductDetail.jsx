import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaHeart, FaTruck, FaShieldAlt, FaUndo, FaStar, FaMapMarkerAlt, FaCheckCircle, FaChevronDown, FaTag } from 'react-icons/fa';
import ProductGallery from '../components/product/ProductGallery';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import ProductCard from '../components/product/ProductCard';
import BreadcrumbNav from '../components/common/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import reviewService from '../services/reviewService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user, updateProfile } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id),
        ]);
        const prod = pRes.data?.data?.product || pRes.data?.data;
        setProduct(prod);
        const reviewData = rRes.data?.data;
        setReviews(Array.isArray(reviewData) ? reviewData : (reviewData?.reviews || []));
        setWishlisted(isInWishlist(id));
        if (prod?.category) {
          const relRes = await productService.getProducts({ category: prod.category?.name, limit: 5 });
          const relData = relRes.data?.data;
          const relArr = Array.isArray(relData) ? relData : (relData?.products || []);
          setRelated(relArr.filter(p => p._id !== id).slice(0, 4));
        }
      } catch (e) { toast.error('Product not found'); navigate('/products'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    setAddingToCart(true);
    try { await addToCart(id, quantity); toast.success('Added to cart!'); }
    catch (e) { toast.error('Failed to add to cart'); }
    finally { setAddingToCart(false); }
  };



  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error('Please login to checkout'); navigate('/login'); return; }
    const selectedAddress = user?.addresses?.[selectedAddressIdx];
    navigate('/checkout', { state: { buyNowItem: { product, quantity }, prefilledAddress: selectedAddress } });
  };

  const handleReviewAdded = async () => {
    const rRes = await reviewService.getProductReviews(id);
    const reviewData = rRes.data?.data;
    setReviews(Array.isArray(reviewData) ? reviewData : (reviewData?.reviews || []));
  };

  const handleReviewSubmit = async ({ rating, title, comment }) => {
    try {
      await reviewService.addReview({ productId: id, rating, title, comment });
      await handleReviewAdded();
      const { toast } = await import('react-toastify');
      toast.success('Review submitted! Thank you 🎉');
    } catch (e) {
      const { toast } = await import('react-toastify');
      toast.error(e.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill all address fields'); return;
    }
    try {
      const updatedAddresses = [...(user?.addresses || []), newAddress];
      await updateProfile({ addresses: updatedAddresses });
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
      setShowAddForm(false);
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const emiPlans = [
    { months: 3, interest: 0 },
    { months: 6, interest: 0 },
    { months: 9, interest: 14 },
    { months: 12, interest: 15 },
    { months: 18, interest: 15 },
    { months: 24, interest: 16 },
  ];

  if (loading) return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-md-5"><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>
        <div className="col-md-7">{[80, 60, 40, 120, 60].map((w, i) => <div key={i} className="skeleton mb-3" style={{ height: 24, width: `${w}%` }} />)}</div>
      </div>
    </div>
  );

  if (!product) return null;

  // Active Variant Logic
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedVariantIdx] : null;
  
  const activePrice = activeVariant ? activeVariant.price : product.price;
  const activeMrp = activeVariant ? (activeVariant.mrp || activePrice) : (product.mrp || product.price);
  const activeStock = activeVariant ? activeVariant.stock : product.stock;
  const activeDiscount = activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : product.discount || 0;
  
  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const deliveryFormatted = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });

  // Group variants by color to render swatches
  const colorVariants = hasVariants ? [...new Map(product.variants.map(v => [v.color, v])).values()] : [];
  
  // Get memory variants for currently selected color
  const activeColor = activeVariant?.color;
  const memoryVariants = hasVariants ? product.variants.map((v, i) => ({ ...v, index: i })).filter(v => v.color === activeColor) : [];

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: 1400 }}>
        <BreadcrumbNav items={[{ label: 'Home', path: '/' }, { label: 'Products', path: '/products' }, { label: product.category?.name, path: `/products?category=${product.category?.name}` }, { label: product.name }]} />

        <div className="row g-5 mb-5">
          {/* Image Gallery */}
          <div className="col-lg-5">
            <div style={{ position: 'sticky', top: 80 }}>
              <ProductGallery images={product.images?.length ? product.images : [`https://picsum.photos/seed/${product._id || 'product'}/500/500`]} />
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-7">
            {/* Title & Rating */}
            {product.brand && <div className="mb-2" style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</div>}
            <h1 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>
              {product.name} {activeVariant ? `(${activeVariant.color}, ${activeVariant.memory?.split('+')[0]?.trim()}) (${activeVariant.memory?.split('+')[1]?.trim() || ''})` : ''}
            </h1>

            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <div style={{ background: '#16a34a', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                {product.avgRating?.toFixed(1) || '0.0'} <FaStar size={10} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>{product.numReviews} Ratings & Reviews</span>
            </div>

            {/* Colors */}
            {hasVariants && colorVariants.length > 0 && (
              <div className="mb-4">
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Selected Color: <span style={{ fontWeight: 400 }}>{activeColor}</span>
                </div>
                <div className="d-flex gap-3">
                  {colorVariants.map((cv) => {
                    const firstIdxOfColor = product.variants.findIndex(v => v.color === cv.color);
                    const isSelected = cv.color === activeColor;
                    return (
                      <div key={cv.color} onClick={() => setSelectedVariantIdx(firstIdxOfColor)}
                        style={{ width: 64, height: 64, border: `2px solid ${isSelected ? '#2874f0' : 'var(--border-color)'}`, borderRadius: 4, padding: 2, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                        <img src={product.images[cv.imageIndex || 0] || product.images[0]} alt={cv.color} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        {product.variants[firstIdxOfColor].stock === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.8)', color: '#dc2626', fontSize: 10, textAlign: 'center', fontWeight: 600 }}>Out of stock</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RAM/Storage Variants */}
            {hasVariants && memoryVariants.length > 0 && (
              <div className="mb-4">
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Variant:</div>
                <div className="d-flex flex-wrap gap-2">
                  {memoryVariants.map(mv => {
                    const isSelected = mv.index === selectedVariantIdx;
                    return (
                      <div key={mv.index} onClick={() => setSelectedVariantIdx(mv.index)}
                        style={{ border: `2px solid ${isSelected ? '#2874f0' : 'var(--border-color)'}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', minWidth: 120, position: 'relative' }}>
                        <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: 'var(--text-primary)' }}>{mv.memory}</div>
                        {mv.stock > 0 ? (
                          <>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>₹{mv.price?.toLocaleString('en-IN')}</div>
                            {mv.stock <= 5 && <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{mv.stock} left</div>}
                          </>
                        ) : (
                          <div style={{ fontSize: 13, color: '#dc2626', fontWeight: 500, marginTop: 4 }}>Out of stock</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price block */}
            <div className="d-flex align-items-baseline gap-2 mb-2">
              <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)' }}>₹{activePrice?.toLocaleString('en-IN')}</span>
              {activeMrp > activePrice && <span style={{ fontSize: 16, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{activeMrp?.toLocaleString('en-IN')}</span>}
              {activeDiscount > 0 && <span style={{ fontSize: 16, color: '#16a34a', fontWeight: 600 }}>{activeDiscount}% off</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>+₹149 Protect Promise Fee <FaChevronDown size={10} /></div>



            {/* Instant EMI Card */}
            <div className="mb-4 rounded-3 p-3 d-flex align-items-center gap-3" style={{ border: '1px solid #e0e0e0', background: 'white' }}>
              <div style={{ width: 40, height: 40, background: '#facc15', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2874f0', fontSize: 12 }}>EMI</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Instant EMI for everyone</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No Cost EMI* | Unlock ₹1 Lakh</div>
                <div onClick={() => setShowEmiModal(true)} style={{ fontSize: 13, fontWeight: 600, color: '#2874f0', cursor: 'pointer', marginTop: 2 }}>Click here for ShopSmart EMI</div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Delivery details</h3>
              <div className="rounded-3 overflow-hidden" style={{ border: '1px solid #e0e0e0' }}>
                <div style={{ background: '#f0f5ff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e0e0e0' }}>
                  <FaMapMarkerAlt color="#2874f0" />
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {isAuthenticated && user?.addresses?.[selectedAddressIdx] 
                      ? `${user.addresses[selectedAddressIdx].zipCode} - ${user.addresses[selectedAddressIdx].city}`
                      : 'Location not set'} 
                    <span onClick={() => setShowAddressModal(true)} style={{ color: '#2874f0', cursor: 'pointer', marginLeft: 8 }}>Select delivery location {'>'}</span>
                  </span>
                </div>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'flex-start', gap: 12, background: 'white' }}>
                  <FaTruck color="var(--text-muted)" style={{ marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Delivery by {deliveryFormatted}</div>
                    <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500 }}>Order in 01h 59m</div>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f9fafb' }}>
                  <FaShieldAlt color="var(--text-muted)" style={{ marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>Fulfilled by ShopSmart</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>4.8★ • 4 years with ShopSmart</div>
                    <div onClick={() => navigate('/products')} style={{ fontSize: 13, fontWeight: 600, color: '#2874f0', cursor: 'pointer', marginTop: 4 }}>See other sellers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Peace of mind */}
            <div className="mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Shop with peace of mind</h3>
              <div className="rounded-3 mb-3 p-3" style={{ background: '#f9fafb', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <FaShieldAlt color="#2874f0" size={24} />
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{product.warranty || '12 Months domestic warranty'}</span>
              </div>
              <div className="d-flex justify-content-between text-center px-2">
                <div style={{ flex: 1 }}>
                  <div style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUndo color="#2874f0" /></div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>7-day<br/>brand support</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTag color="#2874f0" /></div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>Cash on<br/>Delivery</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheckCircle color="#2874f0" /></div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>ShopSmart<br/>Assured</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isAdmin && (
              <div className="d-flex gap-3 mb-4 flex-wrap align-items-center mt-4">
                {activeStock > 0 && (
                  <div className="d-flex align-items-center rounded" style={{ border: '1px solid #e0e0e0', padding: '4px' }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn" style={{ background: 'transparent', border: 'none', width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>-</button>
                    <div style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{quantity}</div>
                    <button onClick={() => setQuantity(q => Math.min(activeStock, q + 1))} className="btn" style={{ background: 'transparent', border: 'none', width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>+</button>
                  </div>
                )}
                
                <button onClick={handleAddToCart} disabled={addingToCart || activeStock === 0}
                  className="btn"
                  style={{ background: activeStock === 0 ? '#e0e0e0' : '#ff9f00', color: 'white', border: 'none', padding: '14px 28px', fontWeight: 600, flex: 1, borderRadius: 2, fontSize: 16 }}>
                  {addingToCart ? 'ADDING...' : activeStock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                </button>

                <button onClick={handleBuyNow} disabled={activeStock === 0}
                  className="btn"
                  style={{ background: activeStock === 0 ? '#e0e0e0' : '#fb641b', color: 'white', padding: '14px 28px', fontWeight: 600, flex: 1, border: 'none', borderRadius: 2, fontSize: 16 }}>
                  {activeStock === 0 ? 'UNAVAILABLE' : 'BUY NOW'}
                </button>
              </div>
            )}

            {/* Admin View Banner */}
            {isAdmin && (
              <div className="p-3 rounded-3 mt-4" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>Admin Tools</div>
                <Link to="/admin/products" className="btn btn-sm mt-2" style={{ background: '#dc2626', color: 'white' }}>Edit Product</Link>
              </div>
            )}
            
          </div>
        </div>

        {/* Continuous Scrolling Sections */}
        <div className="mb-5" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Highlights & Description */}
          <div id="highlights" style={{ scrollMarginTop: 100 }}>
            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-4">
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Product highlights</h3>
                <div className="row g-3">
                  {product.highlights.map((h, i) => {
                    const [main, sub] = h.split('|');
                    return (
                      <div key={i} className="col-12 col-sm-6 d-flex gap-3">
                        <div style={{ width: 40, height: 40, background: '#f0f5ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaCheckCircle color="#2874f0" />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{main?.trim()}</div>
                          {sub && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub.trim()}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Product Description</h3>
            <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: 14 }}>{product.description}</div>
          </div>

          <hr style={{ margin: 0, borderColor: '#e0e0e0' }} />

          {/* Specifications Section */}
          <div id="specifications" style={{ scrollMarginTop: 100 }}>
            <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>Specifications</h3>
            
            {product.detailedSpecs && product.detailedSpecs.length > 0 ? (
              <div className="d-flex flex-column gap-4">
                {product.detailedSpecs.map((specGroup, i) => (
                  <div key={i}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>{specGroup.group}</h4>
                    <div className="table-responsive">
                      <table className="table table-borderless" style={{ color: 'var(--text-primary)', fontSize: 14, margin: 0 }}>
                        <tbody>
                          {specGroup.attributes.map((attr, j) => (
                            <tr key={j}>
                              <td style={{ color: 'var(--text-muted)', width: '30%', padding: '8px 0' }}>{attr.key}</td>
                              <td style={{ color: 'var(--text-primary)', padding: '8px 0' }}>{attr.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Fallback to simple map if detailedSpecs is empty
              <div className="table-responsive">
                <table className="table" style={{ color: 'var(--text-primary)', borderColor: '#e0e0e0' }}>
                  <tbody>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key}>
                          <td style={{ fontWeight: 600, width: '35%', background: '#f9fafb', borderColor: '#e0e0e0', padding: '12px 16px' }}>{key}</td>
                          <td style={{ background: 'white', borderColor: '#e0e0e0', padding: '12px 16px' }}>{val}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2" className="text-muted text-center py-4">No detailed specifications available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <hr style={{ margin: 0, borderColor: 'var(--border-color)' }} />

          {/* Reviews Section */}
          <div id="reviews" style={{ scrollMarginTop: 100 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>Customer Reviews</h3>
            {/* Rating Summary */}
            <div className="custom-card p-4 mb-4">
              <div className="row align-items-center">
                <div className="col-md-3 text-center">
                  <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{product.avgRating?.toFixed(1) || '0.0'}</div>
                  <div className="d-flex justify-content-center gap-1 my-2">{Array(5).fill(0).map((_, i) => <FaStar key={i} size={18} color={i < Math.round(product.avgRating || 0) ? '#f59e0b' : 'var(--border-color)'} />)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.numReviews} reviews</div>
                </div>
                <div className="col-md-9 mt-3 mt-md-0">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 14 }}>{star}</span>
                        <FaStar size={12} color="#f59e0b" />
                        <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {isAuthenticated && !isAdmin && <ReviewForm productId={id} onSubmit={handleReviewSubmit} />}
            {!isAuthenticated && <div className="p-4 text-center custom-card mb-4"><p style={{ color: 'var(--text-muted)' }}>Please <Link to="/login" style={{ color: 'var(--primary)' }}>login</Link> to write a review</p></div>}

            {reviews.length === 0 ? (
              <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map(r => <ReviewCard key={r._id} review={r} onUpdate={handleReviewAdded} />)}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mb-5">
            <h2 className="section-title mb-4" style={{ fontSize: '1.5rem' }}>Related Products</h2>
            <div className="row g-3">
              {related.map(p => <div key={p._id} className="col-6 col-md-3"><ProductCard product={p} /></div>)}
            </div>
          </div>
        )}
      </div>

      {/* EMI Modal */}
      {showEmiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 style={{ margin: 0, fontWeight: 700 }}>EMI Options</h4>
              <button onClick={() => setShowEmiModal(false)} className="btn btn-sm" style={{ fontWeight: 800 }}>X</button>
            </div>
            <table className="table table-bordered text-center">
              <thead style={{ background: '#f8f9fa' }}><tr><th>Plan</th><th>EMI/Month</th><th>Interest</th><th>Total</th></tr></thead>
              <tbody>
                {emiPlans.map(plan => {
                  const interestAmount = (activePrice * plan.interest * (plan.months/12)) / 100;
                  const totalAmount = activePrice + interestAmount;
                  const emi = Math.round(totalAmount / plan.months);
                  return (
                    <tr key={plan.months}>
                      <td>{plan.months} Months</td>
                      <td style={{ fontWeight: 600 }}>₹{emi.toLocaleString('en-IN')}</td>
                      <td style={{ color: plan.interest === 0 ? '#16a34a' : 'inherit' }}>{plan.interest === 0 ? 'No Cost' : `${plan.interest}% p.a.`}</td>
                      <td>₹{Math.round(totalAmount).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 style={{ margin: 0, fontWeight: 700 }}>Select Delivery Location</h4>
              <button onClick={() => setShowAddressModal(false)} className="btn btn-sm" style={{ fontWeight: 800 }}>X</button>
            </div>

            {isAuthenticated ? (
              <>
                {user?.addresses?.length > 0 ? (
                  <div className="d-flex flex-column gap-2 mb-4">
                    {user.addresses.map((addr, idx) => (
                      <div key={idx} onClick={() => { setSelectedAddressIdx(idx); setShowAddressModal(false); }}
                        style={{ border: `2px solid ${selectedAddressIdx === idx ? '#2874f0' : '#e0e0e0'}`, borderRadius: 8, padding: 16, cursor: 'pointer' }}>
                        <div style={{ fontWeight: 600 }}>{addr.street}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{addr.city}, {addr.state} - {addr.zipCode}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-4">No saved addresses.</p>
                )}

                {!showAddForm ? (
                  <button onClick={() => setShowAddForm(true)} className="btn w-100" style={{ border: '1px dashed #2874f0', color: '#2874f0', fontWeight: 600, padding: 12 }}>+ Add New Address</button>
                ) : (
                  <form onSubmit={handleAddAddress} className="mt-3">
                    <h6 style={{ fontWeight: 600, marginBottom: 12 }}>Add New Address</h6>
                    <div className="row g-2">
                      <div className="col-12"><input className="form-control" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} required /></div>
                      <div className="col-6"><input className="form-control" placeholder="City" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} required /></div>
                      <div className="col-6"><input className="form-control" placeholder="State" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} required /></div>
                      <div className="col-6"><input className="form-control" placeholder="ZIP Code" value={newAddress.zipCode} onChange={e => setNewAddress(p => ({ ...p, zipCode: e.target.value }))} required /></div>
                      <div className="col-6"><input className="form-control" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress(p => ({ ...p, country: e.target.value }))} required /></div>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button type="submit" className="btn" style={{ flex: 1, background: '#2874f0', color: 'white', fontWeight: 600 }}>Save Address</button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline-secondary">Cancel</button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-3">Please login to see or add your delivery addresses.</p>
                <button onClick={() => { setShowAddressModal(false); navigate('/login'); }} className="btn" style={{ background: '#2874f0', color: 'white', fontWeight: 600 }}>Login to Continue</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
