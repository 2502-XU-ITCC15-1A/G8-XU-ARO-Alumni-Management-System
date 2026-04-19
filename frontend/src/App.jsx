import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import RoleSelection    from './pages/RoleSelection';
import Login            from './pages/Login';
import PrivateRoute     from './components/PrivateRoute';
import AdminLayout      from './components/AdminLayout';
import BookCenterLayout from './components/BookCenterLayout';

import Dashboard           from './pages/admin/Dashboard';
import AlumniRecords       from './pages/admin/AlumniRecords';
import ApplicationReview   from './pages/admin/ApplicationReview';

import BookCenterDashboard  from './pages/external/BookCenterDashboard';
import ApprovedApplications from './pages/external/ApprovedApplications';
import ApplicationDetail    from './pages/external/ApplicationDetail';

function ComingSoon({ label }) {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh', flexDirection: 'column', gap: 12 }}>
      <i className="bi bi-hammer" style={{ fontSize: 48, color: '#9ca3af' }} />
      <h5 className="text-muted">{label || 'Coming Soon'}</h5>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />

        {/* XU-ARO Staff */}
        <Route element={<PrivateRoute allowedRole="xu-aro" />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard"          element={<Dashboard />} />
            <Route path="/alumni-records"     element={<AlumniRecords />} />
            <Route path="/application-review" element={<ApplicationReview />} />
          </Route>
        </Route>

        {/* Book Center Staff */}
        <Route element={<PrivateRoute allowedRole="external" />}>
          <Route element={<BookCenterLayout />}>
            <Route path="/external-portal"                        element={<BookCenterDashboard />} />
            <Route path="/external-portal/applications"           element={<ApprovedApplications />} />
            <Route path="/external-portal/applications/:id"       element={<ApplicationDetail />} />
          </Route>
        </Route>

        {/* Alumni (placeholder) */}
        <Route path="/alumni-portal" element={<ComingSoon label="Alumni Portal – Coming Soon" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
