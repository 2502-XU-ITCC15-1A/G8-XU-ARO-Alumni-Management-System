import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard',          label: 'Dashboard',          icon: 'bi-grid-fill' },
  { path: '/alumni-records',     label: 'Alumni Records',     icon: 'bi-people' },
  { path: '/application-review', label: 'Application Review', icon: 'bi-file-earmark-text' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();

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
        {/* Close button — mobile only */}
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

      <div className="sidebar-footer">
        <div className="sidebar-avatar">A</div>
        <div>
          <div className="text-white fw-semibold" style={{ fontSize: 13 }}>Admin User</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>admin@xu.edu.ph</div>
        </div>
      </div>
    </div>
  );
}
