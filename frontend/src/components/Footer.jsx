import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h5>Disaster Alert & Response Network (India)</h5>
          <p style={{ fontSize: '0.85rem' }}>
            A centralized full-stack emergency response system for real-time alert broadcasting, citizen incident reporting, emergency aid triage, safe shelter capacity tracking, and volunteer response coordination across India.
          </p>
        </div>
        <div>
          <h5>Emergency Contact Helplines</h5>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', lineHeight: '1.8' }}>
            <li>Nationwide Emergency CTA: <a href="tel:112" style={{ color: '#ef4444', fontWeight: 'bold' }}>Call 112</a></li>
            <li>Police Emergency: <strong>100 / 112</strong></li>
            <li>Fire Services: <strong>101 / 112</strong></li>
            <li>Ambulance & Medical Aid: <strong>108 / 112</strong></li>
            <li>NDRF Disaster Helpline: <strong>1078 / 011-24363260</strong></li>
          </ul>
        </div>
        <div>
          <h5>System Operational Status</h5>
          <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
            🟢 All Systems Operational (Database Linked)
          </p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Powered by React, Express, and MySQL 8.0+ Relational DBMS. Default geography: Hyderabad, Telangana.
          </p>
        </div>
      </div>
    </footer>
  );
}
