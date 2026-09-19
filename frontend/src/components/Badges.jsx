import React from 'react';

export function SeverityBadge({ level }) {
  const norm = (level || 'LOW').toUpperCase();
  let className = 'badge badge-low';
  if (norm === 'CRITICAL') className = 'badge badge-critical';
  else if (norm === 'HIGH') className = 'badge badge-high';
  else if (norm === 'MEDIUM') className = 'badge badge-medium';

  return <span className={className}>{norm}</span>;
}

export function StatusBadge({ status }) {
  const norm = (status || 'ACTIVE').toUpperCase();
  let bg = '#f1f5f9';
  let color = '#334155';
  let border = '#cbd5e1';

  if (norm === 'ACTIVE' || norm === 'REPORTED' || norm === 'PENDING' || norm === 'OPEN' || norm === 'AVAILABLE') {
    bg = '#eff6ff'; color = '#1d4ed8'; border = '#bfdbfe';
  } else if (norm === 'IN_PROGRESS' || norm === 'ASSIGNED' || norm === 'VERIFIED' || norm === 'BUSY') {
    bg = '#fffbeb'; color = '#b45309'; border = '#fef3c7';
  } else if (norm === 'RESOLVED' || norm === 'FULFILLED' || norm === 'COMPLETED') {
    bg = '#ecfdf5'; color = '#047857'; border = '#a7f3d0';
  } else if (norm === 'FULL' || norm === 'CANCELLED' || norm === 'DISMISSED' || norm === 'CLOSED' || norm === 'UNAVAILABLE' || norm === 'ABANDONED') {
    bg = '#fef2f2'; color = '#b91c1c'; border = '#fecaca';
  }

  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}
    >
      {norm}
    </span>
  );
}
