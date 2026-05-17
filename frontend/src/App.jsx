import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import AdminLayout from './components/AdminLayout';
import BookCenterLayout from './components/BookCenterLayout';
import AlumniLayout from './components/AlumniLayout';

import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import RoleSelection from './pages/RoleSelection';
import PrivateRoute from './components/PrivateRoute';

import Dashboard from './pages/admin/Dashboard';
import AlumniRecords from './pages/admin/AlumniRecords';
import ApplicationReview from './pages/admin/ApplicationReview';
import UserManagement from './pages/admin/UserManagement';
import SystemLogs from './pages/admin/SystemLogs';

import BookCenterDashboard from './pages/external/BookCenterDashboard';
import ApprovedApplications from './pages/external/ApprovedApplications';
import ApplicationDetail from './pages/external/ApplicationDetail';
import IDProcessing from './pages/external/IDProcessing';
import BookCenterSystemLogs from './pages/external/BookCenterSystemLogs';

import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniIdApplication from './pages/alumni/AlumniIdApplication';
import AlumniNotification from './pages/alumni/AlumniNotification';

export default function App() {
  const [maintenanceMessage, setMaintenanceMessage] = useState(null);

  useEffect(() => {
    axios.get('https://aro-alumni-backend.onrender.com')
      .catch(error => {
        if (error.response && error.response.status === 503) {
          setMaintenanceMessage(error.response.data.message);
        }
      });
  }, []);

  if (maintenanceMessage) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', color: '#333' }}>
        <h1 style={{ color: '#002855' }}>System Maintenance</h1>
        <p style={{ fontSize: '18px' }}>{maintenanceMessage}</p>
        <p style={{ color: '#666' }}>Thank you for your patience. — Alumni Relations Office</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<PrivateRoute allowedRole="xu-aro" />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumni-records" element={<AlumniRecords />} />
            <Route path="/application-review" element={<ApplicationReview />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/admin/system-logs" element={<SystemLogs />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRole="external" />}>
          <Route element={<BookCenterLayout />}>
            <Route path="/external-portal" element={<BookCenterDashboard />} />
            <Route path="/external-portal/applications" element={<ApprovedApplications />} />
            <Route path="/external-portal/applications/:id" element={<ApplicationDetail />} />
            <Route path="/external-portal/id-processing" element={<IDProcessing />} />
            <Route path="/external-portal/system-logs" element={<BookCenterSystemLogs />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRole="alumni" />}>
          <Route element={<AlumniLayout />}>
            <Route path="/alumni-portal" element={<AlumniDashboard />} />
            <Route path="/alumni-portal/profile" element={<AlumniProfile />} />
            <Route path="/alumni-portal/apply" element={<AlumniIdApplication />} />
            <Route path="/alumni-portal/notifications" element={<AlumniNotification />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}