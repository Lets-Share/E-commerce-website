import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import '../Pages.css';

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await adminService.getOrderDetails(id);
      setOrder(response.data.order);
      setItems(response.data.items);
      setStatus(response.data.order.status);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await adminService.updateOrderStatus(id, status);
      alert('✅ Order status updated successfully!');
      fetchOrderDetails();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => `Rs. ${(parseFloat(amount) || 0).toLocaleString()}`;

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

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

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
          <Link to="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '16px' }}>← Back to Orders</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>Order Details</h1>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '16px' }}>Order #{order?.id}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => window.print()} style={{ padding: '12px 24px', background: 'var(--color-surface-container)', border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: 600, cursor: 'pointer' }}>🖨️ Print</button>
            </div>
          </div>
        </div>

        {order && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div>
              {/* Order Status Card */}
              <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📋 Order Status
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: `${getStatusColor(status)}15`, borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '32px' }}>
                    {status === 'confirmed' ? '✅' : status === 'pending' ? '⏳' : status === 'shipped' ? '🚚' : status === 'delivered' ? '🎉' : status === 'cancelled' ? '❌' : '📦'}
                  </span>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: getStatusColor(status), textTransform: 'capitalize' }}>{status}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>Current Status</div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>Update Status:</label>
                  <select className="form-field" value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '14px' }}>
                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating} style={{ width: '100%', padding: '14px' }}>
                  {updating ? 'Updating...' : '✅ Update Status'}
                </button>
              </div>

              {/* Customer Info */}
              <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '20px' }}>👤 Customer Info</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>Name</span>
                    <span style={{ fontWeight: 600 }}>{order.full_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>Email</span>
                    <span style={{ fontWeight: 600 }}>{order.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>Phone</span>
                    <span style={{ fontWeight: 600 }}>{order.phone}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '20px' }}>📍 Shipping Address</h2>
                <div style={{ padding: '20px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', lineHeight: 1.6 }}>
                  {order.shipping_address}
                </div>
              </div>
            </div>

            {/* Right Column - Items */}
            <div>
              {/* Order Summary */}
              <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '20px' }}>📦 Order Summary</h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Order ID</span>
                  <span style={{ fontWeight: 700 }}>#{order.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Date</span>
                  <span style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Payment</span>
                  <span style={{ fontWeight: 600, color: '#4caf50' }}>Cash on Delivery</span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", marginBottom: '20px' }}>
                  Items ({items.length})
                </h2>

                {items.map((item, index) => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', marginBottom: index < items.length - 1 ? '12px' : 0 }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-secondary-container)', flexShrink: 0 }}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', opacity: 0.3 }}>📦</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>
                        {item.selected_color && <span style={{ marginRight: '8px' }}>Color: <strong>{item.selected_color}</strong></span>}
                        {item.selected_size && <span style={{ marginRight: '8px' }}>Size: <strong>{item.selected_size}</strong></span>}
                        {item.selected_material && <span style={{ marginRight: '8px' }}>Material: <strong>{item.selected_material}</strong></span>}
                        {item.selected_pattern && <span>Pattern: <strong>{item.selected_pattern}</strong></span>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '18px' }}>{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: "'Playfair Display', serif" }}>
                    {formatCurrency(order.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetails;