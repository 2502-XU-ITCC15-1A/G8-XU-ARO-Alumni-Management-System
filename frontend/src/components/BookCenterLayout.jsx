import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BookCenterSidebar from './BookCenterSidebar';

export default function BookCenterLayout() {
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
        <span className="text-white fw-bold" style={{ fontSize: 16 }}>XU Book Center</span>
      </div>

      {sidebarOpen && (
        <div className="sidebar-backdrop d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      <BookCenterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content">
        <div className="mobile-topbar-offset d-md-none" />
        <Outlet />
      </div>
    </div>
  );
}
