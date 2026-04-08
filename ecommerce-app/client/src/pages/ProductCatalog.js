import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import './Pages.css';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setCategory(catFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({ search, category });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Jewelry', 'Watches', 'Bags', 'Accessories'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
        padding: '60px 0 80px',
        marginBottom: '-40px'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: '42px',
            fontFamily: "'Playfair Display', serif",
            color: 'white',
            marginBottom: '8px'
          }}>
            {category ? category : 'Our Collection'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            {category 
              ? `Explore our premium ${category} selection` 
              : 'Discover luxury items crafted for excellence'}
          </p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div style={{
          background: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                className="form-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '48px' }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === 'All' ? '' : cat)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    background: (category === cat || (cat === 'All' && !category))
                      ? 'var(--color-primary)'
                      : 'var(--color-surface-container)',
                    color: (category === cat || (cat === 'All' && !category))
                      ? 'white'
                      : 'var(--color-on-surface)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '15px' }}>
            Showing {products.length} products
          </span>
          {category && (
            <button
              onClick={() => setCategory('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div className="loading" style={{ margin: '0 auto' }}></div>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>No products found</h2>
            <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '24px' }}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearch(''); setCategory(''); }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }}>
            {products.map((product, index) => (
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
                  cursor: 'pointer',
                  animation: `fadeInUp 0.5s ease ${index * 0.05}s both`
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
                    height: '280px',
                    background: 'var(--color-secondary-container)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '64px',
                        opacity: 0.2
                      }}>
                        ✨
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#ff9800',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Low Stock
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'var(--color-error)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Out of Stock
                      </span>
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
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        fontFamily: "'Playfair Display', serif"
                      }}>
                        Rs. {product.price?.toLocaleString()}
                      </div>
                      <span style={{
                        fontSize: '13px',
                        color: product.stock > 0 ? '#4caf50' : 'var(--color-error)',
                        fontWeight: 600
                      }}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCatalog;