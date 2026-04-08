import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Pages.css';

function Signup({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.signup(email, password, fullName);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-surface)',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '36px',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '8px'
          }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>
            Join Maison Or for exclusive shopping experience
          </p>
        </div>

        <div style={{
          background: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {error && (
            <div style={{
              background: 'var(--color-error-container)',
              color: 'var(--color-error)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px',
              fontSize: '14px',
              borderLeft: '4px solid var(--color-error)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                Full Name
              </label>
              <input
                type="text"
                className="form-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                Password
              </label>
              <input
                type="password"
                className="form-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid var(--color-outline-variant)'
          }}>
            <span style={{ color: 'var(--color-on-surface-variant)' }}>
              Already have an account?{' '}
            </span>
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--color-primary)', 
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div style={{
          marginTop: '24px',
          padding: '24px',
          background: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
            Why join Maison Or?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>🎁</span>
              <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Access to exclusive deals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>📦</span>
              <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Order tracking & history</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>💝</span>
              <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Faster checkout experience</span>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link 
            to="/" 
            style={{ 
              color: 'var(--color-on-surface-variant)',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;