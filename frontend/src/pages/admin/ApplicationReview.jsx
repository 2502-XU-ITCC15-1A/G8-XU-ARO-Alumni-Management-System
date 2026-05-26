import { useEffect, useState } from 'react';
import axios from 'axios';

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

export default function ApplicationReview() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks]   = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [universityIdNumber, setUniversityIdNumber] = useState('');
  const [validationError, setValidationError] = useState('');

  const fetchApps = async (isSilent = false) => {
    try {
      const res = await axios.get('/api/IdApplication');
      setApps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (isProcessing || selected) return;

    const interval = setInterval(() => {
      fetchApps(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [isProcessing, selected]);

  const openModal = (app) => {
    setSelected(app);
    setRemarks('');
    setValidationError('');
    setUniversityIdNumber(app.alumniProfile?.universityIdNumber || app.universityIdNumber || '');
  };

  const handleAction = async (id, status) => {
    if (isProcessing) return;

    if (status === 'approved' && !universityIdNumber.trim()) {
      setValidationError('XU University ID Number is required for approval.');
      return;
    }

    setIsProcessing(true);
    setValidationError('');
    try {
      const trimmedId = universityIdNumber.trim();
      const res = await axios.put(`/api/IdApplication/${id}`, { 
        status, 
        remarks,
        universityIdNumber: trimmedId
      });
      
      setApps(prev => prev.map(a => {
        if (a._id === id) {
          return {
            ...a,
            ...res.data,
            universityIdNumber: trimmedId,
            alumniProfile: {
              ...a.alumniProfile,
              ...res.data?.alumniProfile,
              universityIdNumber: trimmedId
            }
          };
        }
        return a;
      }));

      setSelected(null);
      setRemarks('');
      setUniversityIdNumber('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
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
    { label: 'Total Applications', value: counts.total,   cls: 'app-stat-plain',    valClass: 'text-dark'    },
    { label: 'Pending',            value: counts.pending,  cls: 'app-stat-pending',  valClass: 'text-warning' },
    { label: 'Approved',           value: counts.approved, cls: 'app-stat-approved', valClass: 'text-success' },
    { label: 'Rejected',           value: counts.rejected, cls: 'app-stat-rejected', valClass: 'text-danger'  },
  ];

  const getFullName = (app) => {
    if (app.alumniProfile?.firstName || app.alumniProfile?.surname) {
      return `${app.alumniProfile.firstName || ''} ${app.alumniProfile.surname || ''}`.trim();
    }
    return app.userId?.name || '—';
  };

  const getAddress = (app) => {
    const addr = app.alumniProfile?.address;
    if (addr) {
      return [addr.street, addr.city, addr.province, addr.country]
        .filter(Boolean).join(', ') || '—';
    }
    return app.homeAddress || '—';
  };

const formatEducation = (app) => {
  const educationHistory = app?.education || app?.alumniProfile?.education;

  if (!educationHistory?.length) return <div className="text-muted small">—</div>;

  return [...educationHistory]
    .sort((a, b) => (b.yearGraduated || 0) - (a.yearGraduated || 0))
    .map((e, index) => {
      const mainTitle = e.degree || e.level; 
      const subTitle = e.degree ? `${e.level} • Graduated ${e.yearGraduated || '—'}` : (e.yearGraduated ? `Graduated ${e.yearGraduated}` : '');

      return (
        <div key={index} className="mb-2 pb-2 border-bottom border-light style-education-item">
          <div className="fw-semibold text-dark" style={{ fontSize: 14 }}>
            {mainTitle}
          </div>
          {subTitle && (
            <div className="text-muted small mt-0.5" style={{ fontSize: 12 }}>
              {subTitle}
            </div>
          )}
        </div>
      );
    });
};

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Application Review</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Verify alumni information and approve or reject ID applications
      </p>

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

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">Applications ({filtered.length})</h6>
          {loading ? (
            <div className="text-center py-4 text-muted small">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted small">No applications found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ fontSize: 14, tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th className="fw-semibold text-dark border-top-0 ps-2">Name</th>
                  <th className="fw-semibold text-dark border-top-0 text-end">Applied Date</th>
                  <th className="fw-semibold text-dark border-top-0 text-end">Status</th>
                  <th className="fw-semibold text-dark border-top-0 text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app._id}>
                    <td className="text-primary fw-medium ps-2">{getFullName(app)}</td>
                    <td className="text-secondary text-end">{formatDate(app.createdAt)}</td>
                    <td className="text-end"><StatusBadge status={app.status} /></td>
                    <td className="pe-3">
                      <div className="d-flex justify-content-end gap-1">
                        <button className="action-btn text-primary" onClick={() => openModal(app)}>
                          <i className="bi bi-eye fs-6" />
                        </button>
                        {(app.status === 'pending' || app.status === 'under_review') && (
                          <>
                            <button 
                              className="action-btn text-success" 
                              onClick={() => openModal(app)}
                              disabled={isProcessing}
                            >
                              <i className="bi bi-check-lg fs-6" />
                            </button>
                            <button 
                              className="action-btn text-danger" 
                              onClick={() => openModal(app)}
                              disabled={isProcessing}
                            >
                              <i className="bi bi-x-lg fs-6" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
                      ['Full Name',         getFullName(selected)],
                      ['Email',             selected.userId?.email || '—'],
                      ['Program', (
                        <div 
                          className="mt-1 p-3 bg-light border border-light-subtle rounded-3 style-education-container" 
                          style={{ maxHeight: '250px', overflowY: 'auto' }}
                        >
                          {formatEducation(selected)}
                        </div>
                      ), 'full'],
                      ['Home Address',      getAddress(selected)],
                      ['Application Date',  formatDate(selected.createdAt)],
                      ['Current Status',    <StatusBadge status={selected.status} />],
                      ['Remarks',           selected.remarks || '—'],
                    ].map(([label, value, size]) => (
                        <div key={label} className={size === 'full' ? 'col-12' : 'col-6'}>
                        <div className="fw-semibold text-dark small mb-1">{label}</div>
                        <div className={typeof value !== 'object' ? 'text-primary' : ''} style={{ fontSize: 14 }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Required Editable Field for University ID Number */}
                  <div className="mt-4 pt-3 border-top">
                    <label className="form-label fw-semibold small text-dark">
                      XU University ID Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${validationError ? 'is-invalid' : ''}`}
                      style={{ fontSize: 14 }}
                      placeholder="e.g. 2019-XXXXX"
                      value={universityIdNumber}
                      onChange={e => {
                        setUniversityIdNumber(e.target.value);
                        if (e.target.value.trim()) setValidationError('');
                      }}
                      disabled={!(selected.status === 'pending' || selected.status === 'under_review')}
                    />
                    {validationError && (
                      <div className="invalid-feedback small fw-medium mt-1">
                        {validationError}
                      </div>
                    )}
                  </div>

                  {(selected.status === 'pending' || selected.status === 'under_review') && (
                    <div className="mt-3">
                      <label className="form-label fw-semibold small">
                        Remarks <span className="text-muted">(required for rejection, optional for approval)</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        style={{ fontSize: 13 }}
                        placeholder="Add remarks or reason..."
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light border-top flex-column align-items-stretch gap-2">
                  <p className="text-muted small mb-0">
                    Approving or rejecting will send a notification to the applicant.
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
                          disabled={isProcessing || !remarks.trim()}
                        >
                          <i className="bi bi-x-lg" /> {isProcessing ? 'Processing...' : 'Reject & Notify'}
                        </button>
                        <button
                          className="btn btn-approve btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleAction(selected._id, 'approved')}
                          disabled={isProcessing}
                        >
                          <i className="bi bi-check-lg" /> {isProcessing ? 'Processing...' : 'Approve & Notify'}
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