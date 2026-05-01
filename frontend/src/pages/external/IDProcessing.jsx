import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function IDProcessing() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const [acting, setActing]     = useState(false);
  const modalRef = useRef(null);

  const fetchApps = () => {
    setLoading(true);
    axios.get('/api/IdApplication')
      .then(r => {
        const relevant = r.data.filter(a =>
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

  useEffect(() => {
    if (selected && modalRef.current) {
      const bsModal = new window.bootstrap.Modal(modalRef.current);
      bsModal.show();
      modalRef.current.addEventListener('hidden.bs.modal', () => setSelected(null), { once: true });
    }
  }, [selected]);

  const handleStatusUpdate = async (app, newStatus) => {
    setActing(true);
    try {
      await axios.put(`/api/IdApplication/${app._id}`, { status: newStatus });
      fetchApps();
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const statusConfig = {
    payment:  { text: 'Receipt Submitted', cls: 'status-pending',  icon: 'bi-receipt' },
    approved:  { text: 'Ready to Print', cls: 'status-approved', icon: 'bi-check-circle-fill' },
    printing:  { text: 'In Printing',    cls: 'status-printing',  icon: 'bi-printer-fill' },
    released:  { text: 'Released',       cls: 'status-released',  icon: 'bi-bag-check-fill' },
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const pendingPaymentCount = apps.filter(a => a.status === 'payment').length;
  const readyCount = apps.filter(a => a.status === 'printing').length;
  const printingCount = apps.filter(a => a.status === 'printing').length;
  const releasedCount = apps.filter(a => a.status === 'released').length;

  return (
    <div className="p-4">
      <h4 className="page-title">ID Processing</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        Process printing and release alumni IDs for payment-verified applications
      </p>

      {/* Mini stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending Verification', value: pendingPaymentCount, cls: 'app-stat-pending' },
          { label: 'Ready to Print',       value: readyCount,          cls: 'app-stat-approved' },
          { label: 'In Printing',          value: printingCount,       cls: 'app-stat-plain' },
          { label: 'Released',             value: releasedCount,       cls: 'app-stat-plain' },
        ].map(s => (
          <div key={s.label} className="col-6 col-xl-3">
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
            <option value="payment">Pending Verification</option>
            <option value="printing">Ready to Print</option>
            <option value="printing">In Printing</option>
            <option value="released">Released</option>
          </select>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: 12 }}>APPLICANT</th>
                <th style={{ fontSize: 12 }}>ID NUMBER</th>
                <th style={{ fontSize: 12 }}>COURSE</th>
                <th style={{ fontSize: 12 }}>DATE APPLIED</th>
                <th style={{ fontSize: 12 }}>PROCESSING STATUS</th>
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
                const sc = statusConfig[app.status] || statusConfig.approved;
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
                    <td className="d-flex gap-2 flex-wrap py-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: 12 }}
                        onClick={() => setSelected(app)}
                      >
                        <i className="bi bi-eye me-1" />ID Info
                      </button>
                      {app.status === 'payment' && (
                        <button
                          className="btn btn-sm btn-approve"
                          style={{ fontSize: 12 }}
                          disabled={acting}
                          onClick={() => handleStatusUpdate(app, 'printing')}  
                        >
                          <i className="bi bi-check-circle me-1" />Verify & Print
                        </button>
                      )}
                      {app.status === 'printing' && (
                        <button
                          className="btn btn-sm btn-success"
                          style={{ fontSize: 12 }}
                          disabled={acting}
                          onClick={() => handleStatusUpdate(app, 'released')}
                        >
                          <i className="bi bi-bag-check me-1" />Release ID
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID Info modal */}
      <div className="modal fade" ref={modalRef} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {selected && (
              <>
                <div className="modal-header modal-header-dark text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-credit-card-2-front me-2" />Alumni ID Information
                  </h5>
                  <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
                </div>
                <div className="modal-body p-0">
                  {/* ID Card Preview */}
                  <div className="id-card-preview">
                    <div className="id-card-header">
                      <div className="id-card-logo">
                        <i className="bi bi-shield-fill-check" style={{ fontSize: 28, color: '#c9a030' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                          Xavier University – Ateneo de Cagayan
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
                          Alumni ID
                        </div>
                      </div>
                    </div>
                    <div className="id-card-body">
                      <div className="id-card-photo">
                        <i className="bi bi-person-fill" style={{ fontSize: 36, color: '#9ca3af' }} />
                      </div>
                      <div className="id-card-info">
                        <div className="id-card-name">{selected.userId?.name || '—'}</div>
                        <div className="id-card-field">
                          <span className="id-card-label">COURSE</span>
                          <span>{selected.course || '—'}</span>
                        </div>
                        <div className="id-card-field">
                          <span className="id-card-label">ID NUMBER</span>
                          <span className="fw-bold">{selected.universityIdNumber || '—'}</span>
                        </div>
                        <div className="id-card-field">
                          <span className="id-card-label">VALID UNTIL</span>
                          <span>
                            {selected.validUntil
                              ? new Date(selected.validUntil).toLocaleDateString()
                              : 'Pending Release'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="id-card-footer">
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 }}>
                        Alumni Relations Office  ·  {selected.userId?.email || ''}
                      </div>
                    </div>
                  </div>
                  {selected.receiptImage && (
                    <div className="p-3 border-top">
                    <div className="text-muted mb-2" style={{ fontSize: 11 }}>PAYMENT RECEIPT</div>
                    <img
                      src={`/${selected.receiptImage.replace(/\\/g, '/')}`}
                      alt="Payment Receipt"
                      className="img-fluid rounded border"
                      style={{ maxHeight: 200, objectFit: 'contain' }}
                    />
                    </div>
                  )}

                  {/* Raw data for reference */}
                  <div className="p-3">
                    <div className="row g-2" style={{ fontSize: 13 }}>
                      <div className="col-6">
                        <span className="text-muted" style={{ fontSize: 11 }}>HOME ADDRESS</span>
                        <div>{selected.homeAddress || '—'}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted" style={{ fontSize: 11 }}>PROCESSING STATUS</span>
                        <div>
                          {(() => {
                            const sc = statusConfig[selected.status] || statusConfig.approved;
                            return <span className={`status-badge ${sc.cls}`}>{sc.text}</span>;
                          })()}
                        </div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted" style={{ fontSize: 11 }}>BLOOD TYPE</span>
                        <div>{selected.bloodType || '—'}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted" style={{ fontSize: 11 }}>SIGNATURE</span>
                        <div>
                          {selected.signature?.startsWith('data:')
                            ? <img src={selected.signature} alt="Signature" style={{ maxHeight: 40, maxWidth: '100%', objectFit: 'contain' }} />
                            : selected.signature || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                  {selected.status === 'payment' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-approve"
                      disabled={acting}
                      onClick={() => handleStatusUpdate(selected, 'printing')}
                    >
                      <i className="bi bi-printer me-1" />{acting ? 'Processing…' : 'Process Printing'}
                    </button>
                  )}
                  {selected.status === 'printing' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      disabled={acting}
                      onClick={() => handleStatusUpdate(selected, 'released')}
                    >
                      <i className="bi bi-bag-check me-1" />{acting ? 'Releasing…' : 'Release ID'}
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
