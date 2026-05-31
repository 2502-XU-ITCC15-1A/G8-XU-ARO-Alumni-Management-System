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
import ResetPassword from './pages/ResetPassword';

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        width: '100vw',
        backgroundColor: '#f4f6f9', 
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999
      }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '40px 30px', 
          borderRadius: '12px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
          maxWidth: '550px', 
          width: '100%', 
          textAlign: 'center',
          borderTop: '6px solid #002855',
          boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚙️</div>
          <h1 style={{ 
            color: '#002855', 
            fontSize: '28px', 
            margin: '0 0 15px 0', 
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            System Maintenance
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#4a5568', 
            lineHeight: '1.6', 
            margin: '0 0 25px 0' 
          }}>
            {maintenanceMessage}
          </p>
          <div style={{ 
            borderTop: '1px solid #e2e8f0', 
            paddingTop: '20px', 
            fontSize: '14px', 
            color: '#718096',
            fontWeight: '500'
          }}>
            Thank you for your patience. — Alumni Relations Office
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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