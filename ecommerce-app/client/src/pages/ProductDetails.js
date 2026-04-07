import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, cartService } from '../services/api';
import './Pages.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [variantError, setVariantError] = useState('');
  
  const buttonRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.materials?.length > 0) {
      setSelectedMaterial(product.materials[0]);
    }
    if (product?.patterns?.length > 0) {
      setSelectedPattern(product.patterns[0]);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await productService.getById(id);
      setProduct(response.data);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const createParticles = (button) => {
    const rect = button.getBoundingClientRect();
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('span');
      const angle = (i / 12) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      const tx = Math.cos(angle) * velocity * 30;
      const ty = Math.sin(angle) * velocity * 30;
      
      particle.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        width: 8px;
        height: 8px;
        background: #4caf50;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
      `;
      particle.animate([
        { transform: 'translate(-50%, -50%) translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0, .9, .1, 1)',
        fill: 'forwards'
      });
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    }
  };

  const createCartFlyAnimation = (button) => {
    const rect = button.getBoundingClientRect();
    const cartIcon = document.createElement('div');
    cartIcon.innerHTML = '🛒';
    cartIcon.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: 32px;
      z-index: 9999;
      pointer-events: none;
      transform: translate(-50%, -50%) scale(1);
    `;
    document.body.appendChild(cartIcon);
    
    const cartLink = document.getElementById('cart-nav-link');
    if (cartLink) {
      const cartRect = cartLink.getBoundingClientRect();
      const targetX = cartRect.left + cartRect.width / 2;
      const targetY = cartRect.top + cartRect.height / 2;
      
      cartIcon.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${targetX - (rect.left + rect.width / 2)}px), calc(-50% + ${targetY - (rect.top + rect.height / 2)}px)) scale(0.3)`, opacity: 0.8 }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
      
      setTimeout(() => {
        cartIcon.remove();
        if (cartLink) {
          cartLink.style.transform = 'scale(1.3)';
          cartLink.style.transition = 'transform 0.2s ease';
          setTimeout(() => {
            cartLink.style.transform = 'scale(1)';
          }, 200);
        }
      }, 800);
    } else {
      cartIcon.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -200px) scale(0.5)', opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      });
      setTimeout(() => cartIcon.remove(), 600);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setVariantError('');
    
    if (product?.colors?.length > 0 && !selectedColor) {
      setVariantError('Please select a color');
      return;
    }
    if (product?.sizes?.length > 0 && !selectedSize) {
      setVariantError('Please select a size');
      return;
    }
    if (product?.materials?.length > 0 && !selectedMaterial) {
      setVariantError('Please select a material');
      return;
    }
    if (product?.patterns?.length > 0 && !selectedPattern) {
      setVariantError('Please select a pattern');
      return;
    }

    setAddingToCart(true);
    
    const button = buttonRef.current;
    if (button) {
      createParticles(button);
      createCartFlyAnimation(button);
    }
    
    try {
      await cartService.add(product.id, quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern);
      setAddedToCart(true);
      setShowPayment(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (err) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQty) => {
    setQuantity(Math.min(product?.stock, Math.max(1, newQty)));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loading" style={{ margin: '0 auto' }}></div>
    </div>
  );
  
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>😕</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>Product Not Found</h2>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '24px' }}>{error}</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', padding: '40px 0 80px' }}>
      <style>{`
        @keyframes particle-explode {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes cart-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-check {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .cart-btn-animating {
          animation: cart-bounce 0.3s ease !important;
        }
        .product-option-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-option-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(110, 89, 57, 0.2);
        }
        .product-option-btn.selected {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
          border-color: var(--color-primary);
          color: white;
          box-shadow: 0 4px 16px rgba(110, 89, 57, 0.3);
        }
        .enhance-card {
          background: var(--color-surface-container-lowest);
          border-radius: var(--radius-xl);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .enhance-card:hover {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        .quantity-btn-enhance {
          transition: all 0.2s ease;
        }
        .quantity-btn-enhance:hover {
          background: var(--color-primary);
          color: white;
          transform: scale(1.05);
        }
        .add-to-cart-btn {
          background: linear-gradient(135deg, #6e5939 0%, #88714f 100%);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .add-to-cart-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .add-to-cart-btn:hover::before {
          left: 100%;
        }
        .add-to-cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(110, 89, 57, 0.4);
        }
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-outline-variant), transparent);
          margin: 32px 0;
        }
        .quick-action-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .quick-action-btn:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(110, 89, 57, 0.2);
        }
      `}</style>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '32px',
          fontSize: '14px',
          color: 'var(--color-on-surface-variant)'
        }}>
          <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Products</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-on-surface)' }}>{product?.name}</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '60px',
          alignItems: 'start'
        }}>
          <div className="enhance-card" style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            aspectRatio: '1',
            position: 'relative'
          }}>
            {product?.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-secondary-container)', fontSize: '80px', opacity: 0.2 }}>✨</div>
            )}
            {product?.stock === 0 && (
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--color-error)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Out of Stock</div>
            )}
          </div>

          <div style={{ paddingTop: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '12px' }}>{product?.category || 'General'}</div>
            
            <h1 style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>{product?.name}</h1>

            <div style={{ fontSize: '38px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>Rs. {product?.price?.toLocaleString()}</div>

            {/* Rating Display */}
            {product?.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px 16px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{ fontSize: '18px', color: star <= product.rating ? '#ffb400' : 'var(--color-outline-variant)' }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>{product.rating}.0 ({product.reviews || 0} reviews)</span>
              </div>
            )}

            <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.8, fontSize: '16px', marginBottom: '32px' }}>{product?.description || 'No description available for this product.'}</p>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                className="quick-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'var(--color-surface-container)',
                  border: '2px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--color-on-surface)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  alert('Added to wishlist!');
                }}
              >
                ♡ Wishlist
              </button>
              <button
                className="quick-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'var(--color-surface-container)',
                  border: '2px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--color-on-surface)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product?.name,
                      text: product?.description,
                      url: window.location.href
                    });
                  }
                }}
              >
                ↗ Share
              </button>
            </div>

            {/* Color Options */}
            {product?.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Color <span style={{ fontWeight: 400, color: 'var(--color-on-surface-variant)' }}>{selectedColor}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`product-option-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '12px 24px',
                        border: selectedColor === color ? '2px solid var(--color-primary)' : '2px solid var(--color-outline-variant)',
                        background: selectedColor === color ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                        color: 'var(--color-on-surface)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Options */}
            {product?.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Size <span style={{ fontWeight: 400, color: 'var(--color-on-surface-variant)' }}>{selectedSize}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`product-option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: '50px',
                        padding: '12px 20px',
                        border: selectedSize === size ? '2px solid var(--color-primary)' : '2px solid var(--color-outline-variant)',
                        background: selectedSize === size ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                        color: 'var(--color-on-surface)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Options */}
            {product?.materials && product.materials.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Material <span style={{ fontWeight: 400, color: 'var(--color-on-surface-variant)' }}>{selectedMaterial}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {product.materials.map((material) => (
                    <button
                      key={material}
                      className={`product-option-btn ${selectedMaterial === material ? 'selected' : ''}`}
                      onClick={() => setSelectedMaterial(material)}
                      style={{
                        padding: '12px 24px',
                        border: selectedMaterial === material ? '2px solid var(--color-primary)' : '2px solid var(--color-outline-variant)',
                        background: selectedMaterial === material ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                        color: 'var(--color-on-surface)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pattern Options */}
            {product?.patterns && product.patterns.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Pattern <span style={{ fontWeight: 400, color: 'var(--color-on-surface-variant)' }}>{selectedPattern}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {product.patterns.map((pattern) => (
                    <button
                      key={pattern}
                      className={`product-option-btn ${selectedPattern === pattern ? 'selected' : ''}`}
                      onClick={() => setSelectedPattern(pattern)}
                      style={{
                        padding: '12px 24px',
                        border: selectedPattern === pattern ? '2px solid var(--color-primary)' : '2px solid var(--color-outline-variant)',
                        background: selectedPattern === pattern ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                        color: 'var(--color-on-surface)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variantError && (
              <div style={{ color: 'var(--color-error)', fontSize: '14px', fontWeight: 600, marginBottom: '16px', padding: '12px 16px', background: 'rgba(186, 26, 26, 0.1)', borderRadius: 'var(--radius-md)' }}>⚠️ {variantError}</div>
            )}

            {/* Stock Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', padding: '20px', background: product?.stock > 10 ? 'rgba(76, 175, 80, 0.1)' : product?.stock > 0 ? 'rgba(255, 152, 0, 0.1)' : 'rgba(186, 26, 26, 0.1)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Availability</div>
                <div style={{ fontWeight: 700, color: product?.stock > 10 ? '#4caf50' : product?.stock > 0 ? '#ff9800' : 'var(--color-error)' }}>{product?.stock > 10 ? 'In Stock' : product?.stock > 0 ? `Only ${product?.stock} left` : 'Out of Stock'}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>SKU</div>
                <div style={{ fontWeight: 600 }}>MOr-{product?.id?.toString().padStart(4, '0')}</div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product?.stock > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Quantity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', padding: '4px' }}>
                    <button onClick={() => handleQuantityChange(quantity - 1)} style={{ width: '44px', height: '44px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', fontWeight: 600, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>−</button>
                    <input type="number" value={quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)} min="1" max={product?.stock} style={{ width: '60px', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '18px', fontWeight: 600, color: 'var(--color-on-surface)' }} />
                    <button onClick={() => handleQuantityChange(quantity + 1)} style={{ width: '44px', height: '44px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', fontWeight: 600, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>+</button>
                  </div>
                  <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>Total: <strong style={{ color: 'var(--color-on-surface)', fontSize: '20px' }}>Rs. {(product?.price * quantity)?.toLocaleString()}</strong></div>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            {product?.stock > 0 ? (
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button
                  ref={buttonRef}
                  className={`btn add-to-cart-btn ${addingToCart ? 'cart-btn-animating' : ''}`}
                  style={{ 
                    width: '100%', 
                    padding: '18px 32px',
                    fontSize: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'white'
                  }}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                {addedToCart ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ animation: 'pulse-check 0.5s ease' }}>✓</span> Added to Cart!
                  </span>
                ) : addingToCart ? (
                  'Adding...'
                ) : (
                  <>
                    <span style={{ marginRight: '8px' }}>🛒</span> Add to Cart
                  </>
                )}
                </button>
                <button
                  className="btn"
                  style={{ 
                    width: '100%', 
                    padding: '14px 32px',
                    fontSize: '15px',
                    background: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    border: '2px solid var(--color-outline-variant)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      navigate('/login');
                      return;
                    }
                    if (product?.colors?.length > 0 && !selectedColor) {
                      setVariantError('Please select a color');
                      return;
                    }
                    if (product?.sizes?.length > 0 && !selectedSize) {
                      setVariantError('Please select a size');
                      return;
                    }
                    try {
                      await cartService.add(product.id, quantity, selectedColor, selectedSize, selectedMaterial, selectedPattern);
                      navigate('/checkout');
                    } catch (err) {
                      alert('Failed to proceed');
                    }
                  }}
                >
                  <span style={{ marginRight: '8px' }}>⚡</span> Buy Now
                </button>
              </div>
            ) : (
              <button className="btn" style={{ width: '100%', padding: '18px 32px', background: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)', cursor: 'not-allowed' }} disabled>Out of Stock</button>
            )}

            {/* Payment Details Section */}
            {showPayment && (
              <div style={{ 
                marginTop: '32px', 
                padding: '24px', 
                background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-surface-container) 100%)',
                borderRadius: 'var(--radius-xl)',
                border: '2px solid var(--color-primary)',
                animation: 'slide-up 0.5s ease forwards'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>Payment Details</h3>
                  <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '8px' }}>✕</button>
                </div>
                
                <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(product?.price * quantity)?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>Shipping</span>
                    <span style={{ fontWeight: 600, color: '#4caf50' }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '22px' }}>Rs. {(product?.price * quantity)?.toLocaleString()}</span>
                  </div>
                </div>

                {selectedColor && (
                  <div style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Color: <strong style={{ color: 'var(--color-on-surface)' }}>{selectedColor}</strong></div>
                )}
                {selectedSize && (
                  <div style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Size: <strong style={{ color: 'var(--color-on-surface)' }}>{selectedSize}</strong></div>
                )}
                {selectedMaterial && (
                  <div style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Material: <strong style={{ color: 'var(--color-on-surface)' }}>{selectedMaterial}</strong></div>
                )}
                {selectedPattern && (
                  <div style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginBottom: '20px' }}>Pattern: <strong style={{ color: 'var(--color-on-surface)' }}>{selectedPattern}</strong></div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => navigate('/cart')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '14px' }}
                  >
                    View Cart
                  </button>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '14px', background: 'var(--color-primary)' }}
                  >
                    Checkout Now →
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>🚚</span><span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Free Shipping</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>↩️</span><span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>30-Day Returns</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>🔒</span><span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Secure Payment</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;