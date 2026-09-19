import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, RefreshCw, AlertCircle, Phone, CheckCircle, ShieldCheck } from 'lucide-react';
import { getVolunteers, registerVolunteer, getResponses, assignResponse, updateResponse, getIncidents, getRequests } from '../services/api';
import { StatusBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function VolunteersPage() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('volunteers'); // 'volunteers' or 'responses'

  // Modal States
  const [isVolModalOpen, setIsVolModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [volForm, setVolForm] = useState({
    skills: '',
    operatingArea: '',
    availabilityStatus: 'AVAILABLE'
  });

  const [assignForm, setAssignForm] = useState({
    volunteerId: '',
    targetType: 'INCIDENT', // 'INCIDENT' or 'REQUEST'
    targetId: '',
    actionTaken: ''
  });

  const [incidentsList, setIncidentsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const volRes = await getVolunteers({ search: search || undefined });
      if (volRes.data && volRes.data.success) {
        setVolunteers(volRes.data.data || []);
      }

      if (user && (user.role === 'ADMIN' || user.role === 'VOLUNTEER')) {
        const respRes = await getResponses();
        if (respRes.data && respRes.data.success) {
          setResponses(respRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching community response data:', err);
      setError('Failed to fetch volunteer responder records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleRegisterVolunteer = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await registerVolunteer(volForm);
      if (res.data && res.data.success) {
        setIsVolModalOpen(false);
        setVolForm({ skills: '', operatingArea: '', availabilityStatus: 'AVAILABLE' });
        fetchData();
      }
    } catch (err) {
      console.error('Error registering volunteer:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to register as volunteer');
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignModal = async () => {
    try {
      const [incRes, reqRes] = await Promise.all([
        getIncidents({ status: 'REPORTED' }),
        getRequests({ status: 'PENDING' })
      ]);
      setIncidentsList(incRes.data?.data || []);
      setRequestsList(reqRes.data?.data || []);
      if (volunteers.length > 0) {
        setAssignForm(prev => ({ ...prev, volunteerId: volunteers[0].id }));
      }
      setIsAssignModalOpen(true);
    } catch (err) {
      console.error('Failed to load open incidents/requests for assignment:', err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        volunteerId: parseInt(assignForm.volunteerId, 10),
        incidentId: assignForm.targetType === 'INCIDENT' ? parseInt(assignForm.targetId, 10) : undefined,
        requestId: assignForm.targetType === 'REQUEST' ? parseInt(assignForm.targetId, 10) : undefined,
        actionTaken: assignForm.actionTaken
      };
      const res = await assignResponse(payload);
      if (res.data && res.data.success) {
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error assigning response:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to assign volunteer response task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseStatusUpdate = async (responseId, newStatus) => {
    try {
      await updateResponse(responseId, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update response task status:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ color: '#2563eb' }} /> Community Responders & Volunteers
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Register as a community responder, track response assignments, and coordinate rescue ops.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user && (
            <button onClick={() => setIsVolModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Register as Volunteer
            </button>
          )}

          {user && (user.role === 'ADMIN' || user.role === 'VOLUNTEER') && (
            <button onClick={openAssignModal} className="btn btn-danger">
              <ShieldCheck size={16} /> Assign Emergency Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('volunteers')}
          style={{
            padding: '0.75rem 1rem',
            fontWeight: '700',
            fontSize: '0.9rem',
            border: 'none',
            borderBottom: activeTab === 'volunteers' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'volunteers' ? '#2563eb' : '#64748b',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          Registered Volunteers ({volunteers.length})
        </button>

        {user && (user.role === 'ADMIN' || user.role === 'VOLUNTEER') && (
          <button
            onClick={() => setActiveTab('responses')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              border: 'none',
              borderBottom: activeTab === 'responses' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'responses' ? '#2563eb' : '#64748b',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            Response Assignments ({responses.length})
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
          <Search size={18} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by volunteer name, skills, or operating area..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button onClick={fetchData} className="btn btn-outline">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading community response records...</p>
      ) : activeTab === 'volunteers' ? (
        /* Volunteers Directory */
        volunteers.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <h3>No Volunteers Found</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No volunteer profiles match your search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {volunteers.map((v) => (
              <div key={v.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{v.fullName}</h3>
                    <StatusBadge status={v.availabilityStatus} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '0.5rem' }}>📍 Area: {v.operatingArea}</p>
                  <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.75rem' }}><strong>Skills:</strong> {v.skills}</p>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} /> Contact: {v.phone || v.email}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Response Assignments Directory */
        responses.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <h3>No Active Response Tasks</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>There are no active response assignments registered.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {responses.map((r) => (
              <div key={r.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Assigned Volunteer: {r.volunteerName}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>
                    Linked Target: {r.incidentId ? `Incident #${r.incidentId}` : `Emergency Request #${r.requestId}`}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#334155' }}>Action Taken: {r.actionTaken || 'Dispatch assigned.'}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    className="form-control"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                    value={r.status}
                    onChange={(e) => handleResponseStatusUpdate(r.id, e.target.value)}
                  >
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ABANDONED">ABANDONED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Volunteer Registration Modal */}
      <Modal isOpen={isVolModalOpen} onClose={() => setIsVolModalOpen(false)} title="Register as Community Responder / Volunteer">
        <form onSubmit={handleRegisterVolunteer}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
          <div className="form-group">
            <label>Responder Skills & Qualifications</label>
            <input type="text" className="form-control" required value={volForm.skills} onChange={(e) => setVolForm({ ...volForm, skills: e.target.value })} placeholder="e.g. First Aid, Swiftwater Rescue, Logistics, EMT, Driver" />
          </div>
          <div className="form-group">
            <label>Operating Area / District</label>
            <input type="text" className="form-control" required value={volForm.operatingArea} onChange={(e) => setVolForm({ ...volForm, operatingArea: e.target.value })} placeholder="e.g. Sector 4 & Riverfront District" />
          </div>
          <div className="form-group">
            <label>Current Availability Status</label>
            <select className="form-control" value={volForm.availabilityStatus} onChange={(e) => setVolForm({ ...volForm, availabilityStatus: e.target.value })}>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BUSY">BUSY</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsVolModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Registering...' : 'Register Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Emergency Task Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Emergency Response Task">
        <form onSubmit={handleAssignSubmit}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
          <div className="form-group">
            <label>Select Volunteer Responder</label>
            <select className="form-control" value={assignForm.volunteerId} onChange={(e) => setAssignForm({ ...assignForm, volunteerId: e.target.value })}>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>{v.fullName} ({v.operatingArea}) - {v.availabilityStatus}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Target Category</label>
            <select className="form-control" value={assignForm.targetType} onChange={(e) => setAssignForm({ ...assignForm, targetType: e.target.value, targetId: '' })}>
              <option value="INCIDENT">Reported Disaster Incident</option>
              <option value="REQUEST">Emergency Assistance Request</option>
            </select>
          </div>
          <div className="form-group">
            <label>Select Specific Target Record</label>
            <select className="form-control" required value={assignForm.targetId} onChange={(e) => setAssignForm({ ...assignForm, targetId: e.target.value })}>
              <option value="">-- Choose Target --</option>
              {assignForm.targetType === 'INCIDENT' ? (
                incidentsList.map((inc) => (
                  <option key={inc.id} value={inc.id}>Incident #{inc.id}: {inc.disasterType} at {inc.location}</option>
                ))
              ) : (
                requestsList.map((req) => (
                  <option key={req.id} value={req.id}>Request #{req.id}: {req.requestType} at {req.location}</option>
                ))
              )}
            </select>
          </div>
          <div className="form-group">
            <label>Action Instructions / Dispatch Notes</label>
            <textarea className="form-control" rows="3" value={assignForm.actionTaken} onChange={(e) => setAssignForm({ ...assignForm, actionTaken: e.target.value })} placeholder="Enter response action plan or dispatch instructions..."></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
