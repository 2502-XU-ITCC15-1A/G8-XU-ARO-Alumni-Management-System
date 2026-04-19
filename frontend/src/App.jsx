import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AlumniDashboard from './pages/Alumni/AlumniDashboard';
import AlumniRegistration from './pages/Alumni/AlumniRegistration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<AlumniDashboard />} />
        <Route path="/register" element={<AlumniRegistration />} />        
      </Routes>
    </Router>
  );
}

export default App;