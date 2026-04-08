import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../services/api';
import './Pages.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.get();
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await cartService.remove(productId);
      fetchCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity <= 0) {
      await handleRemove(productId);
      return;
    }
    setUpdating(productId);
    try {
      await cartService.update(productId, quantity);
      fetchCart();
    } catch (error) {
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = totalPrice * 0.1;
  const grandTotal = totalPrice + tax;

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
          <h1 style={{
            fontSize: '42px',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '8px'
          }}>
            Shopping Bag
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '16px' }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🛒</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '32px' }}>
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products" className="btn btn-primary" style={{ padding: '16px 36px' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
            {/* Cart Items */}
            <div>
              <div style={{
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden'
              }}>
                {cartItems.map((item, index) => (
                  <div 
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      padding: '24px',
                      borderBottom: index < cartItems.length - 1 ? '1px solid var(--color-outline-variant)' : 'none',
                      transition: 'background 0.3s ease'
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: 'var(--radius-lg)',
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
                          fontSize: '32px',
                          opacity: 0.3
                        }}>
                          ✨
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <div style={{
                            fontSize: '13px',
                            color: 'var(--color-on-surface-variant)',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            marginBottom: '4px'
                          }}>
                            {item.category || 'General'}
                          </div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            marginBottom: '8px'
                          }}>
                            {item.name}
                          </div>
                          {(item.selected_color || item.selected_size || item.selected_material || item.selected_pattern) && (
                            <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>
                              {item.selected_color && <span style={{ marginRight: '8px' }}>Color: <strong>{item.selected_color}</strong></span>}
                              {item.selected_size && <span style={{ marginRight: '8px' }}>Size: <strong>{item.selected_size}</strong></span>}
                              {item.selected_material && <span style={{ marginRight: '8px' }}>Material: <strong>{item.selected_material}</strong></span>}
                              {item.selected_pattern && <span>Pattern: <strong>{item.selected_pattern}</strong></span>}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-error)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '8px'
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        fontFamily: "'Playfair Display', serif",
                        marginBottom: '16px'
                      }}>
                        Rs. {item.price?.toLocaleString()}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'var(--color-surface-container)',
                          borderRadius: 'var(--radius-md)',
                          padding: '2px'
                        }}>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={updating === item.product_id}
                            style={{
                              width: '36px',
                              height: '36px',
                              border: 'none',
                              background: 'transparent',
                              cursor: updating === item.product_id ? 'not-allowed' : 'pointer',
                              fontSize: '16px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            width: '40px',
                            textAlign: 'center',
                            fontWeight: 600
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={updating === item.product_id}
                            style={{
                              width: '36px',
                              height: '36px',
                              border: 'none',
                              background: 'transparent',
                              cursor: updating === item.product_id ? 'not-allowed' : 'pointer',
                              fontSize: '16px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{
                          marginLeft: 'auto',
                          fontWeight: 700,
                          fontSize: '18px'
                        }}>
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div style={{ marginTop: '24px' }}>
                <Link 
                  to="/products" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  ← Continue Shopping
                </Link>
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

                <div style={{ marginBottom: '24px' }}>
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
                      Rs. {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '18px', fontSize: '16px' }}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>

                {/* Benefits */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--color-outline-variant)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>🔒</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Secure checkout</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px' }}>↩️</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>30-day return policy</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>🚚</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Free shipping on orders above Rs.5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;