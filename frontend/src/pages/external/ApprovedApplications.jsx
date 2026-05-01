import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FILTER_OPTIONS = [
  { value: 'all',        label: 'All' },
  { value: 'on_hold',    label: 'On Hold' },
  { value: 'unverified', label: 'Receipt Uploaded' },
  { value: 'verified',   label: 'Payment Verified' },
  { value: 'printing',   label: 'In Printing' },
  { value: 'released',   label: 'Released' },
];

function paymentBadge(app) {
  if (app.status === 'released')                                                   return { text: 'Released',        cls: 'status-released' };
  if (app.status === 'printing')                                                   return { text: 'In Printing',     cls: 'status-printing' };
  if (app.status === 'approved' && !app.receiptImage)                             return { text: 'On Hold',         cls: 'status-pending' };
  if (app.status === 'payment' || app.status === 'payment_pending')               return { text: 'Receipt Uploaded', cls: 'status-under_review' };
  if (app.receiptImage && !app.paymentVerified)                                   return { text: 'Receipt Uploaded', cls: 'status-under_review' };
  if (app.paymentVerified)                                                         return { text: 'Payment Verified', cls: 'status-approved' };
  return                                                                                  { text: 'On Hold',         cls: 'status-pending' };
}

function appFilter(app, filter) {
  if (filter === 'all')        return true;
  if (filter === 'on_hold')    return app.status === 'approved' && !app.receiptImage;
  if (filter === 'unverified') return app.status === 'payment' || app.status === 'payment_pending' || (app.receiptImage && !app.paymentVerified);
  if (filter === 'verified')   return app.paymentVerified;
  if (filter === 'printing')   return app.status === 'printing';
  if (filter === 'released')   return app.status === 'released';
  return true;
}

function VerifyModal({ app, onClose, onVerify, verifying }) {
  if (!app) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1055, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}>
        <div style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', borderRadius: 14, backgroundColor: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', pointerEvents: 'all' }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ backgroundColor: '#1e2d5e', borderRadius: '14px 14px 0 0' }}>
            <span className="fw-semibold text-white" style={{ fontSize: 15 }}>
              <i className="bi bi-receipt me-2" />Verify Payment
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer' }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Applicant</div>
              <div className="fw-semibold" style={{ fontSize: 14, color: '#111827' }}>{app.userId?.name || '—'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{app.userId?.email || ''}</div>
            </div>

            {app.receiptImage ? (
              <div className="border rounded overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
                <img
                  src={`/${app.receiptImage.replace(/\\/g, '/')}`}
                  alt="Payment Receipt"
                  style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#9ca3af', fontSize: 13 }}>
                  <i className="bi bi-image me-2" />Unable to load receipt image
                </div>
              </div>
            ) : (
              <div className="alert alert-warning d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                <i className="bi bi-exclamation-triangle-fill" />No receipt image on file.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-end gap-2 px-4 pb-4">
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Cancel</button>
            {app.receiptImage && (
              <button className="btn btn-sm btn-approve" disabled={verifying} onClick={onVerify}>
                <i className="bi bi-check-lg me-1" />
                {verifying ? 'Verifying…' : 'Confirm Payment Verified'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ApprovedApplications() {
  const [apps, setApps]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [receiptApp, setReceiptApp] = useState(null);
  const [verifying, setVerifying]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const navigate                    = useNavigate();

  const fetchApps = () => {
    setLoading(true);
    axios.get('/api/IdApplication')
      .then(r => setApps(r.data.filter(a => ['approved', 'payment', 'payment_pending', 'printing', 'released'].includes(a.status))))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/IdApplication/${confirmDelete._id}`);
      setConfirmDelete(null);
      fetchApps();
    } catch {
      alert('Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!receiptApp) return;
    setVerifying(true);
    try {
      await axios.put(`/api/IdApplication/${receiptApp._id}`, { paymentVerified: true, status: 'printing' });
      setReceiptApp(null);
      fetchApps();
    } catch {
      alert('Failed to verify payment.');
    } finally {
      setVerifying(false);
    }
  };

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      (a.userId?.name || '').toLowerCase().includes(q) ||
      (a.universityIdNumber || '').toLowerCase().includes(q) ||
      (a.course || '').toLowerCase().includes(q);
    return matchSearch && appFilter(a, filter);
  });

  const counts = {
    all:        apps.length,
    on_hold:    apps.filter(a => a.status === 'approved' && !a.receiptImage).length,
    unverified: apps.filter(a => a.status === 'payment' || a.status === 'payment_pending' || (a.receiptImage && !a.paymentVerified)).length,
    verified:   apps.filter(a => a.paymentVerified).length,
    printing:   apps.filter(a => a.status === 'printing').length,
    released:   apps.filter(a => a.status === 'released').length,
  };

  return (
    <div className="p-4">
      <h4 className="page-title">Approved Applications</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        Alumni ID applications approved by XU-ARO — verify payment before processing
      </p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total',                value: counts.all,        cls: 'app-stat-plain' },
          { label: 'On Hold',              value: counts.on_hold,    cls: 'app-stat-pending' },
          { label: 'Pending Verification', value: counts.unverified, cls: 'app-stat-plain' },
          { label: 'Payment Verified',     value: counts.verified,   cls: 'app-stat-approved' },
        ].map(s => (
          <div key={s.label} className="col-6 col-xl-3">
            <div className={`app-stat-card ${s.cls}`}>
              <div className="fw-bold fs-4">{loading ? '—' : s.value}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap align-items-center gap-2">
          <h6 className="mb-0 fw-semibold flex-grow-1">Applications</h6>
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 180 }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}{counts[o.value] !== undefined ? ` (${counts[o.value]})` : ''}
              </option>
            ))}
          </select>
          <input
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
            placeholder="Search name, ID, course…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {['APPLICANT', 'ID NUMBER', 'COURSE', 'DATE APPLIED', 'PAYMENT STATUS', 'ACTIONS'].map(h => (
                  <th key={h} style={{ fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center py-4 text-muted">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-4 text-muted">No records found.</td></tr>
              )}
              {filtered.map(app => {
                const b = paymentBadge(app);
                return (
                  <tr key={app._id}>
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
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: 12 }}
                          onClick={() => navigate(`/external-portal/applications/${app._id}`)}
                          title="View application"
                        >
                          <i className="bi bi-eye me-1" />View
                        </button>
                        {(app.status === 'payment' || app.status === 'payment_pending') && !app.paymentVerified && (
                          <button
                            className="btn btn-sm btn-approve"
                            style={{ fontSize: 12 }}
                            onClick={() => setReceiptApp(app)}
                            title="Verify payment"
                          >
                            <i className="bi bi-receipt me-1" />Verify
                          </button>
                        )}
                        {app.status === 'approved' && !app.receiptImage && (
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            <i className="bi bi-pause-circle me-1" />On Hold
                          </span>
                        )}
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', padding: '4px 6px' }}
                          onClick={() => setConfirmDelete(app)}
                          title="Delete application"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Payment Modal */}
      <VerifyModal
        app={receiptApp}
        onClose={() => setReceiptApp(null)}
        onVerify={handleVerifyPayment}
        verifying={verifying}
      />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1050 }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 1055, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}>
            <div style={{ width: '100%', maxWidth: 400, borderRadius: 14, backgroundColor: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', pointerEvents: 'all', overflow: 'hidden' }}>
              <div className="p-4 text-center">
                <div className="mb-3">
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 40, color: '#ef4444' }} />
                </div>
                <h6 className="fw-bold mb-1">Delete Application?</h6>
                <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                  This will permanently remove the application for <strong>{confirmDelete.userId?.name || confirmDelete.universityIdNumber}</strong>. This action cannot be undone.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary px-4" onClick={() => setConfirmDelete(null)}>Cancel</button>
                  <button className="btn btn-sm btn-danger px-4" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
