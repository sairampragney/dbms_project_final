import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, AlertTriangle, LifeBuoy, Home, Users, Info, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          <ShieldAlert size={28} />
          <span>DisasterResponse</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={16} /> Dashboard
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={16} /> Alerts
          </NavLink>
          <NavLink to="/incidents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={16} /> Incidents
          </NavLink>
          <NavLink to="/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LifeBuoy size={16} /> Emergency Aid
          </NavLink>
          <NavLink to="/locations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={16} /> Safe Shelters
          </NavLink>
          <NavLink to="/volunteers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={16} /> Community
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Info size={16} /> About
          </NavLink>
        </div>

        <div className="user-controls">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={16} /> {user.fullName} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                <LogIn size={14} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                <UserPlus size={14} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
