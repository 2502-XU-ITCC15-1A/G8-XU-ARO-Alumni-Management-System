import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const STATUS_STEPS = [
  { key: 'pending',      label: 'Submitted',   icon: 'bi-send-fill',         desc: 'Your application has been submitted for review.' },
  { key: 'under_review', label: 'Under Review', icon: 'bi-search',            desc: 'ARO staff is reviewing your application.' },
  { key: 'approved',     label: 'Approved',     icon: 'bi-check-circle-fill', desc: 'Your application has been approved. Please visit the XU Book Center to pay the ₱150 Alumni ID fee.' },
  { key: 'payment',      label: 'Payment',      icon: 'bi-receipt',           desc: 'Your payment has been confirmed by the Book Center.' },
  { key: 'printing',     label: 'Printing',     icon: 'bi-printer-fill',      desc: 'Your ID card is being printed.' },
  { key: 'released',     label: 'Released',     icon: 'bi-patch-check-fill',  desc: 'Your Alumni ID is ready for pick-up.' },
];

const STEP_KEY_MAP = { payment_pending: 'payment' };

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

function RenewCard({ application, onRenew }) {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <i className="bi bi-patch-check-fill text-success" style={{ fontSize: 32 }} />
          <div>
            <div className="fw-bold">Your Alumni ID has been released!</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              If your ID has expired or you need a replacement, you may apply for a renewal below.
            </div>
          </div>
        </div>
        <button className="btn btn-approve" onClick={() => onRenew(application)}>
          <i className="bi bi-arrow-clockwise me-2" />Renew Alumni ID
        </button>
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
  const isRejected  = application.status === 'rejected';
  const mappedKey   = STEP_KEY_MAP[application.status] || application.status;
  const stepIdx     = STATUS_STEPS.findIndex(s => s.key === mappedKey);

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

function PaymentInstructions({ application }) {
  if (application.paymentVerified && application.status === 'printing') {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 d-flex align-items-center gap-3">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 28 }} />
          <div>
            <div className="fw-bold">Payment Confirmed</div>
            <div className="text-muted" style={{ fontSize: 13 }}>Your payment has been confirmed by the XU Book Center. Your ID card is now being printed.</div>
          </div>
        </div>
      </div>
    );
  }

  if (application.status === 'approved' || application.status === 'payment' || application.status === 'payment_pending') {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-cash-coin text-success" style={{ fontSize: 24 }} />
            <h6 className="fw-bold mb-0">Payment Instructions</h6>
          </div>
          <p className="text-muted mb-3" style={{ fontSize: 13 }}>
            Your application has been approved. To proceed with your Alumni ID card, please follow these steps:
          </p>
          <ol className="mb-0" style={{ fontSize: 13, color: '#374151', paddingLeft: '1.2rem', lineHeight: 2 }}>
            <li>Visit the <strong>XU Book Center</strong> in person.</li>
            <li>Present your name and University ID number to the Book Center staff.</li>
            <li>Pay the Alumni ID fee of <strong>₱150.00</strong>.</li>
            <li>The Book Center will process and print your Alumni ID upon payment confirmation.</li>
          </ol>
        </div>
      </div>
    );
  }

  return null;
}

function PhotoUpload({ label, hint, value, onChange }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const clear = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {value?.preview ? (
        <div className="d-flex align-items-start gap-3">
          <img
            src={value.preview}
            alt="preview"
            style={{ height: 100, maxWidth: 160, objectFit: 'contain', border: '1px solid #d1d5db', borderRadius: 6, background: '#fafafa' }}
          />
          <div>
            <div className="text-success mb-1" style={{ fontSize: 12 }}>
              <i className="bi bi-check-circle me-1" />{value.file.name}
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clear} style={{ fontSize: 12 }}>
              <i className="bi bi-x-circle me-1" />Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed #d1d5db', borderRadius: 6, padding: '20px 16px',
            textAlign: 'center', cursor: 'pointer', background: '#fafafa',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1e2d5e'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
        >
          <i className="bi bi-cloud-upload" style={{ fontSize: 24, color: '#9ca3af' }} />
          <div className="mt-1" style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
          {hint && <div style={{ fontSize: 11, color: '#9ca3af' }}>{hint}</div>}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function ApplicationForm({ profile, education = [], onSubmitted, token, isRenewal }) {

  const collegeRecord = education.find(edu => edu.level === 'College');

  const [form, setForm] = useState({
    ...BLANK_FORM,
    lastName:           profile?.surname || '',
    firstName:          profile?.firstName || '',
    middleName:         profile?.middleName || '',
    bloodType:          profile?.bloodType || '',
    course:             collegeRecord?.degree || '',
    homeAddress: [
      profile?.address?.street,
      profile?.address?.barangay,
      profile?.address?.city,
      profile?.address?.province
    ].filter(Boolean).join(', '),
    universityIdNumber: profile?.universityIdNumber || '',
  });

  const [sigMode,       setSigMode]       = useState('draw');
  const [sigUpload,     setSigUpload]     = useState(null);
  const [photoUpload,   setPhotoUpload]   = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const headers = { Authorization: `Bearer ${token}` };
  const user    = JSON.parse(localStorage.getItem('user') || '{}');

  const f   = (field) => form[field] ?? '';
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const submit = async () => {
    const missing = [];
    if (!form.lastName.trim())            missing.push('Last Name');
    if (!form.firstName.trim())           missing.push('First Name');
    if (!form.course.trim())              missing.push('Degree / Course');
    if (!form.universityIdNumber.trim())  missing.push('XU University ID Number');
    if (missing.length > 0) {
      return alert(`Please fill in the required fields:\n• ${missing.join('\n• ')}`);
    }
    setSubmitting(true);
    try {
      const previousApplicationId = sessionStorage.getItem('previousApplicationId');
      const userId = user.id || user._id;
      const payload = {
        ...form,
        signature: sigMode === 'draw' ? form.signature : '',
        userId,
        isRenewal: isRenewal || false,
        previousApplicationId: previousApplicationId || null,
      };
      const res = await axios.post('/api/IdApplication', payload, { headers });
      const appId = res.data._id;

      if (photoUpload?.file) {
        const fd = new FormData();
        fd.append('photo', photoUpload.file);
        await axios.post(`/api/IdApplication/upload-photo/${appId}`, fd, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
      }

      if (sigMode === 'upload' && sigUpload?.file) {
        const fd = new FormData();
        fd.append('signature', sigUpload.file);
        await axios.post(`/api/IdApplication/upload-id-signature/${appId}`, fd, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
      }

      const finalRes = await axios.get(`/api/IdApplication/${appId}`, { headers });
      onSubmitted(finalRes.data);
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
              <Field label="XU ID Number" required>
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

        <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            ID Photo
          </div>
          <Field label="Upload Your Photo">
            <PhotoUpload
              label="Click to upload a photo for your Alumni ID"
              hint="PNG or JPEG, plain background preferred"
              value={photoUpload}
              onChange={setPhotoUpload}
            />
          </Field>
        </div>

        <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            E-Signature
          </div>

          <div className="d-flex gap-2 mb-3">
            {['draw', 'upload'].map(mode => (
              <button
                key={mode}
                type="button"
                className={`btn btn-sm ${sigMode === mode ? 'btn-approve' : 'btn-outline-secondary'}`}
                style={{ fontSize: 12 }}
                onClick={() => setSigMode(mode)}
              >
                <i className={`bi ${mode === 'draw' ? 'bi-pencil-fill' : 'bi-upload'} me-1`} />
                {mode === 'draw' ? 'Draw Signature' : 'Upload Image'}
              </button>
            ))}
          </div>

          {sigMode === 'draw' ? (
            <Field label="Draw Your Signature">
              <SignaturePad
                value={f('signature')}
                onChange={(data) => setForm(prev => ({ ...prev, signature: data }))}
              />
            </Field>
          ) : (
            <Field label="Upload Signature Image">
              <PhotoUpload
                label="Click to upload your e-signature image"
                hint="PNG or JPEG with transparent or white background"
                value={sigUpload}
                onChange={setSigUpload}
              />
            </Field>
          )}
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-approve px-4"
            onClick={submit}
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
              : <><i className={`bi ${isRenewal ? 'bi-arrow-clockwise' : 'bi-send-fill'} me-2`} />
                {isRenewal ? 'Submit Renewal' : 'Submit Application'}</>}
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
  const [education, setEducation]     = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isRenewing, setIsRenewing]   = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/api/alumni/me', { headers }),
      axios.get('/api/education', { headers }),
      axios.get('/api/IdApplication/my', { headers }),
    ])
      .then(([profileRes, eduRes, appRes]) => {
        setProfile(profileRes.data);
        setEducation(eduRes.data);
        setApplication(appRes.data[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRenew = (oldApplication) => {
    sessionStorage.setItem('previousApplicationId', oldApplication._id);
    setApplication(null);
    setIsRenewing(true);
  };

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
          <PaymentInstructions application={application} />

          {application.status === 'released' && (
            <RenewCard application={application} onRenew={handleRenew} />
          )}

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
        <ApplicationForm
          profile={profile}
          education={education}
          onSubmitted={setApplication}
          token={token}
          isRenewal={isRenewing}
        />      
        )}
    </div>
  );
}