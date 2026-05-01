import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard',          label: 'Dashboard',          icon: 'bi-grid-fill' },
  { path: '/alumni-records',     label: 'Alumni Records',     icon: 'bi-people' },
  { path: '/application-review', label: 'Application Review', icon: 'bi-file-earmark-text' },
  { path: '/user-management',    label: 'User Management',    icon: 'bi-person-gear' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const name    = user.name  || 'User';
  const email   = user.email || '';
  const initial = name.charAt(0).toUpperCase();

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
            XU Alumni<br />Relations
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
            ARO Staff Portal
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
