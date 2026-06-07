import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaRupeeSign, FaShoppingBag, FaUsers, FaBox,
  FaArrowUp, FaArrowDown, FaFire, FaExclamationTriangle, FaChartLine
} from 'react-icons/fa';
import {
  Line, Bar, Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { AdminLayout } from '../../components/admin/AdminSidebar';
import adminService from '../../services/adminService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const STATUS_COLORS = {
  Processing: '#f59e0b', Confirmed: '#3b82f6', Shipped: '#8b5cf6',
  OutForDelivery: '#f97316', Delivered: '#10b981', Cancelled: '#ef4444'
};

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ label, value, icon, color, bg, trend, trendLabel, loading }) {
  if (loading) return <div className="skeleton" style={{ height: 140, borderRadius: 16 }} />;
  const positive = trend >= 0;
  return (
    <div className="custom-card p-4 h-100" style={{ borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 20 }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 20,
            background: positive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: positive ? '#10b981' : '#ef4444',
            display: 'flex', alignItems: 'center', gap: 3
          }}>
            {positive ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
      {trendLabel && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{trendLabel}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('monthly'); // monthly | daily

  useEffect(() => {
    adminService.getDashboard()
      .then(r => setStats(r.data?.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ─── Revenue line chart ────────────────────────────────────────────────────
  const revenueChart = stats ? (() => {
    const src = chartPeriod === 'daily' ? stats.dailyRevenue : stats.monthlyRevenue;
    const labels = src?.map(m =>
      chartPeriod === 'daily'
        ? new Date(m._id + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : `${MONTH_NAMES[m._id?.month || 0]} ${m._id?.year || ''}`
    ) || [];
    const data = src?.map(m => m.revenue || 0) || [];
    return {
      labels,
      datasets: [{
        label: 'Revenue (₹)',
        data,
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 7,
      }],
    };
  })() : null;

  const revenueChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `₹${(ctx.raw || 0).toLocaleString('en-IN')}` } }
    },
    scales: {
      x: { grid: { color: 'rgba(100,116,139,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: {
        grid: { color: 'rgba(100,116,139,0.1)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) }
      },
    },
  };

  // ─── Order status doughnut ─────────────────────────────────────────────────
  const statusChart = stats?.orderStatusDistribution ? {
    labels: stats.orderStatusDistribution.map(s => s._id),
    datasets: [{
      data: stats.orderStatusDistribution.map(s => s.count),
      backgroundColor: stats.orderStatusDistribution.map(s => STATUS_COLORS[s._id] || '#6366f1'),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  } : null;

  // ─── Category sales bar chart ──────────────────────────────────────────────
  const categoryChart = stats?.categorySales ? {
    labels: stats.categorySales.map(c => c.name),
    datasets: [{
      label: 'Revenue (₹)',
      data: stats.categorySales.map(c => c.totalRevenue),
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'].slice(0, stats.categorySales.length),
      borderRadius: 8,
      borderSkipped: false,
    }],
  } : null;

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `₹${(ctx.raw || 0).toLocaleString('en-IN')}` } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(100,116,139,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) } },
    },
  };

  const statCards = stats ? [
    {
      label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString('en-IN') || 0}`,
      icon: <FaRupeeSign />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', trend: 12,
      trendLabel: `₹${stats.weekRevenue?.toLocaleString('en-IN') || 0} this week`
    },
    {
      label: 'Total Orders', value: stats.totalOrders || 0,
      icon: <FaShoppingBag />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', trend: 8,
      trendLabel: `${stats.todayOrders || 0} orders today`
    },
    {
      label: 'Total Users', value: stats.totalUsers || 0,
      icon: <FaUsers />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', trend: 15,
      trendLabel: 'Registered customers'
    },
    {
      label: 'Total Products', value: stats.totalProducts || 0,
      icon: <FaBox />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', trend: 5,
      trendLabel: `${stats.lowStockProducts?.length || 0} low stock`
    },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, marginTop: -8 }}>
        Welcome back, Admin! Here's your store overview.
      </p>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="col-6 col-md-3"><div className="skeleton" style={{ height: 140, borderRadius: 16 }} /></div>)
          : statCards.map((card, i) => (
            <div key={i} className="col-6 col-md-3">
              <StatCard {...card} loading={false} />
            </div>
          ))}
      </div>

      {/* ── Today's Highlight ─────────────────────────────────────────────── */}
      {!loading && stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="custom-card p-4" style={{ borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📅 Today's Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>₹{stats.todayRevenue?.toLocaleString('en-IN') || 0}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{stats.todayOrders || 0} orders placed today</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="custom-card p-4" style={{ borderRadius: 16, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white' }}>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📆 This Week</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>₹{stats.weekRevenue?.toLocaleString('en-IN') || 0}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Last 7 days revenue</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="custom-card p-4" style={{ borderRadius: 16, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white' }}>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>⚠️ Low Stock Alert</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{stats.lowStockProducts?.length || 0}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Products need restocking</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Revenue Chart + Order Status ──────────────────────────────────── */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="custom-card p-4 h-100" style={{ borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaChartLine color="#6366f1" /> Revenue Analytics
              </h6>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['daily', '7 Days'], ['monthly', '6 Months']].map(([key, label]) => (
                  <button key={key} onClick={() => setChartPeriod(key)}
                    style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: chartPeriod === key ? '#6366f1' : 'var(--bg-secondary)',
                      color: chartPeriod === key ? 'white' : 'var(--text-muted)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 260 }}>
              {revenueChart && <Line data={revenueChart} options={revenueChartOptions} />}
              {loading && <div className="skeleton h-100 rounded-3" />}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="custom-card p-4 h-100" style={{ borderRadius: 16 }}>
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 20 }}>Order Status</h6>
            {statusChart && (
              <>
                <div style={{ height: 180, marginBottom: 16 }}>
                  <Doughnut data={statusChart} options={{
                    responsive: true, maintainAspectRatio: false, cutout: '65%',
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}` } } },
                  }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(stats?.orderStatusDistribution || []).map((s, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s._id] || '#6366f1', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s._id}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {loading && <div className="skeleton h-100 rounded-3" />}
          </div>
        </div>
      </div>

      {/* ── Category Sales + Top Products ──────────────────────────────────── */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="custom-card p-4 h-100" style={{ borderRadius: 16 }}>
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 20 }}>Category-wise Sales</h6>
            <div style={{ height: 220 }}>
              {categoryChart && <Bar data={categoryChart} options={barOptions} />}
              {loading && <div className="skeleton h-100 rounded-3" />}
              {!loading && !categoryChart && <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>No sales data yet</div>}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="custom-card p-4 h-100" style={{ borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaFire color="#f59e0b" size={14} /> Top Selling Products
              </h6>
            </div>
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="skeleton mb-2" style={{ height: 36, borderRadius: 8 }} />) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(stats?.topProducts || []).length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 30, fontSize: 13 }}>No sales data yet</div>
                ) : (stats?.topProducts || []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--bg-secondary)', color: i < 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <img src={p.image || 'https://placehold.co/32x32?text=P'} alt={p.name} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: 'var(--bg-secondary)', padding: 3 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.totalSold} units sold</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>₹{p.totalRevenue?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Low Stock Alert + Recent Orders ───────────────────────────────── */}
      <div className="row g-4">
        {/* Low Stock */}
        {!loading && stats?.lowStockProducts?.length > 0 && (
          <div className="col-md-4">
            <div className="custom-card p-4 h-100" style={{ borderRadius: 16, border: '1px solid rgba(245,158,11,0.3)' }}>
              <h6 style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaExclamationTriangle size={14} /> Low Stock Alert
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.lowStockProducts.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 10, background: p.stock === 0 ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)' }}>
                    <img src={p.images?.[0] || 'https://placehold.co/36x36?text=P'} alt={p.name} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: 'var(--bg-secondary)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: p.stock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                        {p.stock === 0 ? 'OUT OF STOCK' : `Only ${p.stock} left`}
                      </div>
                    </div>
                  </div>
                ))}
                <Link to="/admin/products" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', textAlign: 'center', marginTop: 4, display: 'block' }}>
                  Manage Products →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className={!loading && stats?.lowStockProducts?.length > 0 ? 'col-md-8' : 'col-12'}>
          <div className="custom-card p-4" style={{ borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>Recent Orders</h6>
              <Link to="/admin/orders" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
            </div>
            <div className="table-responsive">
              <table className="table mb-0" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border-color)', fontSize: 12 }}>
                    {['Order', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600, padding: '10px 12px', borderColor: 'var(--border-color)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} style={{ padding: 10, borderColor: 'var(--border-color)' }}><div className="skeleton" style={{ height: 32, borderRadius: 6 }} /></td></tr>
                  )) : (stats?.recentOrders || []).map(order => (
                    <tr key={order._id} style={{ borderColor: 'var(--border-color)', fontSize: 13 }}>
                      <td style={{ padding: '10px 12px', borderColor: 'var(--border-color)', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {order.orderNumber || `#${order._id?.slice(-6).toUpperCase()}`}
                      </td>
                      <td style={{ padding: '10px 12px', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{order.user?.name || 'N/A'}</td>
                      <td style={{ padding: '10px 12px', borderColor: 'var(--border-color)', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 12px', borderColor: 'var(--border-color)' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b' }}>{order.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '10px 12px', borderColor: 'var(--border-color)' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (STATUS_COLORS[order.orderStatus] || '#6366f1') + '20', color: STATUS_COLORS[order.orderStatus] || '#6366f1', whiteSpace: 'nowrap' }}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && (stats?.recentOrders || []).length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
