import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const GRAD_LEVELS = [
  { key: 'gradGradeSchool', label: 'Grade School' },
  { key: 'gradJHS',         label: 'JHS' },
  { key: 'gradSHS',         label: 'SHS' },
  { key: 'gradCollege',     label: 'College' },
  { key: 'gradPostGrad',    label: 'Post Graduate' },
];

function PaymentStatus({ app }) {
  if (app.status === 'released') {
    return (
      <div className="alert alert-success d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13 }}>
        <i className="bi bi-bag-check-fill fs-5" />
        <div><strong>ID Released.</strong> This alumni ID has been released to the applicant.</div>
      </div>
    );
  }
  if (app.status === 'printing') {
    return (
      <div className="alert d-flex align-items-center gap-2 mb-4" style={{ background: '#ede9fe', border: '1px solid #c4b5fd', fontSize: 13 }}>
        <i className="bi bi-printer-fill fs-5" style={{ color: '#7c3aed' }} />
        <div><strong>In Printing.</strong> This alumni ID is currently being printed.</div>
      </div>
    );
  }
  if (!app.receiptImage) {
    return (
      <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13 }}>
        <i className="bi bi-pause-circle-fill fs-5" />
        <div>
          <strong>On Hold.</strong> No payment receipt uploaded yet.
          ID printing is on hold until payment is confirmed.
        </div>
      </div>
    );
  }
  if (!app.paymentVerified) {
    return (
      <div className="alert alert-info d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13 }}>
        <i className="bi bi-clock-fill fs-5" />
        <div><strong>Receipt Uploaded.</strong> Payment is awaiting verification by Book Center staff.</div>
      </div>
    );
  }
  return (
    <div className="alert alert-success d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13 }}>
      <i className="bi bi-check-circle-fill fs-5" />
      <div><strong>Payment Verified.</strong> Ready to process ID printing.</div>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const [app, setApp]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchApp = () => {
    setLoading(true);
    axios.get(`/api/IdApplication/${id}`)
      .then(r => setApp(r.data))
      .catch(() => navigate('/external-portal/applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApp(); }, [id]);

  const handleAction = async (newStatus) => {
    setActing(true);
    try {
      const res = await axios.put(`/api/IdApplication/${id}`, { status: newStatus });
      setApp(res.data);
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return (
    <div className="p-4 text-muted">Loading…</div>
  );
  if (!app) return null;

  const canProcess = app.paymentVerified && app.status === 'approved';
  const canRelease = app.status === 'printing';
  const isReleased = app.status === 'released';

  const f = (v) => v || '';

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-1">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => navigate('/external-portal/applications')}
        >
          <i className="bi bi-arrow-left me-1" />Back
        </button>
        <h4 className="page-title mb-0">Application Detail</h4>
      </div>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>
        {app.userId?.name || '—'} · ID {app.universityIdNumber || '—'}
      </p>

      <PaymentStatus app={app} />

      {/* ── XU FORM ── */}
      <div className="card border-0 shadow-sm mb-4">
        {/* Form header */}
        <div className="card-body border-bottom pb-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#1e2d5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className="bi bi-shield-fill-check" style={{ fontSize: 24, color: '#c9a030' }} />
            </div>
            <div>
              <div className="fw-bold" style={{ fontSize: 16 }}>Xavier University</div>
              <div className="text-muted" style={{ fontSize: 11 }}>ATENEO DE CAGAYAN</div>
              <div className="text-muted" style={{ fontSize: 10 }}>In Consortium with Ateneo de Davao University and Ateneo de Zamboanga University</div>
              <div className="fw-semibold" style={{ fontSize: 11, color: '#1e2d5e' }}>ALUMNI RELATIONS OFFICE</div>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Row 1: Name */}
          <div className="xu-form-section mb-3">
            <div className="row g-0">
              <div className="col-4 xu-cell">
                <div className="xu-label">LAST NAME</div>
                <div className="xu-value">{f(app.lastName)}</div>
              </div>
              <div className="col-4 xu-cell xu-cell-border-x">
                <div className="xu-label">FIRST NAME</div>
                <div className="xu-value">{f(app.firstName)}</div>
              </div>
              <div className="col-4 xu-cell">
                <div className="xu-label">MIDDLE NAME</div>
                <div className="xu-value">{f(app.middleName)}</div>
              </div>
            </div>
          </div>

          {/* Row 2: Graduation years */}
          <div className="xu-form-section mb-3">
            <div className="xu-section-title">YEAR OF GRADUATION AT XAVIER UNIVERSITY</div>
            <div className="row g-0">
              {GRAD_LEVELS.map((l, i) => (
                <div key={l.key} className={`col xu-cell ${i > 0 ? 'xu-cell-border-l' : ''}`}>
                  <div className="xu-label">{l.label.toUpperCase()}</div>
                  <div className="xu-value">{f(app[l.key])}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Course */}
          <div className="xu-form-section mb-3">
            <div className="xu-cell">
              <div className="xu-label">COURSE</div>
              <div className="xu-value">{f(app.course)}</div>
            </div>
          </div>

          {/* Row 4: Home Address */}
          <div className="xu-form-section mb-3">
            <div className="xu-cell">
              <div className="xu-label">HOME ADDRESS</div>
              <div className="xu-value">{f(app.homeAddress)}</div>
            </div>
          </div>

          {/* Row 5: ID Number / Valid Until / Verified By */}
          <div className="xu-form-section mb-3">
            <div className="row g-0">
              <div className="col-5 xu-cell">
                <div className="xu-label">UNIVERSITY ID NUMBER</div>
                <div className="xu-value">{f(app.universityIdNumber)}</div>
              </div>
              <div className="col-3 xu-cell xu-cell-border-x">
                <div className="xu-label">VALID UNTIL</div>
                <div className="xu-value">
                  {app.validUntil ? new Date(app.validUntil).toLocaleDateString() : ''}
                </div>
              </div>
              <div className="col-4 xu-cell">
                <div className="xu-label">VERIFIED BY</div>
                <div className="xu-value">{f(app.verifiedBy)}</div>
              </div>
            </div>
          </div>

          {/* Row 6: Blood Type / Signature */}
          <div className="xu-form-section mb-3">
            <div className="row g-0">
              <div className="col-5 xu-cell">
                <div className="xu-label">BLOOD TYPE</div>
                <div className="xu-value">{f(app.bloodType)}</div>
              </div>
              <div className="col-7 xu-cell xu-cell-border-l">
                <div className="xu-label">SIGNATURE</div>
                <div className="xu-value" style={{ fontFamily: 'cursive', fontSize: 15 }}>
                  {f(app.signature)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment info footer */}
          <div className="xu-form-section xu-payment-info">
            <div className="xu-label mb-1">Please pay at the finance office</div>
            <div style={{ fontSize: 12, color: '#374151' }}>
              5106-9112 &nbsp; Php 50.00<br />
              5101-9114 &nbsp; Php 100.00<br />
              Bookstore &nbsp; Php 100.00
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="d-flex gap-2 justify-content-end">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/external-portal/applications')}
        >
          Return
        </button>

        {canProcess && (
          <button
            className="btn btn-sm btn-approve"
            disabled={acting}
            onClick={() => handleAction('printing')}
          >
            <i className="bi bi-printer me-1" />
            {acting ? 'Processing…' : 'Process ID Printing'}
          </button>
        )}

        {canRelease && (
          <button
            className="btn btn-sm btn-success"
            disabled={acting}
            onClick={() => handleAction('released')}
          >
            <i className="bi bi-bag-check me-1" />
            {acting ? 'Releasing…' : 'Release ID'}
          </button>
        )}

        {isReleased && (
          <span className="d-flex align-items-center gap-1 text-success fw-semibold" style={{ fontSize: 13 }}>
            <i className="bi bi-check-circle-fill" /> ID Released
          </span>
        )}

        {!app.receiptImage && app.status === 'approved' && (
          <span className="d-flex align-items-center gap-1 text-warning fw-semibold" style={{ fontSize: 13 }}>
            <i className="bi bi-pause-circle-fill" /> On Hold — Awaiting Payment
          </span>
        )}
      </div>
    </div>
  );
}
