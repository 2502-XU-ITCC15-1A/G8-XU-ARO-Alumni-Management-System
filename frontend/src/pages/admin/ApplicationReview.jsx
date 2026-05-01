import { useEffect, useState } from 'react';
import axios from 'axios';

function StatusBadge({ status }) {
  const labelMap = {
    pending: "Pending",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    payment_pending: "Payment Pending",
  };

  return (
    <span className={`status-badge status-${status}`}>
      {labelMap[status] || status}
    </span>
  );
}

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : '—';
}

export default function ApplicationReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('/api/IdApplication')
      .then(res => setApps(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await axios.put(`/api/IdApplication/${id}`, { status });
      setApps(prev => prev.map(a => a._id === id ? res.data : a));
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const counts = {
    total:    apps.length,
    pending:  apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const STAT_CARDS = [
    { label: 'Total Applications', value: counts.total,    cls: 'app-stat-plain',    valClass: 'text-dark'    },
    { label: 'Pending',            value: counts.pending,  cls: 'app-stat-pending',  valClass: 'text-warning' },
    { label: 'Approved',           value: counts.approved, cls: 'app-stat-approved', valClass: 'text-success' },
    { label: 'Rejected',           value: counts.rejected, cls: 'app-stat-rejected', valClass: 'text-danger'  },
  ];

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Application Review</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Verify alumni information and approve or reject ID applications
      </p>

      {/* Mini-stat cards */}
      <div className="row g-3 mb-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="col-6 col-xl-3">
            <div className={`app-stat-card ${card.cls}`}>
              <div className={`small mb-1 ${card.valClass}`}>{card.label}</div>
              <div className={`fw-bold fs-4 ${card.valClass}`}>
                {loading ? '—' : card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3 px-4 d-flex align-items-center gap-2">
          <i className="bi bi-funnel text-muted" />
          <span className="fw-medium small">Status:</span>
          <select
            className="form-select form-select-sm w-auto"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">Applications ({filtered.length})</h6>

          {loading ? (
            <div className="text-center py-4 text-muted small">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted small">No applications found.</div>
          ) : (
            <div className="table-responsive">
            <table className="table mb-0" style={{ fontSize: 14 }}>
              <thead>
                <tr>
                  {['Name', 'Program', 'Applied Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="fw-semibold text-dark border-top-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app._id}>
                    <td className="text-primary fw-medium">{app.userId?.name || '—'}</td>
                    <td>{app.course || '—'}</td>
                    <td>{formatDate(app.createdAt)}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <button className="action-btn text-primary" onClick={() => setSelected(app)}>
                        <i className="bi bi-eye fs-6" />
                      </button>
                      {(app.status === 'pending' || app.status === 'under_review') && (
                        <>
                          <button className="action-btn text-success" title="Approve" onClick={() => handleAction(app._id, 'approved')}>
                            <i className="bi bi-check-lg fs-6" />
                          </button>
                          <button className="action-btn text-danger" title="Reject" onClick={() => handleAction(app._id, 'rejected')}>
                            <i className="bi bi-x-lg fs-6" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {/* Verify Modal */}
      {selected && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 620 }}>
              <div className="modal-content border-0 rounded-3 overflow-hidden">
                <div className="modal-header-dark">
                  <div>
                    <h5 className="text-white fw-bold mb-1">Verify Alumni Information</h5>
                    <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      Review the details before approving or rejecting
                    </p>
                  </div>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {[
                      ['Full Name',        selected.userId?.name    || '—'],
                      ['Email',            selected.userId?.email   || '—'],
                      ['Student Number',   selected.universityIdNumber || '—'],
                      ['Program',          selected.course          || '—'],
                      ['Home Address',     selected.homeAddress     || '—'],
                      ['Application Date', formatDate(selected.createdAt)],
                      ['Current Status',   <StatusBadge status={selected.status} />],
                      ['Remarks',          selected.remarks         || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="col-6">
                        <div className="fw-semibold text-dark small mb-1">{label}</div>
                        <div className={typeof value !== 'object' ? 'text-primary' : ''} style={{ fontSize: 14 }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer bg-light border-top flex-column align-items-stretch gap-2">
                  <p className="text-muted small mb-0">
                    Approving or rejecting will send an email notification to the applicant.
                  </p>
                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
                      Close
                    </button>
                    {(selected.status === 'pending' || selected.status === 'under_review') && (
                      <>
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleAction(selected._id, 'rejected')}
                        >
                          <i className="bi bi-x-lg" /> Reject &amp; Notify
                        </button>
                        <button
                          className="btn btn-approve btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleAction(selected._id, 'approved')}
                        >
                          <i className="bi bi-check-lg" /> Approve &amp; Notify
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
