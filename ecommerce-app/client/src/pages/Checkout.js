import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartService, orderService } from '../services/api';
import './Pages.css';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.get();
      if (response.data.length === 0) {
        navigate('/cart');
      } else {
        setCartItems(response.data);
      }
    } catch (error) {
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await orderService.create(address, phone);
      navigate(`/order-success/${response.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
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
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--color-on-surface-variant)'
          }}>
            <Link to="/cart" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Cart</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-on-surface)' }}>Checkout</span>
          </div>
          <h1 style={{
            fontSize: '42px',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '8px'
          }}>
            Checkout
          </h1>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-error-container)',
            color: 'var(--color-error)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px',
            borderLeft: '4px solid var(--color-error)'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
          {/* Form Section */}
          <div>
            <div style={{
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontFamily: "'Playfair Display', serif",
                marginBottom: '24px'
              }}>
                Delivery Details
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    Shipping Address
                  </label>
                  <textarea
                    className="form-field"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="4"
                    required
                    placeholder="Enter your complete shipping address including city, state, and pincode"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Enter your contact number"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '18px', fontSize: '16px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : `Place Order • Rs. ${finalTotal.toFixed(2)}`}
                </button>
              </form>
            </div>

            {/* Payment Info */}
            <div style={{
              marginTop: '24px',
              padding: '24px',
              background: 'var(--color-surface-container)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Payment Method</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                Currently we support Cash on Delivery (COD) only. Online payment coming soon.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              position: 'sticky',
              top: '40px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontFamily: "'Playfair Display', serif",
                marginBottom: '24px'
              }}>
                Order Summary
              </h2>

              {/* Items */}
              <div style={{ marginBottom: '24px' }}>
                {cartItems.map((item, index) => (
                  <div 
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px 0',
                      borderBottom: index < cartItems.length - 1 ? '1px solid var(--color-outline-variant)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: 'var(--color-secondary-container)',
                      flexShrink: 0
                    }}>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          opacity: 0.3
                        }}>
                          ✨
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Shipping</span>
                  <span style={{ fontWeight: 600, color: '#4caf50' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Tax (10%)</span>
                  <span style={{ fontWeight: 600 }}>Rs. {tax.toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '20px',
                  borderTop: '2px solid var(--color-primary)'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Total</span>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: 'var(--color-primary)',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    Rs. {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid var(--color-outline-variant)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🔒</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>100% Secure Order</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>✅</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Verified by Maison Or</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;