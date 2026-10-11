import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Shield, User, Briefcase, Calculator, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login({ email: demoEmail, password: demoPassword });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px var(--accent-glow)',
            }}
          >
            <Shield size={28} />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            ABC Company
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Expense Voucher Management System
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Work Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. employee@abccompany.com"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>
        </form>

        {/* Quick Demo Switcher Section */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Demo Access (Click to test roles)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {/* Employee 1 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('employee@abccompany.com', 'password123')}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 0.75rem', justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <User size={16} color="#60a5fa" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Employee</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sarah (Eng)</div>
              </div>
            </button>

            {/* Employee 2 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@abccompany.com', 'password123')}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 0.75rem', justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <User size={16} color="#60a5fa" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Employee</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Alex (Marketing)</div>
              </div>
            </button>

            {/* Director */}
            <button
              type="button"
              onClick={() => handleQuickLogin('director@abccompany.com', 'password123')}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 0.75rem', justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <Briefcase size={16} color="#c084fc" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Director</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>David (Approval)</div>
              </div>
            </button>

            {/* Accounts Team */}
            <button
              type="button"
              onClick={() => handleQuickLogin('accounts@abccompany.com', 'password123')}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 0.75rem', justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <Calculator size={16} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Accounts</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rachel (Finance)</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
