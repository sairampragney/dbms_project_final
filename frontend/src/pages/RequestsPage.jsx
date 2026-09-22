import React, { useState, useEffect } from 'react';
import { LifeBuoy, Plus, Search, Filter, RefreshCw, AlertCircle, Phone } from 'lucide-react';
import { getRequests, createRequest, updateRequest } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setForm] = useState({
    requestType: 'RESCUE',
    priority: 'HIGH',
    location: '',
    peopleAffected: 1,
    contactPhone: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRequests({
        requestType: typeFilter !== 'ALL' ? typeFilter : undefined,
        search: search || undefined
      });
      if (res.data && res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching assistance requests:', err);
      setError('Failed to fetch emergency requests from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [typeFilter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        peopleAffected: parseInt(formData.peopleAffected, 10) || 1
      };
      const res = await createRequest(payload);
      if (res.data && res.data.success) {
        setIsModalOpen(false);
        setForm({ requestType: 'RESCUE', priority: 'HIGH', location: '', peopleAffected: 1, contactPhone: '', description: '' });
        fetchRequests();
      }
    } catch (err) {
      console.error('Error submitting emergency request:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to submit emergency request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateRequest(requestId, { status: newStatus });
      fetchRequests();
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LifeBuoy style={{ color: '#dc2626' }} /> Emergency Assistance Requests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Submit urgent requests for rescue, medical assistance, food/water, or evacuation aid.</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-danger">
          <Plus size={16} /> Request Emergency Aid
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
          <Search size={18} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by location, description, or phone..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: '#64748b' }} />
          <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">Help Category: All Categories</option>
            <option value="RESCUE">RESCUE</option>
            <option value="MEDICAL">MEDICAL</option>
            <option value="FOOD_WATER">FOOD & WATER</option>
            <option value="SHELTER">SHELTER</option>
            <option value="EVACUATION">EVACUATION</option>
            <option value="OTHER">OTHER</option>
          </select>
          <button onClick={fetchRequests} className="btn btn-outline">
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
        <p style={{ color: '#64748b' }}>Loading emergency assistance requests...</p>
      ) : requests.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <h3>No Emergency Requests Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No requests match your current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {requests.map((req) => (
            <div key={req.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#dc2626' }}>{req.requestType}</span>
                  <SeverityBadge level={req.priority} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>📍 {req.location}</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} /> {req.contactPhone} ({req.peopleAffected} person/s affected)
                </p>
                <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '1rem', lineHeight: '1.5' }}>{req.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <StatusBadge status={req.status} />

                  {user && (user.role === 'ADMIN' || user.role === 'VOLUNTEER') && (
                    <select
                      className="form-control"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="FULFILLED">FULFILLED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Submitted: {new Date(req.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Emergency Assistance Request">
        <form onSubmit={handleSubmit}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Help Category</label>
              <select className="form-control" value={formData.requestType} onChange={(e) => setForm({ ...formData, requestType: e.target.value })}>
                <option value="RESCUE">RESCUE</option>
                <option value="MEDICAL">MEDICAL</option>
                <option value="FOOD_WATER">FOOD & WATER</option>
                <option value="SHELTER">SHELTER</option>
                <option value="EVACUATION">EVACUATION</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div className="form-group">
              <label>Urgency Priority</label>
              <select className="form-control" value={formData.priority} onChange={(e) => setForm({ ...formData, priority: e.target.value })}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Location Where Help Is Needed</label>
            <input type="text" className="form-control" required value={formData.location} onChange={(e) => setForm({ ...formData, location: e.target.value })} placeholder="e.g. Block B, Apt 302, River Road" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Direct Contact Phone</label>
              <input type="text" className="form-control" required value={formData.contactPhone} onChange={(e) => setForm({ ...formData, contactPhone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label>People Affected</label>
              <input type="number" min="1" className="form-control" required value={formData.peopleAffected} onChange={(e) => setForm({ ...formData, peopleAffected: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Description of Emergency & Needs</label>
            <textarea className="form-control" rows="3" required value={formData.description} onChange={(e) => setForm({ ...formData, description: e.target.value })} placeholder="Provide clear details on why help is needed, trapped state, or medical symptoms..."></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'Submitting...' : 'Submit Assistance Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
