import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import '../Pages.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminService.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'shipped': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatCurrency = (amount) => `Rs. ${(parseFloat(amount) || 0).toLocaleString()}`;

  const getTodayOrders = () => orders.filter(o => {
    const orderDate = new Date(o.created_at).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  }).length;

  const getTotalRevenue = () => orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

  // Filter orders
  let filteredOrders = orders;
  
  if (filter !== 'all') {
    filteredOrders = filteredOrders.filter(order => order.status === filter);
  }
  
  if (searchTerm) {
    filteredOrders = filteredOrders.filter(order => 
      order.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (dateFilter === 'today') {
    const today = new Date().toDateString();
    filteredOrders = filteredOrders.filter(o => new Date(o.created_at).toDateString() === today);
  } else if (dateFilter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= weekAgo);
  } else if (dateFilter === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= monthAgo);
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>All Orders</h1>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '16px' }}>{orders.length} total orders</p>
            </div>
            <Link to="/admin" className="btn btn-secondary" style={{ padding: '12px 24px' }}>← Back to Dashboard</Link>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ padding: '16px 24px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', fontFamily: "'Playfair Display', serif" }}>{getTodayOrders()}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>Today's Orders</div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#4caf50', fontFamily: "'Playfair Display', serif" }}>{formatCurrency(getTotalRevenue())}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>Total Revenue</div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff9800', fontFamily: "'Playfair Display', serif" }}>{statusCounts.pending}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>Pending Orders</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Search by name, order ID..." className="form-field" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ maxWidth: '300px', flex: 1 }} />
          <select className="form-field" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: '150px' }}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button key={status} onClick={() => setFilter(status)} style={{
              padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-full)', background: filter === status ? 'var(--color-primary)' : 'var(--color-surface-container)', color: filter === status ? 'white' : 'var(--color-on-surface)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {status === 'all' ? '📋' : status === 'pending' ? '⏳' : status === 'confirmed' ? '✅' : status === 'shipped' ? '🚚' : status === 'delivered' ? '🎉' : '❌'} {status} <span style={{ background: filter === status ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-container-low)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{statusCounts[status]}</span>
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📦</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>No orders found</h2>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>{filter !== 'all' ? `No ${filter} orders` : 'No orders yet'}</p>
          </div>
        ) : (
          <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-container)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Items</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} style={{ borderBottom: index < filteredOrders.length - 1 ? '1px solid var(--color-outline-variant)' : 'none' }}>
                    <td style={{ padding: '16px 20px' }}><span style={{ fontWeight: 700, fontSize: '15px' }}>#{order.id}</span></td>
                    <td style={{ padding: '16px 20px' }}>
                      <div><div style={{ fontWeight: 600 }}>{order.full_name}</div><div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{order.email}</div></div>
                    </td>
                    <td style={{ padding: '16px 20px' }}><span style={{ padding: '6px 12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>View Details</span></td>
                    <td style={{ padding: '16px 20px' }}><span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '16px' }}>{formatCurrency(order.total_price)}</span></td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>{order.status}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <Link to={`/admin/orders/${order.id}`} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-block' }}>View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;