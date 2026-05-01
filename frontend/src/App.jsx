import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

import IDProcessing from './pages/external/IDProcessing';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/AdminLayout';
import BookCenterLayout from './components/BookCenterLayout';
import AlumniLayout from './components/AlumniLayout';

import Dashboard from './pages/admin/Dashboard';
import AlumniRecords from './pages/admin/AlumniRecords';
import ApplicationReview from './pages/admin/ApplicationReview';
import UserManagement from './pages/admin/UserManagement';

import BookCenterDashboard from './pages/external/BookCenterDashboard';
import ApprovedApplications from './pages/external/ApprovedApplications';
import ApplicationDetail from './pages/external/ApplicationDetail';

import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniIdApplication from './pages/alumni/AlumniIdApplication';
import AlumniNotification from './pages/alumni/AlumniNotification';

export default function App() {
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch unread notifications count when the component mounts
  useEffect(() => {
    const getUnreadCount = async () => {
      try {
        const response = await axios.get('/api/notifications/unread-count', { headers });
        setUnreadCount(response.data.count); // Assuming response has { count: number }
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    if (token) {
      getUnreadCount();
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />

        {/* XU-ARO Staff */}
        <Route element={<PrivateRoute allowedRole="xu-aro" />}>
          <Route element={<AdminLayout unreadCount={unreadCount} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumni-records" element={<AlumniRecords />} />
            <Route path="/application-review" element={<ApplicationReview />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Book Center Staff */}
        <Route element={<PrivateRoute allowedRole="external" />}>
          <Route element={<BookCenterLayout unreadCount={unreadCount} />}>
            <Route path="/external-portal" element={<BookCenterDashboard />} />
            <Route path="/external-portal/applications" element={<ApprovedApplications />} />
            <Route path="/external-portal/applications/:id" element={<ApplicationDetail />} />
            <Route path="/external-portal/id-processing" element={<IDProcessing />} />
          </Route>
        </Route>

        {/* Alumni */}
        <Route element={<PrivateRoute allowedRole="alumni" />}>
          <Route element={<AlumniLayout unreadCount={unreadCount} />}>
            <Route path="/alumni-portal" element={<AlumniDashboard />} />
            <Route path="/alumni-portal/profile" element={<AlumniProfile />} />
            <Route path="/alumni-portal/apply" element={<AlumniIdApplication />} />
            <Route path="/alumni-portal/notifications" element={<AlumniNotification />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}