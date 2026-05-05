import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layouts
import AdminLayout from './components/AdminLayout';
import BookCenterLayout from './components/BookCenterLayout';
import AlumniLayout from './components/AlumniLayout';

// Auth
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import RoleSelection from './pages/RoleSelection';
import PrivateRoute from './components/PrivateRoute';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import AlumniRecords from './pages/admin/AlumniRecords';
import ApplicationReview from './pages/admin/ApplicationReview';
import UserManagement from './pages/admin/UserManagement';

// Book Center pages
import BookCenterDashboard from './pages/external/BookCenterDashboard';
import ApprovedApplications from './pages/external/ApprovedApplications';
import ApplicationDetail from './pages/external/ApplicationDetail';
import IDProcessing from './pages/external/IDProcessing';

// Alumni pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniIdApplication from './pages/alumni/AlumniIdApplication';
import AlumniNotification from './pages/alumni/AlumniNotification';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin/Staff routes */}
        <Route element={<PrivateRoute allowedRole="xu-aro" />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumni-records" element={<AlumniRecords />} />
            <Route path="/application-review" element={<ApplicationReview />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Book Center routes */}
        <Route element={<PrivateRoute allowedRole="external" />}>
          <Route element={<BookCenterLayout />}>
            <Route path="/external-portal" element={<BookCenterDashboard />} />
            <Route path="/external-portal/applications" element={<ApprovedApplications />} />
            <Route path="/external-portal/applications/:id" element={<ApplicationDetail />} />
            <Route path="/external-portal/id-processing" element={<IDProcessing />} />
          </Route>
        </Route>

        {/* Alumni routes */}
        <Route element={<PrivateRoute allowedRole="alumni" />}>
          <Route element={<AlumniLayout />}>
            <Route path="/alumni-portal" element={<AlumniDashboard />} />
            <Route path="/alumni-portal/profile" element={<AlumniProfile />} />
            <Route path="/alumni-portal/apply" element={<AlumniIdApplication />} />
            <Route path="/alumni-portal/notifications" element={<AlumniNotification />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}