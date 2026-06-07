import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaTruck, FaShieldAlt, FaUndo, FaRobot, FaStar, FaTag } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { useTheme } from '../context/ThemeContext';
import productService from '../services/productService';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', color: '#6366f1', slug: 'electronics' },
  { name: 'Fashion', icon: '👗', color: '#ec4899', slug: 'fashion' },
  { name: 'Home & Kitchen', icon: '🏠', color: '#f59e0b', slug: 'home-kitchen' },
  { name: 'Books', icon: '📚', color: '#10b981', slug: 'books' },
  { name: 'Sports & Fitness', icon: '⚽', color: '#3b82f6', slug: 'sports-fitness' },
  { name: 'Beauty & Personal Care', icon: '💄', color: '#8b5cf6', slug: 'beauty-personal-care' },
  { name: 'Toys & Games', icon: '🎮', color: '#ef4444', slug: 'toys-games' },
  { name: 'Groceries', icon: '🛒', color: '#84cc16', slug: 'groceries' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The AI assistant helped me find the perfect laptop within my budget. Amazing experience!' },
  { name: 'Rahul Gupta', location: 'Delhi', rating: 5, text: 'Fast delivery, great products, and the chatbot recommendations were spot on.' },
  { name: 'Anita Patel', location: 'Bangalore', rating: 5, text: 'ShopSmart AI is my go-to for all online shopping. Love the dark mode too!' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [f, n, b] = await Promise.all([
          productService.getFeatured(),
          productService.getNewArrivals(),
          productService.getBestSellers(),
        ]);
        setFeatured(f.data?.data?.products || []);
        setNewArrivals(n.data?.data?.products || []);
        setBestSellers(b.data?.data?.products || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);


  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* Mobile-First Rounded Hero */}
      <section style={{ background: 'var(--bg-primary)', padding: '20px 0' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '32px', 
                overflow: 'hidden',
                position: 'relative',
                minHeight: '280px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div className="row w-100 m-0 h-100">
                  <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center" style={{ zIndex: 2 }}>
                    <h2 style={{ 
                      fontFamily: 'var(--font-heading)', 
                      fontSize: 'clamp(2rem, 4vw, 3rem)', 
                      fontWeight: 800, 
                      lineHeight: 1.1, 
                      color: 'var(--text-primary)',
                      marginBottom: '8px'
                    }}>
                      Super Sale<br/>Discount
                    </h2>
                    <h3 style={{ 
                      fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
                      fontWeight: 700, 
                      color: 'var(--text-secondary)',
                      marginBottom: '24px'
                    }}>
                      Up to <span style={{ color: 'var(--text-primary)' }}>50%</span>
                    </h3>
                    
                    <div>
                      <button className="btn rounded-pill" onClick={() => navigate('/products')}
                        style={{ background: 'var(--primary)', color: 'white', fontWeight: 600, padding: '10px 24px', fontSize: 14, border: 'none' }}>
                        Shop Now
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-6 p-0 position-absolute position-md-relative h-100" style={{ right: 0, top: 0, opacity: 0.85, zIndex: 1 }}>
                     <img 
                       src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" 
                       alt="Sale Sneakers" 
                       style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.9, mixBlendMode: 'multiply' }} 
                     />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container py-3">
          <div className="row text-center g-0">
            {[
              { icon: <FaTruck color="#6366f1" />, label: 'Free Shipping', sub: 'Orders above ₹500' },
              { icon: <FaShieldAlt color="#10b981" />, label: 'Secure Payment', sub: '100% Protected' },
              { icon: <FaUndo color="#f59e0b" />, label: 'Easy Returns', sub: '30-day policy' },
              { icon: <FaRobot color="#8b5cf6" />, label: 'AI Assistant', sub: '24/7 Support' },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-3 py-3 d-flex align-items-center justify-content-center gap-3" style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ fontSize: 22 }}>{item.icon}</div>
                <div className="text-start">
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="py-4 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between overflow-auto pb-3 w-100 gap-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map((cat, i) => {
              return (
              <div key={i} className="text-center" style={{ minWidth: '72px' }}>
                <Link to={`/products?category=${cat.name}`} className="text-decoration-none">
                  <div className="rounded-circle mb-2 mx-auto overflow-hidden shadow-sm" style={{ width: 64, height: 64, background: 'var(--bg-secondary)', border: '2px solid transparent', transition: 'border 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <img src={`https://picsum.photos/seed/${cat.slug}/150/150`} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, lineHeight: 1.2 }}>{cat.name.split(' ')[0]}</div>
                </Link>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Special For You (Featured) */}
      <section className="py-4 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Special For You</h2>
            <Link to="/products?featured=true" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none' }}>See all</Link>
          </div>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : featured.slice(0, 8).map(p => <div key={p._id} className="col-6 col-md-4 col-lg-3"><ProductCard product={p} /></div>)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-5">
        <div className="container">
          <div className="rounded-4 overflow-hidden p-5 text-white" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.2)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(139,92,246,0.15)' }} />
            <div className="row align-items-center" style={{ position: 'relative', zIndex: 1 }}>
              <div className="col-md-7">
                <div className="d-flex align-items-center gap-2 mb-2"><FaTag color="#f59e0b" /><span style={{ color: '#f59e0b', fontWeight: 600 }}>LIMITED TIME OFFER</span></div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>Get 25% Off with Code<br /><span style={{ color: '#a78bfa' }}>SUMMER25</span></h2>
                <p style={{ opacity: 0.8, fontSize: 16 }}>Valid on orders above ₹2000. Limited stock. Don't miss out!</p>
              </div>
              <div className="col-md-5 text-center text-md-end mt-3 mt-md-0">
                <button className="btn btn-lg" onClick={() => navigate('/products')} style={{ background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, borderRadius: 12, padding: '14px 32px', boxShadow: '0 4px 20px rgba(99,102,241,0.5)' }}>
                  Shop Now <FaArrowRight className="ms-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1"><BsStars color="#6366f1" /><span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>JUST IN</span></div>
              <h2 className="section-title mb-0">New Arrivals</h2>
            </div>
            <Link to="/products?newArrival=true" className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1">View All <FaArrowRight size={12} /></Link>
          </div>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : newArrivals.slice(0, 8).map(p => <div key={p._id} className="col-6 col-md-4 col-lg-3"><ProductCard product={p} /></div>)}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1"><FaStar color="#f59e0b" /><span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>TOP RATED</span></div>
              <h2 className="section-title mb-0">Best Sellers</h2>
            </div>
            <Link to="/products?bestSeller=true" className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1">View All <FaArrowRight size={12} /></Link>
          </div>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : bestSellers.slice(0, 8).map(p => <div key={p._id} className="col-6 col-md-4 col-lg-3"><ProductCard product={p} /></div>)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">What Our Customers Say</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Trusted by thousands of happy shoppers across India</p>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="col-md-4">
                <div className="custom-card p-4 h-100">
                  <div className="d-flex mb-3">
                    {Array(t.rating).fill(0).map((_, si) => <FaStar key={si} color="#f59e0b" size={16} />)}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, fontSize: 18 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-5" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container text-center text-white">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: 12 }}>Stay in the Loop</h2>
          <p style={{ opacity: 0.9, fontSize: 16, marginBottom: 28 }}>Get the latest deals, new arrivals, and AI-powered recommendations in your inbox.</p>
          <div className="d-flex justify-content-center">
            <div className="input-group" style={{ maxWidth: 480 }}>
              <input type="email" placeholder="Enter your email address" className="form-control" style={{ padding: '14px 20px', fontSize: 15, border: 'none', borderRadius: '12px 0 0 12px' }} />
              <button className="btn" style={{ background: '#1e293b', color: 'white', fontWeight: 700, padding: '0 24px', borderRadius: '0 12px 12px 0', border: 'none' }}>Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
