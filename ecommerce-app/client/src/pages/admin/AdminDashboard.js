import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import '../Pages.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, salesRes, productsRes, lowStockRes, categoryRes] = await Promise.all([
        adminService.getStats(),
        adminService.getSalesChart(),
        adminService.getTopProducts(),
        adminService.getLowStock(),
        adminService.getCategorySales()
      ]);
      setStats(statsRes.data);
      setSalesData(salesRes.data);
      setTopProducts(productsRes.data);
      setLowStock(lowStockRes.data);
      setCategorySales(categoryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `Rs. ${(parseFloat(amount) || 0).toLocaleString()}`;

  const getMaxRevenue = () => {
    if (!salesData.length) return 1;
    return Math.max(...salesData.map(d => parseFloat(d.revenue) || 0), 1);
  };

  const getBarHeight = (value) => {
    const max = getMaxRevenue();
    return Math.max((value / max) * 100, 5);
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loading" style={{ margin: '0 auto' }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '42px', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '16px' }}>
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {[
            { icon: '📦', value: stats?.totalOrders || 0, label: 'Total Orders', color: '#4caf50', sub: `+${stats?.todayOrders || 0} today` },
            { icon: '💰', value: formatCurrency(stats?.totalRevenue), label: 'Total Revenue', color: '#6e5939', sub: formatCurrency(stats?.todayRevenue) + ' today' },
            { icon: '🎁', value: stats?.totalProducts || 0, label: 'Products', color: '#2196f3', sub: `${stats?.totalStock || 0} in stock` },
            { icon: '👥', value: stats?.totalUsers || 0, label: 'Customers', color: '#9c27b0', sub: `+${stats?.monthOrders || 0} this month` }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: stat.color, opacity: 0.1, borderRadius: '0 0 0 60px' }}></div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Playfair Display', serif", color: stat.color, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '12px', color: '#4caf50', marginTop: '8px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['overview', 'products', 'customers', 'alerts'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: activeTab === tab ? 'var(--color-primary)' : 'var(--color-surface-container)',
              color: activeTab === tab ? 'white' : 'var(--color-on-surface)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease'
            }}>
              {tab === 'overview' && '📊 '} {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Sales Chart */}
            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>
                📈 Sales Last 7 Days
              </h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '20px 0' }}>
                {salesData.length === 0 ? (
                  <div style={{ width: '100%', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>No sales data yet</div>
                ) : (
                  salesData.map((day, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '100%',
                        height: `${getBarHeight(day.revenue)}px`,
                        background: 'linear-gradient(180deg, #6e5939 0%, #88714f 100%)',
                        borderRadius: '8px 8px 0 0',
                        minHeight: '20px',
                        transition: 'height 0.5s ease'
                      }}></div>
                      <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>{getDayName(day.date)}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>{formatCurrency(day.revenue)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category Sales */}
            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>
                📊 Sales by Category
              </h2>
              {categorySales.length === 0 ? (
                <div style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '40px' }}>No data</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {categorySales.map((cat, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{cat.category || 'Uncategorized'}</span>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatCurrency(cat.revenue)}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--color-surface-container)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(cat.revenue / (categorySales[0]?.revenue || 1)) * 100}%`,
                          background: 'linear-gradient(90deg, #6e5939 0%, #88714f 100%)',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                        {cat.quantity} items sold
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top Products */}
            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>
                🏆 Top Selling Products
              </h2>
              {topProducts.length === 0 ? (
                <div style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '40px' }}>No products yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--color-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{product.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{product.total_sold} sold</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(product.total_revenue)}</div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/admin/inventory" style={{ display: 'block', marginTop: '20px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>View All Products →</Link>
            </div>

            {/* Low Stock Alert */}
            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Low Stock Alert
              </h2>
              {lowStock.length === 0 ? (
                <div style={{ color: '#4caf50', textAlign: 'center', padding: '40px' }}>✅ All products are well stocked!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {lowStock.map((product, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: product.stock <= 5 ? 'rgba(186, 26, 26, 0.1)' : 'rgba(255, 152, 0, 0.1)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${product.stock <= 5 ? '#ba1a1a' : '#ff9800'}` }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{product.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: product.stock <= 5 ? '#ba1a1a' : '#ff9800' }}>{product.stock} left</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>{formatCurrency(product.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/admin/inventory" style={{ display: 'block', marginTop: '20px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>Manage Inventory →</Link>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>
              👥 Customer Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'center', padding: '24px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)', fontFamily: "'Playfair Display', serif" }}>{stats?.totalUsers || 0}</div>
                <div style={{ color: 'var(--color-on-surface-variant)' }}>Total Customers</div>
              </div>
              <div style={{ textAlign: 'center', padding: '24px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#4caf50', fontFamily: "'Playfair Display', serif" }}>{stats?.monthOrders || 0}</div>
                <div style={{ color: 'var(--color-on-surface-variant)' }}>Orders This Month</div>
              </div>
              <div style={{ textAlign: 'center', padding: '24px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#2196f3', fontFamily: "'Playfair Display', serif" }}>{formatCurrency(stats?.monthRevenue)}</div>
                <div style={{ color: 'var(--color-on-surface-variant)' }}>Revenue This Month</div>
              </div>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Customer details feature coming soon...</p>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px', color: '#ba1a1a' }}>
                🚨 Urgent Alerts
              </h2>
              {lowStock.filter(p => p.stock <= 5).length === 0 ? (
                <div style={{ color: '#4caf50', textAlign: 'center', padding: '40px' }}>✅ No urgent alerts!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {lowStock.filter(p => p.stock <= 5).map((product, index) => (
                    <div key={index} style={{ padding: '16px', background: 'rgba(186, 26, 26, 0.1)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #ba1a1a' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{product.name}</div>
                      <div style={{ color: '#ba1a1a', fontWeight: 700 }}>Only {product.stock} left in stock!</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '24px', color: '#ff9800' }}>
                ⚠️ Warnings
              </h2>
              {lowStock.filter(p => p.stock > 5 && p.stock <= 10).length === 0 ? (
                <div style={{ color: '#4caf50', textAlign: 'center', padding: '40px' }}>✅ No warnings!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {lowStock.filter(p => p.stock > 5 && p.stock <= 10).map((product, index) => (
                    <div key={index} style={{ padding: '16px', background: 'rgba(255, 152, 0, 0.1)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #ff9800' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{product.name}</div>
                      <div style={{ color: '#ff9800', fontWeight: 700 }}>Running low: {product.stock} left</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '32px' }}>
          <Link to="/admin/orders" style={{ textDecoration: 'none', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
            <div>
              <h3 style={{ fontSize: '18px', fontFamily: "'Playfair Display', serif", marginBottom: '4px' }}>Manage Orders</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>View, update, and track orders</p>
            </div>
          </Link>
          <Link to="/admin/inventory" style={{ textDecoration: 'none', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📊</div>
            <div>
              <h3 style={{ fontSize: '18px', fontFamily: "'Playfair Display', serif", marginBottom: '4px' }}>Inventory</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Add products & manage stock</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;