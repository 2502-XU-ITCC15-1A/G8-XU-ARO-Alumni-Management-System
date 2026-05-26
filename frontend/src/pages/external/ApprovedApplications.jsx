import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FILTER_OPTIONS = [
  { value: 'all',       label: 'All' },
  { value: 'awaiting',  label: 'Awaiting Payment' },
  { value: 'printing',  label: 'In Printing' },
  { value: 'released',  label: 'Released' },
];

function paymentBadge(app) {
  if (app.status === 'released')                  return { text: 'Released',          cls: 'status-released' };
  if (app.status === 'printing')                  return { text: 'In Printing',       cls: 'status-printing' };
  if (app.paymentVerified)                        return { text: 'Payment Confirmed', cls: 'status-approved' };
  return                                                 { text: 'Awaiting Payment', cls: 'status-pending' };
}

function appFilter(app, filter) {
  if (filter === 'all')      return true;
  if (filter === 'awaiting') return !app.paymentVerified && app.status === 'approved';
  if (filter === 'printing') return app.status === 'printing';
  if (filter === 'released') return app.status === 'released';
  return true;
}

function ConfirmPaymentModal({ app, onClose, onConfirm, confirming }) {
  if (!app) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1055, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}>
        <div style={{ width: '100%', maxWidth: 440, borderRadius: 14, backgroundColor: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', pointerEvents: 'all', overflow: 'hidden' }}>
          <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ backgroundColor: '#1e2d5e', borderRadius: '14px 14px 0 0' }}>
            <span className="fw-semibold text-white" style={{ fontSize: 15 }}>
              <i className="bi bi-cash-coin me-2" />Confirm Payment Received
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer' }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Applicant</div>
              <div className="fw-semibold" style={{ fontSize: 14, color: '#111827' }}>{app.userId?.name || '—'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{app.userId?.email || ''}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>ID No.: {app.universityIdNumber || '—'}</div>
            </div>
            <div className="alert alert-warning d-flex align-items-start gap-2 mb-0" style={{ fontSize: 13 }}>
              <i className="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0" />
              <div>
                Confirm that <strong>{app.userId?.name || 'this alumni'}</strong> has paid the <strong>₱150.00</strong> Alumni ID fee in person.
                This will mark payment as confirmed and immediately start printing.
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 px-4 pb-4">
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-sm btn-approve" disabled={confirming} onClick={onConfirm}>
              <i className="bi bi-check-lg me-1" />
              {confirming ? 'Confirming…' : 'Confirm Payment & Start Printing'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ApprovedApplications() {
  const [apps, setApps]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [confirmApp, setConfirmApp]     = useState(null);
  const [confirming, setConfirming]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const navigate                        = useNavigate();

  const fetchApps = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    axios.get('/api/IdApplication')
      .then(r => {
        const approvedData = r.data.filter(a => 
          ['approved', 'payment_pending', 'printing', 'released'].includes(a.status)
        );
        setApps(approvedData);
      })
      .catch(() => {})
      .finally(() => {
        if (!isSilent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (confirming || deleting || confirmApp || confirmDelete) return;

    const interval = setInterval(() => {
      fetchApps(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [confirming, deleting, confirmApp, confirmDelete]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/IdApplication/${confirmDelete._id}`);
      setConfirmDelete(null);
      fetchApps(true);
    } catch {
      alert('Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirmApp) return;
    setConfirming(true);
    try {
      await axios.put(`/api/bookcenter/${confirmApp._id}/verify-payment`);
      setConfirmApp(null);
      fetchApps(true);
    } catch {
      alert('Failed to confirm payment.');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      (a.userId?.name || '').toLowerCase().includes(q) ||
      (a.universityIdNumber || '').toLowerCase().includes(q);
    return matchSearch && appFilter(a, filter);
  });

  const counts = {
    all:      apps.length,
    awaiting: apps.filter(a => !a.paymentVerified && a.status === 'approved').length,
    printing: apps.filter(a => a.status === 'printing').length,
    released: apps.filter(a => a.status === 'released').length,
  };

  return (
    <div className="p-4">
      <h4 className="page-title">Approved Applications</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        Alumni ID applications approved by XU-ARO — confirm payment when alumni pays at the Book Center
      </p>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total',            value: counts.all,       cls: 'app-stat-plain' },
          { label: 'Awaiting Payment', value: counts.awaiting, cls: 'app-stat-pending' },
          { label: 'In Printing',       value: counts.printing, cls: 'app-stat-plain' },
          { label: 'Released',         value: counts.released, cls: 'app-stat-approved' },
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
            placeholder="Search name, ID....."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {['APPLICANT', 'ID NUMBER', 'DATE APPLIED', 'PAYMENT STATUS', 'ACTIONS'].map(h => (
                  <th key={h} style={{ fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-4 text-muted">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-muted">No records found.</td></tr>
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
                        {app.status === 'approved' && !app.paymentVerified && (
                          <button
                            className="btn btn-sm btn-approve"
                            style={{ fontSize: 12 }}
                            onClick={() => setConfirmApp(app)}
                            title="Confirm payment received"
                          >
                            <i className="bi bi-cash-coin me-1" />Confirm Payment
                          </button>
                        )}
                        {(app.status === 'printing' || app.status === 'released') && (
                          <span style={{ fontSize: 11, color: '#6b7280' }}>
                            <i className="bi bi-check-circle-fill text-success me-1" />Paid
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

      <ConfirmPaymentModal
        app={confirmApp}
        onClose={() => setConfirmApp(null)}
        onConfirm={handleConfirmPayment}
        confirming={confirming}
      />

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