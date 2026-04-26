import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLE_REDIRECTS = {
  'xu-aro':   '/dashboard',
  'alumni':   '/alumni-portal',
  'external': '/external-portal',
};

const roles = [
  { id: 'xu-aro',   label: 'ARO\nSTAFF',    icon: 'bi-person-badge-fill' },
  { id: 'alumni',   label: 'ALUMNI',         icon: 'bi-mortarboard-fill' },
  { id: 'external', label: 'BOOK\nCENTER',   icon: 'bi-shop' },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const ACTIVE_PORTALS = ['xu-aro', 'external'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    if (token && ACTIVE_PORTALS.includes(role)) {
      navigate(ROLE_REDIRECTS[role], { replace: true });
    } else if (!ACTIVE_PORTALS.includes(role)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    }
  }, [navigate]);

  return (
    <div className="role-page">
      <div className="role-card">

        <div className="role-header">
          <div className="role-logo">
            <i className="bi bi-shield-fill-check" style={{ fontSize: 36, color: '#c9a030' }} />
          </div>
          <div>
            <div className="role-university">XAVIER UNIVERSITY – ATENEO DE CAGAYAN</div>
            <div className="role-office">Alumni Relations Office</div>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 32 }}>
          Select your role to continue
        </p>

        <div className="role-buttons">
          {roles.map(r => (
            <button
              key={r.id}
              className="role-btn"
              onClick={() => navigate('/login', { state: { role: r.id } })}
            >
              <i className={`bi ${r.icon}`} />
              <span style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>{r.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
