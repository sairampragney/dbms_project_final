import React, { useState, useEffect } from 'react';
import { Home, Plus, Search, Filter, RefreshCw, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import { getLocations, createLocation, updateLocation } from '../services/api';
import { StatusBadge } from '../components/Badges';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function LocationsPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isOccupancyModalOpen, setIsOccupancyModalOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);

  const [registerForm, setRegisterForm] = useState({
    name: '',
    address: '',
    capacity: 100,
    currentOccupancy: 0,
    facilities: '',
    contactPhone: ''
  });
  const [occupancyInput, setOccupancyInput] = useState(0);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLocations({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search || undefined
      });
      if (res.data && res.data.success) {
        setLocations(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching safe locations:', err);
      setError('Failed to fetch safe location shelters from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [statusFilter, search]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        ...registerForm,
        capacity: parseInt(registerForm.capacity, 10),
        currentOccupancy: parseInt(registerForm.currentOccupancy, 10) || 0
      };
      const res = await createLocation(payload);
      if (res.data && res.data.success) {
        setIsRegisterModalOpen(false);
        setRegisterForm({ name: '', address: '', capacity: 100, currentOccupancy: 0, facilities: '', contactPhone: '' });
        fetchLocations();
      }
    } catch (err) {
      console.error('Error registering shelter:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to register safe location shelter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOccupancyUpdate = async (e) => {
    e.preventDefault();
    if (!selectedShelter) return;
    setFormError('');
    setSubmitting(true);
    try {
      const res = await updateLocation(selectedShelter.id, {
        currentOccupancy: parseInt(occupancyInput, 10)
      });
      if (res.data && res.data.success) {
        setIsOccupancyModalOpen(false);
        setSelectedShelter(null);
        fetchLocations();
      }
    } catch (err) {
      console.error('Error updating occupancy:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to update shelter occupancy');
    } finally {
      setSubmitting(false);
    }
  };

  const openOccupancyModal = (shelter) => {
    setSelectedShelter(shelter);
    setOccupancyInput(shelter.currentOccupancy);
    setIsOccupancyModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home style={{ color: '#2563eb' }} /> Safe Locations & Evacuation Shelters
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Locate open evacuation centers, view current occupancy, facilities, and contact details.</p>
        </div>

        {user && user.role === 'ADMIN' && (
          <button onClick={() => setIsRegisterModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Safe Location
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
          <Search size={18} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search shelters by name, address, or facilities..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: '#64748b' }} />
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Operational Status: All Shelters</option>
            <option value="OPEN">Status: OPEN</option>
            <option value="FULL">Status: FULL</option>
            <option value="CLOSED">Status: CLOSED</option>
          </select>
          <button onClick={fetchLocations} className="btn btn-outline">
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
        <p style={{ color: '#64748b' }}>Loading safe location shelters...</p>
      ) : locations.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <h3>No Safe Shelters Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No location records match your search/filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {locations.map((loc) => {
            const occupancyPct = Math.min(100, Math.round((loc.currentOccupancy / loc.capacity) * 100)) || 0;
            let progressColor = '#10b981';
            if (occupancyPct >= 100) progressColor = '#dc2626';
            else if (occupancyPct >= 80) progressColor = '#f59e0b';

            return (
              <div key={loc.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{loc.name}</h3>
                    <StatusBadge status={loc.status} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>📍 {loc.address}</p>

                  {/* Occupancy Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem', color: '#334155' }}>
                      <span>Occupancy: {loc.currentOccupancy} / {loc.capacity} ({occupancyPct}%)</span>
                      <span>Remaining: {Math.max(0, loc.capacity - loc.currentOccupancy)}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${occupancyPct}%`, backgroundColor: progressColor, transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>

                  {loc.facilities && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Available Facilities</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {loc.facilities.split(',').map((fac, idx) => (
                          <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} style={{ color: '#10b981' }} /> {fac.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {loc.contactPhone ? (
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={14} /> {loc.contactPhone}
                    </span>
                  ) : <div></div>}

                  {user && user.role === 'ADMIN' && (
                    <button onClick={() => openOccupancyModal(loc)} className="btn btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                      Manage Occupancy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Add Shelter Modal */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register Safe Location Shelter (Admin)">
        <form onSubmit={handleRegisterSubmit}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
          <div className="form-group">
            <label>Shelter / Location Name</label>
            <input type="text" className="form-control" required value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} placeholder="e.g. Central High School Gym Shelter" />
          </div>
          <div className="form-group">
            <label>Physical Address</label>
            <input type="text" className="form-control" required value={registerForm.address} onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} placeholder="e.g. 500 Education Way, Sector 1" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Maximum Capacity</label>
              <input type="number" min="1" className="form-control" required value={registerForm.capacity} onChange={(e) => setRegisterForm({ ...registerForm, capacity: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Initial Occupancy</label>
              <input type="number" min="0" className="form-control" value={registerForm.currentOccupancy} onChange={(e) => setRegisterForm({ ...registerForm, currentOccupancy: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Available Facilities (comma separated)</label>
            <input type="text" className="form-control" value={registerForm.facilities} onChange={(e) => setRegisterForm({ ...registerForm, facilities: e.target.value })} placeholder="e.g. Medical Station, Generator Power, Hot Meals, Pet Friendly" />
          </div>
          <div className="form-group">
            <label>Shelter Contact Hotline Phone</label>
            <input type="text" className="form-control" value={registerForm.contactPhone} onChange={(e) => setRegisterForm({ ...registerForm, contactPhone: e.target.value })} placeholder="+1 (555) 900-1000" />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Registering...' : 'Register Shelter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Update Occupancy Modal */}
      <Modal isOpen={isOccupancyModalOpen} onClose={() => setIsOccupancyModalOpen(false)} title={`Update Occupancy: ${selectedShelter?.name}`}>
        <form onSubmit={handleOccupancyUpdate}>
          {formError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
            Total Capacity: <strong>{selectedShelter?.capacity}</strong> occupants
          </p>
          <div className="form-group">
            <label>Current Number of Occupants</label>
            <input type="number" min="0" className="form-control" required value={occupancyInput} onChange={(e) => setOccupancyInput(e.target.value)} />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setIsOccupancyModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Save Occupancy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
