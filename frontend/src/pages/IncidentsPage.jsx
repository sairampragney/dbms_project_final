import React, { useState, useEffect } from 'react';
import { Activity, Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { getIncidents, createIncident, updateIncident } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setForm] = useState({
    disasterType: 'FLOOD',
    location: '',
    latitude: '',
    longitude: '',
    severity: 'MEDIUM',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncidents({
        disasterType: typeFilter !== 'ALL' ? typeFilter : undefined,
        search: search || undefined
      });
      if (res.data && res.data.success) {
        setIncidents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to fetch disaster incidents from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [typeFilter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      };
      const res = await createIncident(payload);
      if (res.data && res.data.success) {
        setIsModalOpen(false);
        setForm({ disasterType: 'FLOOD', location: '', latitude: '', longitude: '', severity: 'MEDIUM', description: '' });
        fetchIncidents();
      }
    } catch (err) {
      console.error('Error reporting incident:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await updateIncident(incidentId, { status: newStatus });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to update incident status:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity style={{ color: '#2563eb' }} /> Community Incident Reporting
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Report real-time observations and track disaster incident resolution progress.</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Report New Incident
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
          <Search size={18} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search incidents by location or description..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: '#64748b' }} />
          <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">Disaster Type: All Types</option>
            <option value="FLOOD">FLOOD</option>
            <option value="FIRE">FIRE</option>
            <option value="EARTHQUAKE">EARTHQUAKE</option>
            <option value="STORM">STORM</option>
            <option value="CHEMICAL">CHEMICAL</option>
            <option value="OTHER">OTHER</option>
          </select>
          <button onClick={fetchIncidents} className="btn btn-outline">
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
        <p style={{ color: '#64748b' }}>Loading reported incidents...</p>
      ) : incidents.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <h3>No Incidents Reported</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No incident reports match your current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {incidents.map((inc) => (
            <div key={inc.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#2563eb' }}>{inc.disasterType}</span>
                  <SeverityBadge level={inc.severity} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>📍 {inc.location}</h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.5' }}>{inc.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <StatusBadge status={inc.status} />

                  {user && (user.role === 'ADMIN' || user.role === 'VOLUNTEER') && (
                    <select
                      className="form-control"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                      value={inc.status}
                      onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                    >
                      <option value="REPORTED">REPORTED</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="DISMISSED">DISMISSED</option>
                    </select>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Reported: {new Date(inc.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report a Disaster Incident">
        <form onSubmit={handleSubmit}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
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
              <label>Observed Severity</label>
              <select className="form-control" value={formData.severity} onChange={(e) => setForm({ ...formData, severity: e.target.value })}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Specific Location Description</label>
            <input type="text" className="form-control" required value={formData.location} onChange={(e) => setForm({ ...formData, location: e.target.value })} placeholder="e.g. 5th Ave and Water Street intersection" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Latitude (Optional)</label>
              <input type="number" step="any" className="form-control" value={formData.latitude} onChange={(e) => setForm({ ...formData, latitude: e.target.value })} placeholder="37.7749" />
            </div>
            <div className="form-group">
              <label>Longitude (Optional)</label>
              <input type="number" step="any" className="form-control" value={formData.longitude} onChange={(e) => setForm({ ...formData, longitude: e.target.value })} placeholder="-122.4194" />
            </div>
          </div>
          <div className="form-group">
            <label>Incident Details & Observations</label>
            <textarea className="form-control" rows="3" required value={formData.description} onChange={(e) => setForm({ ...formData, description: e.target.value })} placeholder="Describe what you observed (e.g. downed power lines, rising water levels)..."></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
