import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FILTER_OPTIONS = [
  { value: 'all',      label: 'All' },
  { value: 'on_hold',  label: 'On Hold' },
  { value: 'unverified', label: 'Receipt Uploaded' },
  { value: 'verified', label: 'Payment Verified' },
  { value: 'printing', label: 'In Printing' },
  { value: 'released', label: 'Released' },
];

function paymentBadge(app) {
  if (app.status === 'released')                                return { text: 'Released',          cls: 'status-released' };
  if (app.status === 'printing')                                return { text: 'In Printing',        cls: 'status-printing' };
  if (app.status === 'payment')   return { text: 'Receipt Uploaded',     cls: 'status-under_review' }; 
  if (!app.receiptImage)                                        return { text: 'On Hold',            cls: 'status-pending' };
  if (app.receiptImage && !app.paymentVerified)                 return { text: 'Receipt Uploaded',   cls: 'status-under_review' };
  return                                                               { text: 'Payment Verified',   cls: 'status-approved' };
}

function appFilter(app, filter) {
  if (filter === 'all')        return true;
  if (filter === 'on_hold')    return app.status === 'approved';
  if (filter === 'unverified') return app.status === 'payment';     
  if (filter === 'verified')   return app.status === 'printing';    
  if (filter === 'printing')   return app.status === 'printing';
  if (filter === 'released')   return app.status === 'released';
  return true;
}

export default function ApprovedApplications() {
  const [apps, setApps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [receiptApp, setReceiptApp] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const receiptModalRef           = useRef(null);
  const navigate                  = useNavigate();

  const fetchApps = () => {
    setLoading(true);
    axios.get('/api/IdApplication')
      .then(r => setApps(r.data.filter(a => ['approved','payment','printing','released'].includes(a.status))))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  useEffect(() => {
    if (receiptApp && receiptModalRef.current) {
      const m = new window.bootstrap.Modal(receiptModalRef.current);
      m.show();
      receiptModalRef.current.addEventListener('hidden.bs.modal', () => setReceiptApp(null), { once: true });
    }
  }, [receiptApp]);

  const handleVerifyPayment = async () => {
    if (!receiptApp) return;
    setVerifying(true);
    try {
      await axios.put(`/api/IdApplication/${receiptApp._id}`, { paymentVerified: true, status: 'printing' });
      fetchApps();
      window.bootstrap.Modal.getInstance(receiptModalRef.current)?.hide();
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
  on_hold:    apps.filter(a => a.status === 'approved').length,
  unverified: apps.filter(a => a.status === 'payment').length,    
  verified:   apps.filter(a => a.status === 'printing').length,   
  printing:   apps.filter(a => a.status === 'printing').length,
  released:   apps.filter(a => a.status === 'released').length,
};

  return (
    <div className="p-4">
      <h4 className="page-title">Approved Applications</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        Alumni ID applications approved by XU-ARO — verify payment before processing
      </p>

      {/* Mini stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total',            value: counts.all,        cls: 'app-stat-plain' },
          { label: 'On Hold',          value: counts.on_hold,    cls: 'app-stat-pending' },
          { label: 'Pending Verification', value: counts.unverified, cls: 'app-stat-plain' },
          { label: 'Payment Verified', value: counts.verified,   cls: 'app-stat-approved' },
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
                <th style={{ fontSize: 12 }}>APPLICANT</th>
                <th style={{ fontSize: 12 }}>ID NUMBER</th>
                <th style={{ fontSize: 12 }}>COURSE</th>
                <th style={{ fontSize: 12 }}>DATE APPLIED</th>
                <th style={{ fontSize: 12 }}>PAYMENT STATUS</th>
                <th style={{ fontSize: 12 }}>ACTIONS</th>
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
                    <td className="d-flex gap-2 flex-wrap py-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      style={{ fontSize: 12 }}
                      onClick={() => navigate(`/external-portal/applications/${app._id}`)}
                    >
                      <i className="bi bi-eye me-1" />View
                    </button>
                    {app.status === 'approved' && (
                      <span className="text-muted" style={{ fontSize: 11, alignSelf: 'center' }}>
                        <i className="bi bi-pause-circle me-1" />On Hold
                      </span>
                    )}
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt verification modal */}
      <div className="modal fade" ref={receiptModalRef} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {receiptApp && (
              <>
                <div className="modal-header modal-header-dark text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-receipt me-2" />Verify Payment
                  </h5>
                  <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 13, color: '#374151' }}>
                    Applicant: <strong>{receiptApp.userId?.name}</strong>
                  </p>
                  {receiptApp.receiptImage ? (
                    <div className="text-center border rounded p-3 bg-light">
                      <img
                        src={`http://localhost:5000/${receiptApp.receiptImage.replace(/\\/g, '/')}`}
                        alt="Payment Receipt"
                        className="img-fluid rounded"
                        style={{ maxHeight: 340, objectFit: 'contain' }}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                      <div style={{ display: 'none', color: '#9ca3af', fontSize: 13 }}>
                        <i className="bi bi-image me-1" />Unable to load receipt image
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-warning">No receipt image on file.</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  {receiptApp.receiptImage && (
                    <button
                      type="button"
                      className="btn btn-sm btn-approve"
                      disabled={verifying}
                      onClick={handleVerifyPayment}
                    >
                      <i className="bi bi-check-lg me-1" />
                      {verifying ? 'Verifying…' : 'Confirm Payment Verified'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
