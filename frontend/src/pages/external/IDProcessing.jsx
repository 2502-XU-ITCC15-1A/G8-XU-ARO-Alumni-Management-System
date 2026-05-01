import { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_CONFIG = {
  payment_pending: { text: 'Pending Verification', cls: 'status-payment_pending', icon: 'bi-clock-fill' },
  payment:         { text: 'Pending Verification', cls: 'status-payment_pending', icon: 'bi-clock-fill' },
  printing:        { text: 'In Printing',          cls: 'status-printing',        icon: 'bi-printer-fill' },
  released:        { text: 'Released',             cls: 'status-released',        icon: 'bi-bag-check-fill' },
};

function IDInfoModal({ app, onClose, onAction, acting }) {
  if (!app) return null;
  const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.printing;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1050 }}
      />

      {/* Modal container */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1055,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%', maxWidth: 520,
            maxHeight: '92vh', overflowY: 'auto',
            borderRadius: 14, backgroundColor: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            pointerEvents: 'all',
          }}
        >
          {/* Modal header */}
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3"
            style={{ backgroundColor: '#1e2d5e', borderRadius: '14px 14px 0 0' }}
          >
            <span className="fw-semibold text-white" style={{ fontSize: 15 }}>
              <i className="bi bi-credit-card-2-front me-2" />Alumni ID Information
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* ── ID Card ── */}
          <div style={{ padding: '1.25rem 1.25rem 0' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e2d5e 0%, #0f1e48 100%)',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(30,45,94,0.25)',
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(201,160,48,0.15)', border: '1px solid rgba(201,160,48,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className="bi bi-shield-fill-check" style={{ fontSize: 20, color: '#c9a030' }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                    Xavier University – Ateneo de Cagayan
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
                    Alumni Relations Office
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>ALUMNI</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#c9a030', letterSpacing: 1 }}>ID CARD</div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ display: 'flex', gap: 16, padding: '16px 18px' }}>
                {/* Alumni photo */}
                <div style={{
                  width: 76, height: 92, flexShrink: 0,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {app.alumniPhoto
                    ? <img src={`/${app.alumniPhoto.replace(/\\/g, '/')}`} alt="Alumni" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="bi bi-person-fill" style={{ fontSize: 38, color: 'rgba(255,255,255,0.3)' }} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>
                    {app.userId?.name || '—'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                    {[
                      { label: 'Course',     value: app.course || '—' },
                      { label: 'Blood Type', value: app.bloodType || '—' },
                      { label: 'ID Number',  value: app.universityIdNumber || '—' },
                      { label: 'Valid Until', value: app.validUntil ? new Date(app.validUntil).toLocaleDateString() : 'Pending Release' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 8, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signature + footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 18px 14px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Signature</div>
                  {app.signature?.startsWith('data:')
                    ? <img src={app.signature} alt="Signature" style={{ height: 32, maxWidth: 120, objectFit: 'contain', filter: 'invert(1) brightness(0.8)' }} />
                    : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>—</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>Alumni Relations Office</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{app.userId?.email || ''}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Details section ── */}
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', fontSize: 13, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Home Address</div>
                <div style={{ color: '#111827', lineHeight: 1.4 }}>{app.homeAddress || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Processing Status</div>
                <span className={`status-badge ${sc.cls}`}>
                  <i className={`bi ${sc.icon} me-1`} />{sc.text}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Date Applied</div>
                <div style={{ color: '#111827' }}>{new Date(app.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Payment Verified</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: app.paymentVerified ? '#166534' : '#92400e' }}>
                  <i className={`bi ${app.paymentVerified ? 'bi-check-circle-fill' : 'bi-clock-fill'} me-1`} />
                  {app.paymentVerified ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Payment receipt */}
            {app.receiptImage && (
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Payment Receipt
                  {app.paymentVerified && (
                    <span className="status-badge status-approved ms-2" style={{ fontSize: 10, padding: '2px 8px' }}>Verified</span>
                  )}
                </div>
                <img
                  src={`/${app.receiptImage.replace(/\\/g, '/')}`}
                  alt="Payment Receipt"
                  style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
              </div>
            )}
          </div>

          {/* ── Footer actions ── */}
          <div
            className="d-flex justify-content-end gap-2 px-4 py-3"
            style={{ borderTop: '1px solid #f3f4f6' }}
          >
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
            {(app.status === 'payment' || app.status === 'payment_pending') && (
              <button className="btn btn-sm btn-approve" disabled={acting} onClick={() => onAction(app, 'printing')}>
                <i className="bi bi-printer me-1" />{acting ? 'Processing…' : 'Verify & Process Printing'}
              </button>
            )}
            {app.status === 'printing' && (
              <button className="btn btn-sm btn-success" disabled={acting} onClick={() => onAction(app, 'released')}>
                <i className="bi bi-bag-check me-1" />{acting ? 'Releasing…' : 'Release ID'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function IDProcessing() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const [acting, setActing]     = useState(false);

  const fetchApps = () => {
    setLoading(true);
    axios.get('/api/IdApplication')
      .then(r => {
        const relevant = r.data.filter(a =>
          a.status === 'payment_pending' ||
          a.status === 'payment' ||
          a.status === 'printing' ||
          a.status === 'released'
        );
        setApps(relevant);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const handleAction = async (app, newStatus) => {
    setActing(true);
    try {
      await axios.put(`/api/IdApplication/${app._id}`, { status: newStatus });
      setSelected(null);
      fetchApps();
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const filtered = filter === 'all'
    ? apps
    : apps.filter(a => filter === 'pending'
        ? (a.status === 'payment_pending' || a.status === 'payment')
        : a.status === filter);

  const pendingCount  = apps.filter(a => a.status === 'payment_pending' || a.status === 'payment').length;
  const printingCount = apps.filter(a => a.status === 'printing').length;
  const releasedCount = apps.filter(a => a.status === 'released').length;

  return (
    <div className="p-4">
      <h4 className="page-title">ID Processing</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        Process printing and release alumni IDs for payment-verified applications
      </p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending Verification', value: pendingCount,  cls: 'app-stat-pending'  },
          { label: 'In Printing',          value: printingCount, cls: 'app-stat-approved' },
          { label: 'Released',             value: releasedCount, cls: 'app-stat-plain'    },
        ].map(s => (
          <div key={s.label} className="col-6 col-xl-4">
            <div className={`app-stat-card ${s.cls}`}>
              <div className="fw-bold fs-4">{loading ? '—' : s.value}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-3 flex-wrap">
          <h6 className="mb-0 fw-semibold flex-grow-1">Processing Queue</h6>
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 180 }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="printing">In Printing</option>
            <option value="released">Released</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {['APPLICANT', 'ID NUMBER', 'COURSE', 'DATE APPLIED', 'PROCESSING STATUS', 'ACTIONS'].map(h => (
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
                const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.printing;
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
                    <td>
                      <span className={`status-badge ${sc.cls}`}>
                        <i className={`bi ${sc.icon} me-1`} />{sc.text}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: 12 }}
                          onClick={() => setSelected(app)}
                        >
                          <i className="bi bi-eye me-1" />ID Info
                        </button>
                        {(app.status === 'payment_pending' || app.status === 'payment') && (
                          <button
                            className="btn btn-sm btn-approve"
                            style={{ fontSize: 12 }}
                            disabled={acting}
                            onClick={() => handleAction(app, 'printing')}
                          >
                            <i className="bi bi-check-circle me-1" />Verify & Print
                          </button>
                        )}
                        {app.status === 'printing' && (
                          <button
                            className="btn btn-sm btn-success"
                            style={{ fontSize: 12 }}
                            disabled={acting}
                            onClick={() => handleAction(app, 'released')}
                          >
                            <i className="bi bi-bag-check me-1" />Release ID
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <IDInfoModal
        app={selected}
        onClose={() => setSelected(null)}
        onAction={handleAction}
        acting={acting}
      />
    </div>
  );
}
