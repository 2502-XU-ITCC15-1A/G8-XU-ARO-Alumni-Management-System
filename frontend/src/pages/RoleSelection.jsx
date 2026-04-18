import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { id: 'xu-aro',   label: 'XU-ARO',   icon: 'bi-person-fill' },
  { id: 'alumni',   label: 'ALUMNI',   icon: 'bi-mortarboard-fill' },
  { id: 'external', label: 'EXTERNAL', icon: 'bi-globe' },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const role = localStorage.getItem('role');
      if (role === 'xu-aro') navigate('/dashboard', { replace: true });
      else if (role === 'alumni') navigate('/alumni-portal', { replace: true });
      else navigate('/external-portal', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="role-page">
      <div className="role-card">

        {/* Header */}
        <div className="role-header">
          <div className="role-logo">
            <i className="bi bi-shield-fill" style={{ fontSize: 36, color: '#c9a030' }} />
          </div>
          <div>
            <div className="role-university">XAVIER UNIVERSITY - ATENEO DE CAGAYAN</div>
            <div className="role-office">ALUMNI RELATIONS OFFICE</div>
          </div>
        </div>

        {/* Role buttons */}
        <div className="role-buttons">
          {ROLES.map(role => (
            <button
              key={role.id}
              className="role-btn"
              onClick={() => navigate('/login', { state: { role: role.id } })}
            >
              <i className={`bi ${role.icon}`} />
              <span>{role.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
