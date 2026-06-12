import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers,
  FaStar, FaSignOutAlt, FaBars, FaTimes, FaTicketAlt, FaHeadset
} from 'react-icons/fa';
import { BsCartFill,BsBagFill } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path: '/admin',          label: 'Dashboard', icon: <FaTachometerAlt size={16} /> },
  { path: '/admin/products', label: 'Products',  icon: <FaBox size={16} /> },
  { path: '/admin/orders',   label: 'Orders',    icon: <FaShoppingBag size={16} /> },
  { path: '/admin/coupons',  label: 'Coupons',   icon: <FaTicketAlt size={16} /> },
  { path: '/admin/tickets',  label: 'Support Tickets', icon: <FaHeadset size={16} /> },
  { path: '/admin/hero',     label: 'Hero Setup', icon: <FaStar size={16} /> },
  { path: '/admin/users',    label: 'Users',     icon: <FaUsers size={16} /> },
  { path: '/admin/reviews',  label: 'Reviews',   icon: <FaStar size={16} /> },
];

const SIDEBAR_W = 240;

// AdminLayout wraps each admin page with fixed sidebar + scrollable main area
export function AdminLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #4c1d95 0%, #312e81 100%)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BsCartFill size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>ShopSmart AI</div>
            <div style={{ color: '#94a3b8', fontSize: 10 }}>Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10, marginBottom: 4,
                textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'white' : '#94a3b8',
                background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.4)', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ color: '#94a3b8', fontSize: 10 }}>Administrator</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'rgba(239,68,68,0.12)', color: '#fca5a5',
          border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10,
          padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
        >
          <FaSignOutAlt size={13} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Desktop Sidebar — fixed */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 1040, overflowY: 'auto',
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1039 }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar — slides in */}
      <aside style={{
        width: SIDEBAR_W, position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 1041, overflowY: 'auto',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        display: 'none',
      }} className="d-md-none">
        <SidebarContent />
      </aside>

      {/* Main Content — offset by sidebar width */}
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top header bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'var(--surface)', borderBottom: '1px solid var(--border-color)',
          padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <button className="d-md-none btn btn-sm" onClick={() => setMobileOpen(true)}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            <FaBars />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>{title}</h1>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              ← Visit Store
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '28px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// Keep backward-compatible default export
export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: SIDEBAR_W, flexShrink: 0, minHeight: '100vh',
      background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BsBagFill size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>ShopSmart AI</div>
            <div style={{ color: '#94a3b8', fontSize: 10 }}>Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map(item => {
          const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, marginBottom: 4,
              textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'white' : '#94a3b8',
              background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
            }}>
              {item.icon}{item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.4)', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div><div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{user?.name}</div><div style={{ color: '#94a3b8', fontSize: 10 }}>Administrator</div></div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <FaSignOutAlt size={13} /> Logout
        </button>
      </div>
    </aside>
  );
}
