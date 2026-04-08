import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import './Pages.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productService.getAll();
      setFeaturedProducts(response.data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      count: 24
    },
    {
      name: 'Watches',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      count: 18
    },
    {
      name: 'Bags',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
      count: 32
    },
    {
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd6d52893c3?w=400&h=400&fit=crop',
      count: 45
    }
  ];

  const features = [
    {
      title: 'Premium Quality',
      description: 'Each piece is crafted with exceptional attention to detail',
      icon: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
    },
    {
      title: 'Secure Payment',
      description: '100% secure transactions with encrypted checkout',
      icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'
    },
    {
      title: 'Easy Returns',
      description: '30-day hassle-free return policy',
      icon: 'M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '500+', label: 'Premium Products' },
    { value: '50+', label: 'Brand Partners' },
    { value: '4.9', label: 'Average Rating' }
  ];

  return (
    <div className="home" style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section className="hero" style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #fdf9f3 0%, #f2ede8 50%, #f8f3ed 100%)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(110, 89, 57, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(136, 113, 79, 0.06) 0%, transparent 40%)
          `,
          pointerEvents: 'none'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px' }}>
          <div style={{ maxWidth: '720px' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'var(--color-primary-fixed)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              Luxury Collection 2026
            </span>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              color: 'var(--color-on-surface)'
            }}>
              Elevate Your <span style={{ color: 'var(--color-primary)' }}>Style</span> With Elegance
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--color-on-surface-variant)',
              marginBottom: '40px',
              maxWidth: '520px',
              lineHeight: 1.7
            }}>
              Discover our curated selection of premium luxury items. 
              Each piece tells a story of craftsmanship and sophistication.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                Explore Collection
              </Link>
              <Link to="/signup" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                Join Membership
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Product Images */}
        <div className="hero-showcase" style={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)'
        }}>
          <div style={{
            width: '320px',
            height: '420px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            background: 'white'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop" 
              alt="Featured"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'var(--color-primary)',
        padding: '40px 0'
      }}>
        <div className="container">
          <div className="stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
            textAlign: 'center'
          }}>
            {stats.map((stat, index) => (
              <div key={index}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: 'white',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="page-section" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--color-primary)'
            }}>
              Shop By Category
            </span>
            <h2 style={{
              fontSize: '42px',
              marginTop: '12px',
              fontFamily: "'Playfair Display', serif"
            }}>
              Browse Our Collections
            </h2>
          </div>

          <div className="categories-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }}>
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={`/products?category=${category.name}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  height: '380px',
                  cursor: 'pointer'
                }}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '32px 24px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    color: 'white'
                  }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontFamily: "'Playfair Display', serif",
                      marginBottom: '4px'
                    }}>
                      {category.name}
                    </h3>
                    <span style={{
                      fontSize: '14px',
                      opacity: 0.8
                    }}>
                      {category.count} Products
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{
        background: 'var(--color-surface-container)',
        padding: '100px 0'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '48px'
          }}>
            <div>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--color-primary)'
              }}>
                Featured
              </span>
              <h2 style={{
                fontSize: '36px',
                marginTop: '8px',
                fontFamily: "'Playfair Display', serif"
              }}>
                Trending Now
              </h2>
            </div>
            <Link to="/products" className="btn btn-outline">
              View All Products
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="loading" style={{ margin: '0 auto' }}></div>
            </div>
          ) : (
            <div className="products-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px'
            }}>
              {featuredProducts.slice(0, 8).map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'var(--color-surface-container-lowest)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{
                      height: '260px',
                      background: 'var(--color-secondary-container)',
                      overflow: 'hidden'
                    }}>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '48px',
                          opacity: 0.3
                        }}>
                          📦
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--color-on-surface-variant)',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        {product.category || 'General'}
                      </div>
                      <div style={{
                        fontSize: '17px',
                        fontWeight: 600,
                        color: 'var(--color-on-surface)',
                        marginBottom: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.name}
                      </div>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        fontFamily: "'Playfair Display', serif"
                      }}>
                        Rs. {product.price?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="page-section" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="features-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '40px 32px'
                }}
              >
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-fixed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="var(--color-primary)"
                  >
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontFamily: "'Playfair Display', serif",
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'var(--color-on-surface-variant)',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
        padding: '80px 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '42px',
            color: 'white',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '16px'
          }}>
            Ready to Elevate Your Style?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            Join thousands of satisfied customers who trust us for their luxury needs.
          </p>
          <Link to="/products" className="btn" style={{
            background: 'white',
            color: 'var(--color-primary)',
            padding: '18px 48px',
            fontSize: '16px'
          }}>
            Shop Now
          </Link>
        </div>
      </section>

      {/* Footer Info */}
      <section style={{
        background: 'var(--color-surface-container-lowest)',
        padding: '60px 0',
        borderTop: '1px solid var(--color-outline-variant)'
      }}>
        <div className="container">
          <div className="footer-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px'
          }}>
            <div>
              <h4 style={{
                fontSize: '18px',
                fontFamily: "'Playfair Display', serif",
                marginBottom: '16px'
              }}>
                Maison Or
              </h4>
              <p style={{
                color: 'var(--color-on-surface-variant)',
                fontSize: '14px',
                lineHeight: 1.7
              }}>
                Your destination for premium luxury items. Quality craftsmanship meets elegant design.
              </p>
            </div>
            <div>
              <h5 style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Quick Links
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/products" style={{ color: 'var(--color-on-surface-variant)', textDecoration: 'none', fontSize: '14px' }}>Shop</Link>
                <Link to="/products?category=Jewelry" style={{ color: 'var(--color-on-surface-variant)', textDecoration: 'none', fontSize: '14px' }}>Jewelry</Link>
                <Link to="/products?category=Watches" style={{ color: 'var(--color-on-surface-variant)', textDecoration: 'none', fontSize: '14px' }}>Watches</Link>
              </div>
            </div>
            <div>
              <h5 style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Customer Service
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>Contact Us</span>
                <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>Shipping Info</span>
                <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>Returns</span>
              </div>
            </div>
            <div>
              <h5 style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Contact
              </h5>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '8px' }}>
                Email: hello@maisonor.com
              </p>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;