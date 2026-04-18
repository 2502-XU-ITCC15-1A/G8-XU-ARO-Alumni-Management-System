import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';

import PrivateRoute     from './components/PrivateRoute';
import Sidebar          from './components/Sidebar';
import RoleSelection    from './pages/RoleSelection';
import Login            from './pages/Login';
import Dashboard        from './pages/admin/Dashboard';
import AlumniRecords    from './pages/admin/AlumniRecords';
import ApplicationReview from './pages/admin/ApplicationReview';

function ComingSoon({ title }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100%', padding: 60, textAlign: 'center' }}>
      <i className="bi bi-clock-history text-muted" style={{ fontSize: 64 }} />
      <h4 className="mt-4 text-muted">{title}</h4>
      <p className="text-muted small mt-2">This portal is under construction.</p>
    </div>
  );
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="mobile-topbar d-flex d-md-none">
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', padding: 0, lineHeight: 1 }}>
          <i className="bi bi-list" style={{ fontSize: 26 }} />
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"      element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />

        {/* Protected — ARO admin layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard"          element={<Dashboard />} />
            <Route path="/alumni-records"     element={<AlumniRecords />} />
            <Route path="/application-review" element={<ApplicationReview />} />
          </Route>

          {/* Role-specific portals (placeholders) */}
          <Route path="/alumni-portal"   element={<ComingSoon title="Alumni Portal" />} />
          <Route path="/external-portal" element={<ComingSoon title="External Portal" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
