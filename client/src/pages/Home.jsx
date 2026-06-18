import React, { useState, useEffect, useRef, useCallback } from 'react';
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

/* ─── Scroll-Reveal Hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ─── Parallax value from scroll ─── */
function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handler = () => setOffset(window.scrollY * speed);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [speed]);
  return offset;
}

/* ─── ScrollReveal wrapper component ─── */
function Reveal({ children, delay = 0, direction = 'up', className = '', style = {} }) {
  const [ref, visible] = useScrollReveal(0.12);
  const transforms = {
    up: 'translateY(60px)',
    down: 'translateY(-60px)',
    left: 'translateX(-60px)',
    right: 'translateX(60px)',
    scale: 'scale(0.85)',
  };
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0) scale(1)' : transforms[direction],
      transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [mobilePhones, setMobilePhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const heroRef = useRef(null);
  const parallaxOffset = useParallax(0.25);

  /* Spotlight cursor tracking */
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  /* Light sweep animation state */
  const [sweepActive, setSweepActive] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepActive(false);
      setTimeout(() => setSweepActive(true), 100);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [heroProducts, setHeroProducts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [h, f, n, b, m] = await Promise.all([
          productService.getHeroProducts(),
          productService.getFeatured(),
          productService.getNewArrivals(),
          productService.getBestSellers(),
          productService.getProducts({ search: 'mobile', limit: 8 }),
        ]);
        setHeroProducts(h.data?.data?.products || []);
        setFeatured(f.data?.data?.products || []);
        setNewArrivals(n.data?.data?.products || []);
        setBestSellers(b.data?.data?.products || []);
        setMobilePhones(m.data?.data?.products || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Spotlight + Glassmorphism + Parallax + 3D
         ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="hero-immersive"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: isDark
            ? 'radial-gradient(ellipse at 30% 20%, #1e1b4b 0%, #111827 50%, #0f172a 100%)'
            : 'radial-gradient(ellipse at 30% 20%, #ede9fe 0%, #f8fafc 50%, #eef2ff 100%)',
        }}
      >
        {/* Spotlight / cursor glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)'}, transparent 60%)`,
          transition: 'background 0.15s ease',
        }} />

        {/* Light sweep */}
        <div className={sweepActive ? 'light-sweep-active' : ''} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          overflow: 'hidden',
        }}>
          <div className="light-sweep-beam" />
        </div>

        {/* Parallax orbs */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.12)',
          filter: 'blur(80px)',
          top: -100 - parallaxOffset * 0.5, right: -100,
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.1)',
          filter: 'blur(60px)',
          bottom: -80 + parallaxOffset * 0.3, left: -80,
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: isDark ? 'rgba(236,72,153,0.06)' : 'rgba(236,72,153,0.08)',
          filter: 'blur(50px)',
          top: '40%', left: '60%',
          transform: `translateY(${parallaxOffset * -0.2}px)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Main hero content */}
        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div className="row align-items-center" style={{ minHeight: '85vh' }}>

            {/* Left: Text */}
            <div className="col-lg-6">
              <div style={{ transform: `translateY(${parallaxOffset * -0.15}px)` }}>
                {/* Badge */}
                <div className="hero-badge-glass fade-in delay-1" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 20px', borderRadius: 50,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.15)'}`,
                  marginBottom: 28,
                }}>
                  <BsStars color="#8b5cf6" size={16} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', letterSpacing: 0.5 }}>AI-POWERED SHOPPING</span>
                </div>

                {/* Heading */}
                <h1 className="fade-in delay-2" style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: 'var(--text-primary)',
                  marginBottom: 20,
                  letterSpacing: '-1.5px',
                }}>
                  Shop{' '}
                  <span style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>Smarter</span>
                  <br />
                  With{' '}
                  <span className="hero-shimmer-text" style={{
                    position: 'relative',
                    color: 'var(--text-primary)',
                  }}>
                    AI
                    <svg style={{ position: 'absolute', bottom: -4, left: 0, width: '100%' }} viewBox="0 0 100 12" preserveAspectRatio="none">
                      <path d="M0 8 Q25 0 50 6 Q75 12 100 4" stroke="url(#underline-grad)" strokeWidth="3" fill="none" strokeLinecap="round">
                        <animate attributeName="d" dur="3s" repeatCount="indefinite"
                          values="M0 8 Q25 0 50 6 Q75 12 100 4;M0 6 Q25 10 50 4 Q75 0 100 8;M0 8 Q25 0 50 6 Q75 12 100 4" />
                      </path>
                      <defs>
                        <linearGradient id="underline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>

                {/* Sub text */}
                <p className="fade-in delay-3" style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  maxWidth: 480,
                  marginBottom: 36,
                }}>
                  Discover curated collections, get personalized recommendations, and enjoy a seamless shopping experience powered by artificial intelligence.
                </p>

                {/* CTA Buttons */}
                <div className="d-flex flex-wrap gap-3 fade-in delay-4">
                  <button
                    onClick={() => navigate('/products')}
                    className="hero-cta-primary"
                    style={{
                      background: 'var(--gradient-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '16px 36px',
                      borderRadius: 16,
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
                      transition: 'all 0.3s cubic-bezier(.16,1,.3,1)',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    Start Shopping <FaArrowRight size={15} />
                  </button>

                  {/* Glass button */}
                  <button
                    onClick={() => navigate('/products?featured=true')}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.2)'}`,
                      color: 'var(--text-primary)',
                      padding: '16px 32px',
                      borderRadius: 16,
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Explore Deals
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="d-flex align-items-center gap-4 mt-5 fade-in delay-5">
                  <div className="d-flex" style={{ marginRight: -8 }}>
                    {['P', 'R', 'A', 'S'].map((letter, i) => (
                      <div key={i} style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: ['#6366f1', '#ec4899', '#f59e0b', '#10b981'][i],
                        color: 'white', fontWeight: 700, fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${isDark ? '#111827' : '#ffffff'}`,
                        marginLeft: i > 0 ? -10 : 0,
                        zIndex: 4 - i,
                      }}>{letter}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      {[1,2,3,4,5].map(i => <FaStar key={i} color="#f59e0b" size={13} />)}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>10K+ Happy Customers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 3D Flamingo / Floating product showcase */}
            <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center" style={{ perspective: 1200 }}>
              <div style={{
                transform: `translateY(${parallaxOffset * -0.1}px)`,
                position: 'relative',
                width: '100%',
                maxWidth: 520,
                height: 520,
              }}>
                {/* Glassmorphism product cards floating in 3D */}
                {(heroProducts.length >= 3 ? heroProducts.slice(0, 3).map((p, i) => {
                  const positions = [
                    { rotate: 'rotateY(-8deg) rotateX(5deg)', top: '5%', left: '10%', delay: '0s', size: 180 },
                    { rotate: 'rotateY(12deg) rotateX(-3deg)', top: '15%', right: '5%', delay: '0.2s', size: 170 },
                    { rotate: 'rotateY(-5deg) rotateX(8deg)', bottom: '8%', left: '25%', delay: '0.4s', size: 200 }
                  ];
                  return {
                    _id: p._id,
                    img: p.images?.[0] || 'https://via.placeholder.com/300',
                    label: p.name,
                    price: `₹${p.price?.toLocaleString('en-IN')}`,
                    ...positions[i]
                  };
                }) : [
                  { _id: 'dummy1', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300', label: 'Smart Watch', price: '₹4,999', rotate: 'rotateY(-8deg) rotateX(5deg)', top: '5%', left: '10%', delay: '0s', size: 180 },
                  { _id: 'dummy2', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300', label: 'Headphones', price: '₹2,499', rotate: 'rotateY(12deg) rotateX(-3deg)', top: '15%', right: '5%', delay: '0.2s', size: 170 },
                  { _id: 'dummy3', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300', label: 'Sneakers', price: '₹3,299', rotate: 'rotateY(-5deg) rotateX(8deg)', bottom: '8%', left: '25%', delay: '0.4s', size: 200 },
                ]).map((item, i) => (
                  <div
                    key={item._id || i}
                    onClick={() => item._id.startsWith('dummy') ? navigate('/products') : navigate(`/products/${item._id}`)}
                    className="hero-float-card"
                    style={{
                      position: 'absolute',
                      ...Object.fromEntries(Object.entries({ top: item.top, left: item.left, right: item.right, bottom: item.bottom }).filter(([, v]) => v)),
                      width: item.size,
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: 20,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}`,
                      boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.08)',
                      padding: 14,
                      transform: item.rotate,
                      animationDelay: item.delay,
                      zIndex: 3 - i,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s ease',
                    }}
                  >
                    <div style={{
                      width: '100%', height: item.size * 0.65, borderRadius: 12,
                      overflow: 'hidden', marginBottom: 10,
                      background: 'var(--bg-secondary)',
                    }}>
                      <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>{item.price}</div>
                  </div>
                ))}

                {/* Central glowing orb */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 220, height: 220, borderRadius: '50%',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />

                {/* Sparkle dots */}
                {[
                  { top: '20%', left: '55%', size: 6, delay: '0s' },
                  { top: '60%', left: '12%', size: 4, delay: '1s' },
                  { top: '80%', right: '20%', size: 5, delay: '0.5s' },
                  { top: '10%', right: '30%', size: 3, delay: '1.5s' },
                ].map((dot, i) => (
                  <div key={i} className="sparkle-dot" style={{
                    position: 'absolute',
                    ...Object.fromEntries(Object.entries(dot).filter(([k]) => ['top','left','right','bottom'].includes(k))),
                    width: dot.size, height: dot.size, borderRadius: '50%',
                    background: 'var(--primary)',
                    animationDelay: dot.delay,
                    pointerEvents: 'none',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: `linear-gradient(to top, var(--bg-primary), transparent)`,
          zIndex: 4, pointerEvents: 'none',
        }} />

        {/* Scroll indicator */}
        <div className="scroll-indicator" style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR — Glassmorphism
         ═══════════════════════════════════════════════════════════ */}
      <Reveal>
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
      </Reveal>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORIES — Scroll Reveal
         ═══════════════════════════════════════════════════════════ */}
      <Reveal>
        <section className="py-4" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div className="d-flex justify-content-between overflow-auto pb-3 w-100 gap-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {CATEGORIES.map((cat, i) => (
                <Reveal key={i} delay={i * 0.06} direction="scale" style={{ minWidth: 72 }}>
                  <div className="text-center">
                    <Link to={`/products?category=${cat.name}`} className="text-decoration-none">
                      <div className="rounded-circle mb-2 mx-auto overflow-hidden shadow-sm" style={{ width: 64, height: 64, background: 'var(--bg-secondary)', border: '2px solid transparent', transition: 'border 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                        <img src={`https://picsum.photos/seed/${cat.slug}/150/150`} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, lineHeight: 1.2 }}>{cat.name.split(' ')[0]}</div>
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Scroll Reveal
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-4" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <Reveal>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Special For You</h2>
              <Link to="/products?featured=true" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none' }}>See all</Link>
            </div>
          </Reveal>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : featured.slice(0, 8).map((p, i) => (
                <Reveal key={p._id} delay={i * 0.08} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROMO BANNER — Parallax + Glassmorphism
         ═══════════════════════════════════════════════════════════ */}
      <Reveal>
        <section className="py-5">
          <div className="container">
            <div className="rounded-4 overflow-hidden p-5 text-white" style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              position: 'relative',
            }}>
              {/* Animated gradient orbs */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', animation: 'float 5s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', animation: 'float 7s ease-in-out infinite reverse' }} />
              <div className="row align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                <div className="col-md-7">
                  <div className="d-flex align-items-center gap-2 mb-2"><FaTag color="#f59e0b" /><span style={{ color: '#f59e0b', fontWeight: 600 }}>LIMITED TIME OFFER</span></div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>Get 25% Off with Code<br /><span style={{ color: '#a78bfa' }}>SUMMER25</span></h2>
                  <p style={{ opacity: 0.8, fontSize: 16 }}>Valid on orders above ₹2000. Limited stock. Don't miss out!</p>
                </div>
                <div className="col-md-5 text-center text-md-end mt-3 mt-md-0">
                  <button className="btn btn-lg hero-cta-primary" onClick={() => navigate('/products')} style={{ background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, borderRadius: 12, padding: '14px 32px', boxShadow: '0 4px 20px rgba(99,102,241,0.5)', border: 'none' }}>
                    Shop Now <FaArrowRight className="ms-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════════
          NEW ARRIVALS
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <Reveal>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1"><BsStars color="#6366f1" /><span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>JUST IN</span></div>
                <h2 className="section-title mb-0">New Arrivals</h2>
              </div>
              <Link to="/products?newArrival=true" className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1">View All <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : newArrivals.slice(0, 8).map((p, i) => (
                <Reveal key={p._id} delay={i * 0.08} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BEST SELLERS
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-5">
        <div className="container">
          <Reveal>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1"><FaStar color="#f59e0b" /><span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>TOP RATED</span></div>
                <h2 className="section-title mb-0">Best Sellers</h2>
              </div>
              <Link to="/products?bestSeller=true" className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1">View All <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : bestSellers.slice(0, 8).map((p, i) => (
                <Reveal key={p._id} delay={i * 0.08} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE PHONES
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <Reveal>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ fontSize: 16 }}>📱</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>LATEST TECH</span>
                </div>
                <h2 className="section-title mb-0">Mobile Phones</h2>
              </div>
              <Link to="/products?search=mobile" className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1">View All <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
          <div className="row g-3">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-4 col-lg-3"><SkeletonCard /></div>)
              : mobilePhones.slice(0, 8).map((p, i) => (
                <Reveal key={p._id} delay={i * 0.08} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS — Glassmorphism cards
         ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <Reveal>
            <div className="text-center mb-5">
              <h2 className="section-title">What Our Customers Say</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Trusted by thousands of happy shoppers across India</p>
            </div>
          </Reveal>
          <div className="row g-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.15} className="col-md-4">
                <div className="custom-card p-4 h-100" style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--border-color)'}`,
                }}>
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NEWSLETTER — Gradient
         ═══════════════════════════════════════════════════════════ */}
      <Reveal>
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
      </Reveal>
    </div>
  );
}
