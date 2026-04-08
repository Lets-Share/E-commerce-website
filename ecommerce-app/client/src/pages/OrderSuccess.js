import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import './Pages.css';

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getById(id);
      setOrder(response.data.order);
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loading" style={{ margin: '0 auto' }}></div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      padding: '60px 20px'
    }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
        }}>
          <span style={{ fontSize: '48px', color: 'white' }}>✓</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '42px',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '12px'
          }}>
            Order Confirmed!
          </h1>
          <p style={{ 
            color: 'var(--color-on-surface-variant)',
            fontSize: '18px'
          }}>
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        {order && (
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            {/* Order Header */}
            <div style={{
              background: 'var(--color-primary)',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>Order ID</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                    #{order.id}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {order.status?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div style={{ padding: '32px' }}>
              {/* Shipping Address */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'var(--color-on-surface-variant)',
                  marginBottom: '16px'
                }}>
                  Shipping Address
                </h3>
                <div style={{
                  background: 'var(--color-surface-container)',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <p style={{ marginBottom: '8px', lineHeight: 1.6 }}>{order.shipping_address}</p>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>📞 {order.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'var(--color-on-surface-variant)',
                  marginBottom: '16px'
                }}>
                  Ordered Items ({items.length})
                </h3>
                {items.map((item, index) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'var(--color-surface-container)',
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: index < items.length - 1 ? '12px' : 0
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                        Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '2px solid var(--color-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Total Paid</span>
                <span style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  color: 'var(--color-primary)',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Rs. {order.total_price?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/products" 
            className="btn btn-primary"
            style={{ padding: '16px 32px' }}
          >
            Continue Shopping
          </Link>
          <Link 
            to="/" 
            className="btn btn-secondary"
            style={{ padding: '16px 32px' }}
          >
            Back to Home
          </Link>
        </div>

        {/* Info */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          padding: '24px',
          background: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '8px' }}>
            📧 A confirmation email has been sent to your registered email address.
          </p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
            📞 For any queries, contact us at +91 98765 43210
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;