import React from 'react';
import { ShieldAlert, BookOpen, PhoneCall, HelpCircle, Database, Server } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert style={{ color: '#dc2626' }} size={32} /> About Disaster Alert & Response App
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
          An advanced full-stack disaster management and community emergency response platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: '#2563eb' }} /> Mission & Vision
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
            Designed to empower local communities during critical disaster events by providing real-time disaster warnings, rapid incident reporting, emergency aid request triage, shelter occupancy tracking, and volunteer response dispatch.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} style={{ color: '#10b981' }} /> Architecture & Tech Stack
          </h3>
          <ul style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
            <li><strong>Frontend:</strong> React 18, Vite, React Router v6</li>
            <li><strong>Backend REST API:</strong> Node.js, Express.js, JWT, Bcrypt</li>
            <li><strong>Database:</strong> MySQL 8.0+ normalized relational DB (3NF)</li>
            <li><strong>Containerization:</strong> Docker & Docker Compose</li>
          </ul>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={20} style={{ color: '#f59e0b' }} /> System User Guidelines
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.9rem', color: '#334155' }}>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Citizens</h4>
            <p>Browse active warnings, report local hazards, request emergency assistance, or locate safe evacuation shelters.</p>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Volunteers</h4>
            <p>Register skills and availability, view emergency dispatch tasks, and log completed response actions.</p>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Administrators</h4>
            <p>Publish official alerts, update shelter capacities, verify reported incidents, and assign response teams.</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PhoneCall size={20} style={{ color: '#ef4444' }} /> Emergency Contact Directory
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
          <div>National Emergency Line: <strong>911</strong></div>
          <div>Disaster Triage Line: <strong>1-800-555-0199</strong></div>
          <div>Red Cross Shelters: <strong>1-800-733-2767</strong></div>
          <div>FEMA Disaster Aid: <strong>1-800-621-3362</strong></div>
        </div>
      </div>
    </div>
  );
}
