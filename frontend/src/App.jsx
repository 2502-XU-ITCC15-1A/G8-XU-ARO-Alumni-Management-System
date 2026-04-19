import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/admin/Dashboard';
import AlumniRecords from './pages/admin/AlumniRecords';
import ApplicationReview from './pages/admin/ApplicationReview';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">

        {/* Mobile top bar */}
        <div className="mobile-topbar d-flex d-md-none">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', padding: 0, lineHeight: 1 }}
          >
            <i className="bi bi-list" style={{ fontSize: 26 }} />
          </button>
          <span className="text-white fw-bold" style={{ fontSize: 16 }}>XU Alumni Relations</span>
        </div>

        {/* Sidebar backdrop on mobile */}
        {sidebarOpen && (
          <div className="sidebar-backdrop d-md-none" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="app-content">
          {/* Push content below mobile topbar */}
          <div className="mobile-topbar-offset d-md-none" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumni-records" element={<AlumniRecords />} />
            <Route path="/application-review" element={<ApplicationReview />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}
