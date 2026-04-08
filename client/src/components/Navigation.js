import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const LOGO_URL = '/logo.png';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo */}
        <Link to="/" className="logo">
          {!logoError ? (
            <img 
              src={LOGO_URL} 
              alt="Maison Or" 
              className="logo-img"
              onError={handleLogoError}
            />
          ) : (
            <span className="logo-text">Maison Or</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-center">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
            Shop
          </Link>
          <div className="nav-dropdown" ref={dropdownRef}>
            <button 
              className="nav-dropdown-toggle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              More <span className="dropdown-arrow">▾</span>
            </button>
            {dropdownOpen && (
              <div className="nav-dropdown-menu">
                <Link to="/products?category=Jewelry" onClick={() => setDropdownOpen(false)}>Jewelry</Link>
                <Link to="/products?category=Watches" onClick={() => setDropdownOpen(false)}>Watches</Link>
                <Link to="/products?category=Bags" onClick={() => setDropdownOpen(false)}>Bags</Link>
                <Link to="/products?category=Accessories" onClick={() => setDropdownOpen(false)}>Accessories</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="nav-right">
          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-link admin-link">
              <span className="admin-icon">⚙️</span> Admin
            </Link>
          )}

          {user ? (
            <div className="nav-user-section">
              <Link to="/cart" className="nav-icon-link" id="cart-nav-link">
                <span className="icon">🛒</span>
                <span className="icon-text">Cart</span>
              </Link>
              <div className="user-menu">
                <button className="user-avatar">
                  {user.email?.charAt(0).toUpperCase()}
                </button>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-nav-link">Home</Link>
          <Link to="/products" className="mobile-nav-link">Shop</Link>
          <div className="mobile-category-links">
            <Link to="/products?category=Jewelry">Jewelry</Link>
            <Link to="/products?category=Watches">Watches</Link>
            <Link to="/products?category=Bags">Bags</Link>
            <Link to="/products?category=Accessories">Accessories</Link>
          </div>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" className="mobile-nav-link">Admin Panel</Link>}
              <Link to="/cart" className="mobile-nav-link">Cart</Link>
              <button onClick={handleLogout} className="mobile-nav-link logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link">Login</Link>
              <Link to="/signup" className="mobile-nav-link primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;