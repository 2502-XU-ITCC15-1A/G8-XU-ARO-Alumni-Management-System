import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="mobile-topbar d-flex d-md-none">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{ background: 'none', border: 'none', color: '#fff', padding: 0, lineHeight: 1 }}
        >
          <i className="bi bi-list" aria-hidden="true" style={{ fontSize: 26 }} />
        </button>
        <span className="text-white fw-bold" style={{ fontSize: 16 }}>XU Alumni Relations</span>
      </div>

      {sidebarOpen && (
        <div className="sidebar-backdrop d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content">
        <div className="mobile-topbar-offset d-md-none" />
        <Outlet />
      </div>
    </div>
  );
}
