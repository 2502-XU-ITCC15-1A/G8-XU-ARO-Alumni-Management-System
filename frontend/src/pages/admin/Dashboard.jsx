import { useEffect, useState } from 'react';
import axios from 'axios';

function StatCard({ label, value, icon, bg, loading }) {
  return (
    <div className="col-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-4">
          <div className="stat-icon mb-3" style={{ backgroundColor: bg }}>
            <i className={`bi ${icon}`} />
          </div>
          <div className="fs-2 fw-bold text-dark mb-1">
            {loading ? <span className="placeholder col-4" /> : value}
          </div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  pending:         'Pending',
  under_review:    'Under Review',
  approved:        'Approved',
  payment_pending: 'Payment Pending',
  payment:         'Payment Verified',
  printing:        'Printing',
  released:        'Released',
  rejected:        'Rejected',
};

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  return <span className={`status-badge status-${status}`}>{label}</span>;
}

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : '—';
}

export default function Dashboard() {
  const [alumni, setAlumni]   = useState([]);
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/alumni'),
      axios.get('/api/IdApplication'),
    ])
      .then(([alumniRes, appsRes]) => {
        setAlumni(alumniRes.data);
        setApps(appsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const counts = {
    totalAlumni:       alumni.length,
    pending:           apps.filter(a => a.status === 'pending').length,
    approvedThisMonth: apps.filter(a => {
      if (a.status !== 'approved') return false;
      const d = new Date(a.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    totalApps: apps.length,
  };

  const recentApps = apps.slice(0, 5);

  const STAT_CARDS = [
    { label: 'Total Alumni',         value: counts.totalAlumni,       icon: 'bi-people-fill',       bg: '#2563eb' },
    { label: 'Pending Applications', value: counts.pending,           icon: 'bi-clock-fill',        bg: '#d97706' },
    { label: 'Approved This Month',  value: counts.approvedThisMonth, icon: 'bi-check-circle-fill', bg: '#16a34a' },
    { label: 'Total Applications',   value: counts.totalApps,         icon: 'bi-file-earmark-fill', bg: '#9333ea' },
  ];

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Dashboard</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Alumni Relations Office - Application Review System
      </p>

      <div className="row g-4 mb-4">
        {STAT_CARDS.map(card => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">Recent Applications</h6>

          {loading ? (
            <div className="text-center py-4 text-muted small">Loading...</div>
          ) : recentApps.length === 0 ? (
            <div className="text-center py-4 text-muted small">No applications yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Name', 'Program', 'Date', 'Status'].map(h => (
                      <th key={h} className="fw-semibold text-dark border-top-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map(app => (
                    <tr key={app._id}>
                      <td className="text-primary fw-medium">
                        {[app.firstName, app.lastName].filter(Boolean).join(' ') || app.userId?.name || '—'}
                      </td>
                      <td>{app.course || '—'}</td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
