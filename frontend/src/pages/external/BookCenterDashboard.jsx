import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BookCenterDashboard() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    axios.get('/api/IdApplication')
      .then(r => setApps(r.data.filter(a => ['approved','printing','released'].includes(a.status))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onHold    = apps.filter(a => a.status === 'approved' && !a.receiptImage).length;
  const awaitVerif = apps.filter(a => a.status === 'approved' && a.receiptImage && !a.paymentVerified).length;
  const readyToPrint = apps.filter(a => a.status === 'approved' && a.paymentVerified).length;
  const printing  = apps.filter(a => a.status === 'printing').length;
  const released  = apps.filter(a => a.status === 'released').length;

  const stats = [
    { label: 'Total Applications', value: apps.length,     icon: 'bi-files',                color: '#1e2d5e' },
    { label: 'On Hold',            value: onHold,          icon: 'bi-pause-circle-fill',     color: '#d97706' },
    { label: 'Pending Verification', value: awaitVerif,    icon: 'bi-clock-fill',            color: '#2563eb' },
    { label: 'Ready to Print',     value: readyToPrint,    icon: 'bi-printer-fill',          color: '#7b6b24' },
    { label: 'In Printing',        value: printing,        icon: 'bi-credit-card-2-front-fill', color: '#7c3aed' },
    { label: 'Released',           value: released,        icon: 'bi-bag-check-fill',        color: '#059669' },
  ];

  const recent = apps.slice(0, 8);

  const paymentBadge = (app) => {
    if (app.status === 'printing')  return { text: 'In Printing', cls: 'status-printing' };
    if (app.status === 'released')  return { text: 'Released',    cls: 'status-released' };
    if (!app.receiptImage)          return { text: 'On Hold',     cls: 'status-pending' };
    if (!app.paymentVerified)       return { text: 'Unverified',  cls: 'status-under_review' };
    return                                 { text: 'Verified',    cls: 'status-approved' };
  };

  return (
    <div className="p-4">
      <h4 className="page-title">Book Center Dashboard</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        Overview of alumni ID applications and payment processing
      </p>

      <div className="row g-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="col-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ backgroundColor: s.color }}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div>
                  <div className="fw-bold fs-5">
                    {loading ? <span className="placeholder col-3 bg-secondary" /> : s.value}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
          <h6 className="mb-0 fw-semibold">Recent Applications</h6>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: 12 }}
            onClick={() => navigate('/external-portal/applications')}
          >
            View All
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: 12 }}>APPLICANT</th>
                <th style={{ fontSize: 12 }}>ID NUMBER</th>
                <th style={{ fontSize: 12 }}>COURSE</th>
                <th style={{ fontSize: 12 }}>APPLIED</th>
                <th style={{ fontSize: 12 }}>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-4 text-muted">Loading…</td></tr>
              )}
              {!loading && recent.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-muted">No approved applications yet.</td></tr>
              )}
              {recent.map(app => {
                const b = paymentBadge(app);
                return (
                  <tr
                    key={app._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/external-portal/applications/${app._id}`)}
                  >
                    <td>
                      <div className="fw-semibold" style={{ fontSize: 13 }}>{app.userId?.name || '—'}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{app.userId?.email || ''}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{app.universityIdNumber || '—'}</td>
                    <td style={{ fontSize: 13 }}>{app.course || '—'}</td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td><span className={`status-badge ${b.cls}`}>{b.text}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
