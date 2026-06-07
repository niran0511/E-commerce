import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaShoppingCart, FaHeart, FaUser, FaSearch, FaSun, FaMoon,
  FaSignOutAlt, FaClipboardList, FaTimes, FaTicketAlt,
  FaBox, FaUsers, FaChartBar
} from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { BsBagFill } from 'react-icons/bs';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); setUserMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const menuItemStyle = {
    color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 18px', textDecoration: 'none', background: 'transparent',
    border: 'none', width: '100%', transition: 'background 0.15s',
  };

  // Admin dropdown items
  const adminMenuItems = [
    { to: '/admin', icon: <FaChartBar size={13} />, label: 'Dashboard' },
    { to: '/admin/products', icon: <FaBox size={13} />, label: 'Products' },
    { to: '/admin/orders', icon: <FaClipboardList size={13} />, label: 'Orders' },
    { to: '/admin/coupons', icon: <FaTicketAlt size={13} />, label: 'Coupons' },
    { to: '/admin/users', icon: <FaUsers size={13} />, label: 'Users' },
  ];

  // User dropdown items
  const userMenuItems = [
    { to: '/profile', icon: <FaUser size={13} />, label: 'My Profile' },
    { to: '/orders', icon: <FaClipboardList size={13} />, label: 'My Orders' },
    { to: '/wishlist', icon: <FaHeart size={13} color="#ef4444" />, label: 'Wishlist' },
  ];

  return (
    <nav className="navbar-custom sticky-top" style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'all 0.3s ease', zIndex: 1000, padding: '0'
    }}>
      <div className="container-fluid px-4" style={{ maxWidth: 1400 }}>
        <div className="d-flex align-items-center justify-content-between" style={{ height: 64 }}>

          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="text-decoration-none d-flex align-items-center gap-2" style={{ minWidth: 160 }}>
            <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: 'var(--gradient-primary)' }}>
              <BsBagFill size={20} color="white" />
            </div>
            <span className="fw-800 gradient-text" style={{ fontSize: 20, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              ShopSmart <span style={{ color: 'var(--accent)', WebkitTextFillColor: 'var(--accent)' }}>AI</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="d-none d-md-flex flex-grow-1 mx-4" style={{ maxWidth: 520 }}>
            <div className="input-group">
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..." className="form-control border-0 shadow-none"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '24px 0 0 24px', fontSize: 14, padding: '12px 20px' }} />
              <button type="submit" className="btn border-0 shadow-none" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '0 24px 24px 0', padding: '0 20px' }}>
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-2">

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="btn btn-sm rounded-3 d-none d-md-flex align-items-center gap-1"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px' }}>
              {theme === 'dark' ? <FaSun color="#f59e0b" size={15} /> : <FaMoon size={15} />}
            </button>

            {/* === USER-ONLY actions: Wishlist + Cart === */}
            {!isAdmin && (
              <>
                <Link to="/wishlist" className="btn btn-sm position-relative rounded-3 d-none d-md-flex align-items-center"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px' }}>
                  <FaHeart size={15} color="#ef4444" />
                  {wishlistCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ background: 'var(--danger)', fontSize: 9 }}>{wishlistCount}</span>}
                </Link>

                <Link to="/cart" className="btn btn-sm position-relative rounded-pill d-flex align-items-center gap-1 fw-600"
                  style={{ background: 'var(--primary)', color: 'white', padding: '10px 18px', fontSize: 14, border: 'none' }}>
                  <FaShoppingCart size={15} />
                  <span className="d-none d-md-inline">Cart</span>
                  {cartCount > 0 && <span className="badge rounded-pill ms-1" style={{ background: 'white', color: 'var(--primary)', fontSize: 10, padding: '3px 6px' }}>{cartCount}</span>}
                </Link>
              </>
            )}

            {/* === ADMIN quick links (desktop only) === */}
            {isAdmin && (
              <div className="d-none d-md-flex gap-1">
                {adminMenuItems.slice(0, 3).map(item => (
                  <Link key={item.to} to={item.to}
                    className="btn btn-sm d-flex align-items-center gap-1"
                    style={{
                      background: location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to))
                        ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                      color: location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to))
                        ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12, padding: '7px 12px',
                    }}>
                    {item.icon}<span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* User Menu Dropdown */}
            {isAuthenticated ? (
              <div className="position-relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="btn btn-sm rounded-3 d-flex align-items-center gap-2"
                  style={{ background: isAdmin ? 'rgba(99,102,241,0.12)' : 'var(--bg-secondary)', border: `1px solid ${isAdmin ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`, color: 'var(--text-primary)', padding: '7px 12px' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 28, height: 28, background: 'var(--gradient-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline" style={{ fontSize: 13 }}>{user?.name?.split(' ')[0]}</span>
                  <span style={{ fontSize: 10 }}>▾</span>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 240, zIndex: 9999,
                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                    borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.18)', overflow: 'hidden',
                  }}>
                    {/* User Info Header */}
                    <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                      <span style={{
                        fontSize: 10, borderRadius: 20, padding: '2px 10px', marginTop: 5, display: 'inline-block', fontWeight: 700,
                        background: isAdmin ? 'var(--gradient-primary)' : 'rgba(16,185,129,0.15)',
                        color: isAdmin ? 'white' : '#059669'
                      }}>
                        {isAdmin ? '⚙️ ADMIN' : '🛍️ Customer'}
                      </span>
                    </div>

                    {/* Admin Menu */}
                    {isAdmin ? (
                      <>
                        {adminMenuItems.map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                            style={{ ...menuItemStyle }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >{item.icon}{item.label}</Link>
                        ))}
                      </>
                    ) : (
                      // User Menu
                      userMenuItems.map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                          style={{ ...menuItemStyle }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >{item.icon}{item.label}</Link>
                      ))
                    )}

                    <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
                    <button onClick={handleLogout}
                      style={{ ...menuItemStyle, color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    ><FaSignOutAlt size={13} />Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-sm rounded-3 d-none d-md-inline-flex align-items-center"
                  style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '8px 16px', fontSize: 13 }}>Login</Link>
                <Link to="/register" className="btn btn-sm btn-gradient rounded-3 d-none d-md-inline-flex align-items-center"
                  style={{ padding: '8px 16px', fontSize: 13 }}>Register</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="btn btn-sm d-md-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px' }}>
              {mobileMenuOpen ? <FaTimes /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="d-md-none py-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
            <form onSubmit={handleSearch} className="mb-3">
              <div className="input-group">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="form-control"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px 0 0 10px' }} />
                <button type="submit" className="btn" style={{ background: 'var(--gradient-primary)', color: 'white', borderRadius: '0 10px 10px 0' }}><FaSearch /></button>
              </div>
            </form>
            <div className="d-flex flex-column gap-1">
              {isAdmin ? (
                // Admin mobile menu
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: 1 }}>Admin Panel</div>
                  {adminMenuItems.map(item => (
                    <Link key={item.to} to={item.to} className="btn text-start d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>{item.icon}{item.label}</Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 8px' }} />
                  <Link to="/profile" className="btn text-start" style={{ color: 'var(--text-primary)' }}>👤 My Profile</Link>
                </>
              ) : (
                // User mobile menu
                <>
                  <Link to="/" className="btn text-start" style={{ color: 'var(--text-primary)' }}>🏠 Home</Link>
                  <Link to="/products" className="btn text-start" style={{ color: 'var(--text-primary)' }}>🛍️ Products</Link>
                  <Link to="/wishlist" className="btn text-start d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FaHeart color="#ef4444" /> Wishlist {wishlistCount > 0 && <span className="badge" style={{ background: 'var(--danger)' }}>{wishlistCount}</span>}
                  </Link>
                  <Link to="/cart" className="btn text-start d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FaShoppingCart color="var(--primary)" /> Cart {cartCount > 0 && <span className="badge" style={{ background: 'var(--primary)' }}>{cartCount}</span>}
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link to="/profile" className="btn text-start" style={{ color: 'var(--text-primary)' }}>👤 My Profile</Link>
                      <Link to="/orders" className="btn text-start" style={{ color: 'var(--text-primary)' }}>📦 My Orders</Link>
                    </>
                  )}
                </>
              )}

              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn text-danger text-start d-flex align-items-center gap-2"><FaSignOutAlt /> Logout</button>
              ) : (
                <>
                  <Link to="/login" className="btn" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Login</Link>
                  <Link to="/register" className="btn btn-gradient">Register</Link>
                </>
              )}

              <button onClick={toggleTheme} className="btn text-start d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                {theme === 'dark' ? <><FaSun color="#f59e0b" /> Light Mode</> : <><FaMoon /> Dark Mode</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
