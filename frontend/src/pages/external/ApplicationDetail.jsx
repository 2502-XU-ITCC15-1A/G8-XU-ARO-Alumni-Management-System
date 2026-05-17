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
        <div><strong>In Printing.</strong> Payment confirmed. This alumni ID is currently being printed.</div>
      </div>
    );
  }
  if (app.status === 'approved' && !app.paymentVerified) {
    return (
      <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13 }}>
        <i className="bi bi-pause-circle-fill fs-5" />
        <div>
          <strong>Awaiting Payment.</strong> Alumni has not yet paid at the Book Center.
          ID printing is on hold until payment is received.
        </div>
      </div>
    );
  }
  return null;
}

export default function ApplicationDetail() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const [app, setApp]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchApp = () => {
    setLoading(true);
    axios.get(`/api/IdApplication/${id}`)
      .then(r => setApp(r.data))
      .catch(() => navigate('/external-portal/applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApp(); }, [id]);

  const handleConfirmPayment = async () => {
    setActing(true);
    try {
      const res = await axios.put(`/api/bookcenter/${id}/verify-payment`);
      setApp(res.data);
    } catch {
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const handleRelease = async () => {
    setActing(true);
    try {
      const res = await axios.put(`/api/IdApplication/${id}`, { status: 'released' });
      setApp(res.data);
    } catch {
      alert('Failed to release ID. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(photoFile.type)) return alert('Only JPEG and PNG files are allowed.');
    const fd = new FormData();
    fd.append('photo', photoFile);
    setUploadingPhoto(true);
    try {
      const res = await axios.post(`/api/IdApplication/upload-photo/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApp(res.data);
      setPhotoFile(null);
    } catch {
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDownloadFile = async (url, defaultName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const link = document.createElement('a');
      link.href = url;
      link.download = defaultName;
      link.target = '_blank';
      link.click();
    }
  };

  if (loading) return (
    <div className="p-4 text-muted">Loading…</div>
  );
  if (!app) return null;

  const canConfirmPayment = app.status === 'approved' && !app.paymentVerified;
  const canRelease        = app.status === 'printing';
  const isReleased        = app.status === 'released';

  const f = (v) => v || '';

  const idPhotoSrc = app.idPhoto ? (app.idPhoto.startsWith('http') ? app.idPhoto : `/${app.idPhoto}`) : null;
  const signatureSrc = app.signature ? (app.signature.startsWith('data:') || app.signature.startsWith('http') ? app.signature : `/${app.signature}`) : null;
  const idSafeString = f(app.universityIdNumber).replace(/[^a-zA-Z0-9]/g, '_');

  return (
    <div className="p-4">
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

      <div className="card border-0 shadow-sm mb-4">
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

          <div className="xu-form-section mb-3">
            <div className="xu-cell">
              <div className="xu-label">COURSE</div>
              <div className="xu-value">{f(app.course)}</div>
            </div>
          </div>

          <div className="xu-form-section mb-3">
            <div className="xu-cell">
              <div className="xu-label">HOME ADDRESS</div>
              <div className="xu-value">{f(app.homeAddress)}</div>
            </div>
          </div>

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

          <div className="xu-form-section mb-3">
            <div className="row g-0">
              <div className="col-12 xu-cell">
                <div className="xu-label">BLOOD TYPE</div>
                <div className="xu-value">{f(app.bloodType)}</div>
              </div>
            </div>
          </div>

<div className="xu-form-section mb-3 border-top pt-3">
  <div className="xu-section-title mb-2">ATTACHED APPLICATION DOCUMENTS</div>
  <div className="row">
    <div className="col-md-12 mb-3">
      <div className="p-3 border rounded bg-light text-center">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="xu-label fw-bold mb-0">ALUMNI SIGNATURE</div>
          {signatureSrc && (
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary px-2 py-0" 
              style={{ fontSize: 11 }}
              onClick={() => handleDownloadFile(signatureSrc, `Alumni_Signature_${idSafeString}.png`)}
            >
              <i className="bi bi-download me-1" />Download
            </button>
          )}
        </div>
        {signatureSrc ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height: 180, background: '#fff', borderRadius: 4, border: '1px solid #d1d5db' }}>
            <img 
              src={signatureSrc} 
              alt="Alumni E-Signature" 
              style={{ maxHeight: 140, maxWidth: '90%', objectFit: 'contain' }}
              onError={(e) => { e.target.src = 'https://placehold.co/300x100?text=Signature+Error'; }}
            />
          </div>
        ) : (
          <div className="text-muted py-4" style={{ fontSize: 13 }}>
            <i className="bi bi-pencil me-1" /> No Signature Captured
          </div>
        )}
      </div>
    </div>
  </div>
</div>

          <div className="xu-form-section xu-payment-info">
            <div className="xu-label mb-1">Please pay at the XU Book Center — ₱150.00</div>
          </div>
        </div>
      </div>

{app.status !== 'released' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="fw-semibold mb-1" style={{ fontSize: 14 }}>
              <i className="bi bi-person-bounding-box me-2" />Alumni Photo
              {app.alumniPhoto
                ? <span className="badge bg-success ms-2" style={{ fontSize: 11 }}>Uploaded</span>
                : <span className="badge bg-warning text-dark ms-2" style={{ fontSize: 11 }}>Required for ID</span>
              }
            </div>
            <p className="text-muted mb-3" style={{ fontSize: 13 }}>
              Upload a clear photo of the alumni for their ID card. Use a plain background, face clearly visible.
            </p>

            {app.alumniPhoto && (
              <div className="mb-3 d-flex align-items-center gap-3">
                <img
                  src={`/${app.alumniPhoto.replace(/\\/g, '/')}`}
                  alt="Alumni"
                  style={{ width: 80, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
                <div>
                  <div className="text-success fw-semibold" style={{ fontSize: 13 }}>
                    <span><i className="bi bi-check-circle-fill me-1" />Photo on file</span>
                    <div className="mt-1">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary px-2 py-0" 
                        style={{ fontSize: 11 }}
                        onClick={() => handleDownloadFile(`/${app.alumniPhoto.replace(/\\/g, '/')}`, `Alumni_Photo_${idSafeString}.png`)}
                      >
                        <i className="bi bi-download me-1" />Download Photo
                      </button>
                    </div>
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: 12 }}>Upload a new file to replace it</div>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="form-control"
                style={{ maxWidth: 280, fontSize: 13 }}
                onChange={e => setPhotoFile(e.target.files[0] || null)}
              />
              <button
                className="btn btn-approve btn-sm"
                style={{ fontSize: 13 }}
                disabled={uploadingPhoto || !photoFile}
                onClick={handlePhotoUpload}
              >
                {uploadingPhoto
                  ? <><span className="spinner-border spinner-border-sm me-2" />Uploading…</>
                  : <><i className="bi bi-upload me-1" />{app.alumniPhoto ? 'Replace Photo' : 'Upload Photo'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {app.status === 'released' && app.alumniPhoto && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <img
              src={`/${app.alumniPhoto.replace(/\\/g, '/')}`}
              alt="Alumni"
              style={{ width: 80, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <div>
              <div className="fw-semibold" style={{ fontSize: 14 }}>
                <i className="bi bi-person-bounding-box me-2" />Alumni Photo
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>Photo used for this Alumni ID card.</div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex gap-2 justify-content-end">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/external-portal/applications')}
        >
          Return
        </button>

        {canConfirmPayment && (
          <button
            className="btn btn-sm btn-approve"
            disabled={acting}
            onClick={handleConfirmPayment}
          >
            <i className="bi bi-cash-coin me-1" />
            {acting ? 'Confirming…' : 'Confirm Payment & Start Printing'}
          </button>
        )}

        {canRelease && (
          <button
            className="btn btn-sm btn-success"
            disabled={acting}
            onClick={handleRelease}
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

        {canConfirmPayment && (
          <span className="d-flex align-items-center gap-1 text-warning fw-semibold" style={{ fontSize: 13 }}>
            <i className="bi bi-pause-circle-fill" /> On Hold — Awaiting Payment
          </span>
        )}
      </div>
    </div>
  );
}