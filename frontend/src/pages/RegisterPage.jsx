import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CITIZEN'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto 0', backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <ShieldAlert size={40} style={{ color: '#dc2626', marginBottom: '0.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create an Account</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Join the community emergency alert & response network</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-control"
            required
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={(e) => setForm({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            required
            placeholder="jane.doe@example.com"
            value={formData.email}
            onChange={(e) => setForm({ ...formData, email: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              required
              minLength="6"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setForm({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setForm({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Account Role</label>
          <select
            className="form-control"
            value={formData.role}
            onChange={(e) => setForm({ ...formData, role: e.target.value })}
          >
            <option value="CITIZEN">CITIZEN (Community Member)</option>
            <option value="VOLUNTEER">VOLUNTEER (Community Responder)</option>
            <option value="ADMIN">ADMIN (Emergency Coordinator)</option>
          </select>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}>
          <UserPlus size={16} /> {submitting ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Sign In here</Link>
      </div>
    </div>
  );
}
