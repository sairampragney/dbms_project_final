import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h5>Disaster Alert & Response Network</h5>
          <p style={{ fontSize: '0.85rem' }}>
            A centralized full-stack emergency response system for real-time alert broadcasting, citizen incident reporting, emergency aid triage, safe shelter capacity tracking, and volunteer response coordination.
          </p>
        </div>
        <div>
          <h5>Quick Emergency Links</h5>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', lineHeight: '1.8' }}>
            <li>Emergency Police & Fire: <strong>911</strong></li>
            <li>Medical Assistance Hotline: <strong>1-800-555-0199</strong></li>
            <li>Disaster Evacuation Line: <strong>1-800-555-0100</strong></li>
            <li>Red Cross Shelter Information: <strong>1-800-733-2767</strong></li>
          </ul>
        </div>
        <div>
          <h5>System Operational Status</h5>
          <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
            🟢 All Systems Operational (Database Linked)
          </p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Powered by React, Express, and MySQL 8.0+ Relational DBMS.
          </p>
        </div>
      </div>
    </footer>
  );
}
