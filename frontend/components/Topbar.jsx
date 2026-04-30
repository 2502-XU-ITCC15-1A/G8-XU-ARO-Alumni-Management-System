import React from 'react';
import { Bell } from 'lucide-react';

const Topbar = ({ title, initials = "MR" }) => {
  return (
    <header className="navbar bg-white px-4 shadow-sm py-2 flex-shrink-0 w-100">
      <h2 className="m-0 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>{title}</h2>
      <div className="d-flex align-items-center gap-4">
        <Bell size={20} className="text-dark" style={{ cursor: 'pointer' }} />
        <div className="rounded-pill px-3 py-1 text-white d-flex align-items-center gap-2 shadow-sm" 
             style={{ backgroundColor: '#233871', fontSize: '0.85rem' }}>
          <span className="fw-bold">{initials}</span>
          <small style={{ fontSize: '0.7rem' }}>▼</small>
        </div>
      </div>
    </header>
  );
};

export default Topbar;