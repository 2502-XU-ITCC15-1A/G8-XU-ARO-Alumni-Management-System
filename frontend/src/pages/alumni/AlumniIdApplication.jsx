import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const STATUS_STEPS = [
  { key: 'pending',          label: 'Submitted',      icon: 'bi-send-fill',         desc: 'Your application has been submitted for review.' },
  { key: 'under_review',     label: 'Under Review',   icon: 'bi-search',            desc: 'ARO staff is reviewing your application.' },
  { key: 'approved',         label: 'Approved',        icon: 'bi-check-circle-fill', desc: 'Your application has been approved. Please upload your payment receipt below.' },
  { key: 'payment_pending',  label: 'Payment',         icon: 'bi-receipt',           desc: 'Your payment receipt is awaiting verification by the Book Center.' },
  { key: 'printing',         label: 'Printing',        icon: 'bi-printer-fill',      desc: 'Your ID card is being printed.' },
  { key: 'released',         label: 'Released',        icon: 'bi-patch-check-fill',  desc: 'Your Alumni ID is ready for pick-up.' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BLANK_FORM = {
  lastName: '', firstName: '', middleName: '', bloodType: '',
  gradGradeSchool: '', gradJHS: '', gradSHS: '', gradCollege: '', gradPostGrad: '',
  course: '', homeAddress: '', universityIdNumber: '', signature: '',
};

function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => { e.preventDefault(); drawing.current = true; lastPos.current = getPos(e); };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e2d5e';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div>
      <div style={{ border: '1px solid #d1d5db', borderRadius: 6, background: '#fafafa', cursor: 'crosshair', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          style={{ width: '100%', height: 100, display: 'block' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="d-flex align-items-center gap-2 mt-1">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clear} style={{ fontSize: 12 }}>
          <i className="bi bi-eraser me-1" />Clear
        </button>
        {value && <span className="text-success" style={{ fontSize: 12 }}><i className="bi bi-check-circle me-1" />Signature captured</span>}
        {!value && <span className="text-muted" style={{ fontSize: 12 }}>Draw your signature above using mouse or touch</span>}
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ fontSize: 12, color: '#374151' }}>
        {label}{required && <span className="text-danger ms-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatusTracker({ application }) {
  const isRejected = application.status === 'rejected';
  const stepIdx    = STATUS_STEPS.findIndex(s => s.key === application.status);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h6 className="fw-bold mb-4">Application Status</h6>

        {isRejected ? (
          <div className="rounded p-3 mb-3" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
            <i className="bi bi-x-circle-fill me-2" />
            <strong>Application Rejected</strong>
            {application.remarks && (
              <div className="mt-1" style={{ fontSize: 13 }}>Reason: {application.remarks}</div>
            )}
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-start mb-4" style={{ overflowX: 'auto', gap: 8 }}>
            {STATUS_STEPS.map((step, i) => {
              const done   = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <div key={step.key} className="d-flex flex-column align-items-center" style={{ minWidth: 72, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 8 }}>
                    {i > 0 && (
                      <div style={{ flex: 1, height: 3, backgroundColor: i <= stepIdx ? '#1e2d5e' : '#e5e7eb' }} />
                    )}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{
                        width: 40, height: 40, flexShrink: 0,
                        backgroundColor: active ? '#7b6b24' : done ? '#1e2d5e' : '#e5e7eb',
                        color: done ? '#fff' : '#9ca3af',
                        fontSize: 16,
                        boxShadow: active ? '0 0 0 4px rgba(123,107,36,0.2)' : 'none',
                      }}
                    >
                      <i className={`bi ${done ? step.icon : 'bi-circle'}`} />
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 3, backgroundColor: i < stepIdx ? '#1e2d5e' : '#e5e7eb' }} />
                    )}
                  </div>
                  <div
                    className="text-center"
                    style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: done ? '#1e2d5e' : '#9ca3af', lineHeight: 1.3 }}
                  >
                    {step.label}
                  </div>
                  {active && (
                    <div className="text-center text-muted mt-1" style={{ fontSize: 10 }}>{step.desc}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Application detail summary */}
        <div className="border-top pt-3 mt-2">
          <div className="row g-2" style={{ fontSize: 13 }}>
            <div className="col-6 col-md-3">
              <div className="text-muted" style={{ fontSize: 11 }}>Full Name</div>
              <div className="fw-semibold">{[application.firstName, application.lastName].filter(Boolean).join(' ') || '—'}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted" style={{ fontSize: 11 }}>Course</div>
              <div className="fw-semibold">{application.course || '—'}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted" style={{ fontSize: 11 }}>XU ID Number</div>
              <div className="fw-semibold">{application.universityIdNumber || '—'}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted" style={{ fontSize: 11 }}>Date Applied</div>
              <div className="fw-semibold">{application.createdAt?.slice(0, 10) || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptUpload({ applicationId, application, onUpdated, token }) {
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const upload = async () => {
    if (!file) return alert('Please select a receipt image first.');
    const fd = new FormData();
    fd.append('receipt', file);
    setUploading(true);
    try {
      const res = await axios.post(`/api/IdApplication/upload/${applicationId}`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      onUpdated(res.data);
      setFile(null);
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (application.paymentVerified) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 d-flex align-items-center gap-3">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 28 }} />
          <div>
            <div className="fw-bold">Payment Verified</div>
            <div className="text-muted" style={{ fontSize: 13 }}>Your payment receipt has been verified by the Book Center.</div>
          </div>
        </div>
      </div>
    );
  }

  if (application.status === 'approved') {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-1">Upload Payment Receipt</h6>
          <p className="text-muted mb-3" style={{ fontSize: 13 }}>
            Your application has been approved. Please pay the Alumni ID fee of <strong>₱150</strong> at the Finance Office and upload your payment receipt here to proceed.
          </p>
          {application.receiptImage && (
            <div className="mb-3 rounded p-2" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', fontSize: 13, color: '#166534' }}>
              <i className="bi bi-image me-1" />Receipt already uploaded — upload again to replace it.
            </div>
          )}
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input
              type="file"
              accept="image/*"
              className="form-control"
              style={{ maxWidth: 280, fontSize: 13 }}
              onChange={e => setFile(e.target.files[0])}
            />
            <button
              className="btn btn-approve"
              onClick={upload}
              disabled={uploading || !file}
              style={{ fontSize: 13 }}
            >
              {uploading ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</> : <><i className="bi bi-upload me-1" />Upload Receipt</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ApplicationForm({ profile, onSubmitted, token }) {
  const [form, setForm] = useState({
    ...BLANK_FORM,
    lastName:           profile?.surname            || '',
    firstName:          profile?.firstName          || '',
    middleName:         profile?.middleName         || '',
    bloodType:          profile?.bloodType          || '',
    homeAddress:        [profile?.address?.street, profile?.address?.barangay, profile?.address?.city, profile?.address?.province].filter(Boolean).join(', '),
    universityIdNumber: profile?.universityIdNumber || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };
  const user    = JSON.parse(localStorage.getItem('user') || '{}');

  const f   = (field) => form[field] ?? '';
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const submit = async () => {
    if (!form.lastName || !form.firstName || !form.course) {
      return alert('Last name, first name, and course are required.');
    }
    setSubmitting(true);
    try {
      const payload = { ...form, userId: user.id };
      const res = await axios.post('/api/IdApplication', payload, { headers });
      onSubmitted(res.data);
    } catch {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h6 className="fw-bold mb-1">Alumni ID Application Form</h6>
        <p className="text-muted mb-4" style={{ fontSize: 13 }}>
          Fill in the details below to apply for your Alumni ID card.
        </p>

        {/* Personal Information */}
        <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            Personal Information
          </div>
          <div className="row g-3">
            <div className="col-md-4">
              <Field label="Last Name" required>
                <input className="form-control" style={{ fontSize: 14 }} value={f('lastName')} onChange={set('lastName')} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="First Name" required>
                <input className="form-control" style={{ fontSize: 14 }} value={f('firstName')} onChange={set('firstName')} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Middle Name">
                <input className="form-control" style={{ fontSize: 14 }} value={f('middleName')} onChange={set('middleName')} />
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="Blood Type">
                <select className="form-select" style={{ fontSize: 14 }} value={f('bloodType')} onChange={set('bloodType')}>
                  <option value="">Select...</option>
                  {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
            <div className="col-md-5">
              <Field label="XU University ID Number">
                <input className="form-control" style={{ fontSize: 14 }} value={f('universityIdNumber')} onChange={set('universityIdNumber')} placeholder="e.g. 2019-XXXXX" />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Degree / Course" required>
                <input className="form-control" style={{ fontSize: 14 }} value={f('course')} onChange={set('course')} placeholder="e.g. BS Computer Science" />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Home Address">
                <input className="form-control" style={{ fontSize: 14 }} value={f('homeAddress')} onChange={set('homeAddress')} />
              </Field>
            </div>
          </div>
        </div>

        {/* Graduation Years */}
        <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            Year of Graduation
          </div>
          <div className="row g-3">
            {[
              { field: 'gradGradeSchool', label: 'Grade School' },
              { field: 'gradJHS',         label: 'Junior High School' },
              { field: 'gradSHS',         label: 'Senior High School' },
              { field: 'gradCollege',     label: 'College' },
              { field: 'gradPostGrad',    label: 'Post-Graduate' },
            ].map(({ field, label }) => (
              <div key={field} className="col-6 col-md">
                <Field label={label}>
                  <input
                    className="form-control"
                    style={{ fontSize: 14 }}
                    value={f(field)}
                    onChange={set(field)}
                    placeholder="YYYY"
                    maxLength={4}
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            Signature
          </div>
          <Field label="Draw Your Signature">
            <SignaturePad
              value={f('signature')}
              onChange={(data) => setForm(prev => ({ ...prev, signature: data }))}
            />
          </Field>
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-approve px-4"
            onClick={submit}
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
              : <><i className="bi bi-send-fill me-2" />Submit Application</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function AlumniIdApplication() {
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [profile, setProfile]         = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/alumni/me', { headers }),
      axios.get('/api/IdApplication/my', { headers }),
    ])
      .then(([profileRes, appRes]) => {
        setProfile(profileRes.data);
        setApplication(appRes.data[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Alumni ID Application</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Apply for your Xavier University Alumni ID card.
      </p>

      {application ? (
        <>
          <StatusTracker application={application} />
          <ReceiptUpload
            applicationId={application._id}
            application={application}
            onUpdated={setApplication}
            token={token}
          />

          {application.status === 'rejected' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-2">Re-apply</h6>
                <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                  Your previous application was rejected. You may contact the Alumni Relations Office for more information, or re-apply by submitting a new application.
                </p>
                <button
                  className="btn btn-approve"
                  onClick={() => setApplication(null)}
                >
                  Submit New Application
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <ApplicationForm profile={profile} onSubmitted={setApplication} token={token} />
      )}
    </div>
  );
}
