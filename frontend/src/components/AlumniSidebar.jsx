import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const navItems = [
  { path: '/alumni-portal',             label: 'Dashboard',      icon: 'bi-grid-fill' },
  { path: '/alumni-portal/profile',     label: 'My Profile',     icon: 'bi-person-fill' },
  { path: '/alumni-portal/apply',       label: 'Alumni ID',      icon: 'bi-card-heading' },
  { path: '/alumni-portal/notifications', label: 'Notifications', icon: 'bi-bell-fill' },
];

export default function AlumniSidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const name    = user.name  || 'Alumni';
  const email   = user.email || '';
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get('/api/notifications/unread-count', { headers });
        setUnreadCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

      <div className="sidebar-brand d-flex align-items-start justify-content-between">
        <div>
          <div className="text-white fw-bold" style={{ fontSize: 20, lineHeight: 1.3 }}>
            XU Alumni<br />Portal
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
            Alumni Self-Service
          </div>
        </div>
        <button
          className="d-md-none"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: 0, lineHeight: 1 }}
        >
          <i className="bi bi-x-lg" style={{ fontSize: 18 }} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`sidebar-nav-link ${pathname === item.path ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`} style={{ fontSize: 16 }} />
            {item.label}
            {item.path === '/alumni-portal/notifications' && unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div style={{ position: 'relative' }}>
        {showMenu && (
          <div className="sidebar-user-menu">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" />
              Log out
            </button>
          </div>
        )}

        <button
          className={`sidebar-footer ${showMenu ? 'sidebar-footer-active' : ''}`}
          onClick={() => setShowMenu(v => !v)}
        >
          <div className="sidebar-avatar">{initial}</div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div className="text-white fw-semibold text-truncate" style={{ fontSize: 13 }}>
              {name}
            </div>
            <div className="text-truncate" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              {email}
            </div>
          </div>
          <i
            className={`bi bi-chevron-${showMenu ? 'down' : 'up'}`}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, flexShrink: 0 }}
          />
        </button>
      </div>
    </div>
  );
}
