import React, { useState, useEffect } from 'react';
import axios from "axios";
import { 
  Gauge, Edit3, User, Bell, Contact2, Layout, Wallet, ArrowLeft, ArrowRight 
} from 'lucide-react';

const AlumniDashboard = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // States initialized as empty to remove all hardcoded placeholders
  const [userData, setUserData] = useState({ initials: "" });
  const [statuses, setStatuses] = useState({ id: "", app: "", payment: "" });
  const [activities, setActivities] = useState([]);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/applications/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const apps = res.data;

      // Example mapping for your UI
      setStatuses({
        id: apps.length > 0 ? "ACTIVE" : "NO ID",
        app: apps.length > 0 ? apps[0].status : "NONE",
        payment: apps.length > 0 ? apps[0].paymentStatus || "PENDING" : "NONE"
      });

      setActivities(
        apps.map(app => ({
          name: `Application #${app._id.slice(-5)}`,
          status: app.status
        }))
      );

    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  fetchData();
}, []);

  return (
    <div className="d-flex vh-100 vw-100 overflow-hidden" style={{ backgroundColor: '#D1D5DB' }}>
      <style>{`
        body, html, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
        .nav-link { cursor: pointer; transition: all 0.2s ease; border-radius: 0 !important; }
        .nav-link:hover { background-color: rgba(255, 255, 255, 0.1) !important; opacity: 1 !important; }
        .sidebar-transition { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
      
      {/* SIDEBAR */}
      <aside className="d-flex flex-column text-white shadow-lg h-100 sidebar-transition" 
             style={{ width: isMinimized ? '80px' : '280px', backgroundColor: '#233871', flexShrink: 0 }}>
        
        <div className="p-4 pt-5 pb-5 text-center overflow-hidden" style={{ height: '160px' }}>
          {!isMinimized ? (
            <>
              <small className="d-block text-uppercase fw-light mb-0" style={{ fontSize: '10px', letterSpacing: '1px' }}>Xavier University</small>
              <h2 className="fw-bold m-0" style={{ fontSize: '28px', letterSpacing: '1px' }}>ALUMNIMS</h2>
            </>
          ) : <h2 className="fw-bold">XU</h2>}
        </div>

        <div className={`px-3 mb-3 ${isMinimized ? 'text-center' : 'text-end'}`}>
          <div onClick={() => setIsMinimized(!isMinimized)} style={{ cursor: 'pointer', display: 'inline-block' }}>
            {isMinimized ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </div>
        </div>

        <nav className="flex-column nav w-100">
  {/* 1. Dashboard Link */}
  <div 
    onClick={() => navigate('/dashboard')} 
    className={`nav-link text-white d-flex align-items-center gap-3 p-3 ${activeTab === 'Dashboard' ? '' : 'opacity-75'}`}
    style={{ backgroundColor: activeTab === 'Dashboard' ? '#3B82F6' : 'transparent', cursor: 'pointer' }}
  >
    <Gauge size={28} /> {!isMinimized && "Dashboard"}
  </div>

  {/* 2. Apply/Registration Link */}
  <div 
    onClick={() => navigate('/register')} 
    className={`nav-link text-white d-flex align-items-center gap-3 p-3 ${activeTab === 'Apply' ? '' : 'opacity-75'}`}
    style={{ backgroundColor: activeTab === 'Apply' ? '#3B82F6' : 'transparent', cursor: 'pointer' }}
  >
    <Edit3 size={28} /> {!isMinimized && "Apply for Alumni ID"}
  </div>

  {/* 3. Applications Link */}
  <div 
    onClick={() => navigate('/applications')} 
    className={`nav-link text-white d-flex align-items-center gap-3 p-3 ${activeTab === 'Applications' ? '' : 'opacity-75'}`}
    style={{ backgroundColor: activeTab === 'Applications' ? '#3B82F6' : 'transparent', cursor: 'pointer' }}
  >
    <User size={28} /> {!isMinimized && "Applications"}
  </div>
</nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="d-flex flex-column h-100 flex-grow-1 overflow-hidden">
        
        <header className="navbar bg-white px-4 shadow-sm py-3 flex-shrink-0 w-100">
          <h2 className="m-0 fw-bold fs-3 text-dark">Dashboard Overview</h2>
          <div className="d-flex align-items-center gap-4">
            <Bell size={24} className="text-dark" style={{ cursor: 'pointer' }} />
            <div className="rounded-pill px-3 py-1 text-white d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#233871' }}>
              <span className="fw-bold">{userData.initials}</span>
              <small>▼</small>
            </div>
          </div>
        </header>

        <div className="p-4 flex-grow-1 overflow-auto">
          {/* STATUS CARDS */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted d-block fw-bold mb-1" style={{ fontSize: '14px' }}>ID Status</small>
                    <h3 className="fw-bold m-0 text-dark" style={{ fontSize: '24px' }}>{statuses.id}</h3>
                  </div>
                  <Contact2 size={64} color="#FBBF24" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted d-block fw-bold mb-1" style={{ fontSize: '14px' }}>Application Status</small>
                    <h3 className="fw-bold m-0 text-dark" style={{ fontSize: '24px' }}>{statuses.app}</h3>
                  </div>
                  <Layout size={64} color="#10B981" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted d-block fw-bold mb-1" style={{ fontSize: '14px' }}>Payment Status</small>
                    <h3 className="fw-bold m-0 text-dark" style={{ fontSize: '24px' }}>{statuses.payment}</h3>
                  </div>
                  <Wallet size={64} color="#2563EB" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="p-4 border-bottom">
              <h4 className="m-0 fw-bold">Recent Activity</h4>
            </div>
            <div className="card-body p-4">
              {activities.length > 0 ? activities.map((act, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center p-3 border rounded-3 mb-2 shadow-sm" style={{ backgroundColor: '#F8F9FA' }}>
                  <span className="fs-5 fw-medium text-dark">{act.name}</span>
                  <span className="badge rounded-pill px-4 py-2 text-white bg-primary" style={{ fontSize: '14px' }}>{act.status}</span>
                </div>
              )) : (
                <div className="text-center p-4 text-muted font-italic">No current activities.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlumniDashboard;