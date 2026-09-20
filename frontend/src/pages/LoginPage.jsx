import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto 0', backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <ShieldAlert size={40} style={{ color: '#dc2626', marginBottom: '0.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>User Sign In</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Access your disaster response coordinator or citizen profile</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            required
            placeholder="admin@disasterapp.org or citizen@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}>
          <LogIn size={16} /> {submitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Register here</Link>
      </div>
    </div>
  );
}
