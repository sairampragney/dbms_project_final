import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { getAlerts, createAlert } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setForm] = useState({
    title: '',
    disasterType: 'FLOOD',
    severity: 'HIGH',
    affectedLocation: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAlerts({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search || undefined
      });
      if (res.data && res.data.success) {
        setAlerts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch disaster alerts from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await createAlert(formData);
      if (res.data && res.data.success) {
        setIsModalOpen(false);
        setForm({ title: '', disasterType: 'FLOOD', severity: 'HIGH', affectedLocation: '', description: '' });
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to publish disaster alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle style={{ color: '#dc2626' }} /> Disaster Alerts & Broadcasts
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Official emergency warnings broadcasted by emergency response authorities.</p>
        </div>

        {user && user.role === 'ADMIN' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-danger">
            <Plus size={16} /> Broadcast New Alert
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
          <Search size={18} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search alerts by location or title..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: '#64748b' }} />
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ACTIVE">Status: Active Alerts</option>
            <option value="RESOLVED">Status: Resolved</option>
            <option value="CANCELLED">Status: Cancelled</option>
            <option value="ALL">Status: All Statuses</option>
          </select>
          <button onClick={fetchAlerts} className="btn btn-outline">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading disaster alerts...</p>
      ) : alerts.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <h3>No Disaster Alerts Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>There are no alerts matching your search/filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.map((a) => (
            <div key={a.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{a.title}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 Affected Zone: <strong>{a.affectedLocation}</strong> | Type: <strong>{a.disasterType}</strong></p>
                </div>
                <SeverityBadge level={a.severity} />
              </div>
              <p style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '0.75rem', lineHeight: '1.6' }}>{a.description}</p>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Published: {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Create Alert Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast Emergency Alert (Admin)">
        <form onSubmit={handleSubmit}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
          <div className="form-group">
            <label>Alert Title</label>
            <input type="text" className="form-control" required value={formData.title} onChange={(e) => setForm({ ...formData, title: e.target.value })} placeholder="e.g. Flash Flood Emergency Warning" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Disaster Type</label>
              <select className="form-control" value={formData.disasterType} onChange={(e) => setForm({ ...formData, disasterType: e.target.value })}>
                <option value="FLOOD">FLOOD</option>
                <option value="FIRE">FIRE</option>
                <option value="EARTHQUAKE">EARTHQUAKE</option>
                <option value="STORM">STORM</option>
                <option value="CHEMICAL">CHEMICAL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity Level</label>
              <select className="form-control" value={formData.severity} onChange={(e) => setForm({ ...formData, severity: e.target.value })}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Affected Location / Region</label>
            <input type="text" className="form-control" required value={formData.affectedLocation} onChange={(e) => setForm({ ...formData, affectedLocation: e.target.value })} placeholder="e.g. Sector 4 & Lower River Basin" />
          </div>
          <div className="form-group">
            <label>Description & Safety Instructions</label>
            <textarea className="form-control" rows="4" required value={formData.description} onChange={(e) => setForm({ ...formData, description: e.target.value })} placeholder="Provide clear safety instructions for residents..."></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'Publishing...' : 'Broadcast Alert'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
