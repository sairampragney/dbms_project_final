import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Activity, LifeBuoy, Home, Users, ShieldAlert, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { getDashboardStats, getAlerts } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/Badges';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    openIncidents: 0,
    pendingRequests: 0,
    openShelters: 0,
    remainingShelterCapacity: 0,
    availableVolunteers: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, alertsRes] = await Promise.all([
        getDashboardStats(),
        getAlerts({ status: 'ACTIVE', limit: 3 })
      ]);

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (alertsRes.data && alertsRes.data.success) {
        setAlerts(alertsRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Unable to fetch live database metrics. Ensure backend server is connected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      {/* Top Banner */}
      <div className="emergency-hotline-bar" style={{ borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} style={{ color: '#ef4444' }} />
          <span><strong>Emergency Operations Center:</strong> Active Monitoring In Progress</span>
        </div>
        <div className="hotline-pills">
          <span>Police/Fire: <strong className="hotline-pill">911</strong></span>
          <span>Aid Hotline: <strong className="hotline-pill">1-800-555-0199</strong></span>
          <button onClick={fetchDashboardData} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#fff', borderColor: '#475569' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Community Emergency Response Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Real-time database aggregated metrics & active disaster updates.</p>

      {/* Real-time Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon danger"><AlertTriangle size={24} /></div>
          <div className="metric-data">
            <h4>Active Alerts</h4>
            <p>{loading ? '...' : stats.activeAlerts}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon warning"><Activity size={24} /></div>
          <div className="metric-data">
            <h4>Open Incidents</h4>
            <p>{loading ? '...' : stats.openIncidents}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon danger"><LifeBuoy size={24} /></div>
          <div className="metric-data">
            <h4>Pending Aid Requests</h4>
            <p>{loading ? '...' : stats.pendingRequests}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon info"><Home size={24} /></div>
          <div className="metric-data">
            <h4>Open Safe Shelters</h4>
            <p>{loading ? '...' : `${stats.openShelters} (${stats.remainingShelterCapacity} spots)`}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon success"><Users size={24} /></div>
          <div className="metric-data">
            <h4>Available Volunteers</h4>
            <p>{loading ? '...' : stats.availableVolunteers}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Action Cards & Active Broadcasts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Quick Action Cards */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: '#2563eb' }} /> Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/incidents" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> Report an Incident</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/requests" className="btn btn-danger" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LifeBuoy size={16} /> Request Emergency Aid</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/locations" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Home size={16} /> Find Safe Shelter</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/volunteers" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> Register as Volunteer</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Active Broadcasts */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} style={{ color: '#dc2626' }} /> Active Alerts Broadcast
            </h3>
            <Link to="/alerts" style={{ fontSize: '0.85rem', fontWeight: '600' }}>View All →</Link>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading active alerts...</p>
          ) : alerts.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No active disaster alerts broadcasted.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map((a) => (
                <div key={a.id} style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fee2e2', backgroundColor: '#fff5f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#991b1b' }}>{a.title}</h4>
                    <SeverityBadge level={a.severity} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>📍 {a.affectedLocation}</p>
                  <p style={{ fontSize: '0.85rem', color: '#334155' }}>{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
