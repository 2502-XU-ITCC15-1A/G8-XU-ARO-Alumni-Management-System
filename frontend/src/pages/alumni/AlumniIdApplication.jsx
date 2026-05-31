import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const STATUS_STEPS = [
  { key: 'pending',      label: 'Submitted',   icon: 'bi-send-fill',         desc: 'Your application has been submitted for review.' },
  { key: 'approved',     label: 'Approved',    icon: 'bi-check-circle-fill', desc: 'Your application has been approved. Please visit the XU Book Center to pay the ₱150 Alumni ID fee.' },
  { key: 'payment',      label: 'Payment',      icon: 'bi-receipt',           desc: 'Your payment has been confirmed by the Book Center.' },
  { key: 'printing',     label: 'Printing',    icon: 'bi-printer-fill',      desc: 'Your ID card is being printed.' },
  { key: 'released',     label: 'Released',    icon: 'bi-patch-check-fill',  desc: 'Your Alumni ID is ready for pick-up.' },
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
  const BRUSH_SIZE = 3; 

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => { 
    e.preventDefault(); 
    drawing.current = true; 
    const pos = getPos(e);
    lastPos.current = pos;

    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e2d5e';
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
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
        {value ? (
          <span className="text-success" style={{ fontSize: 12 }}><i className="bi bi-check-circle me-1" />Signature captured</span>
        ) : (
          <span className="text-muted" style={{ fontSize: 12 }}>Draw your signature above</span>
        )}
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

function StatusTracker({ application, education = [] }) {
  const isRejected  = application.status === 'rejected';
  const mappedKey   = STEP_KEY_MAP[application.status] || application.status;
  const stepIdx     = STATUS_STEPS.findIndex(s => s.key === mappedKey);

  const renderTrackerEducation = () => {
    const stack = [];

    if (Array.isArray(education) && education.length > 0) {
      education.forEach((edu) => {
        const rawLevel = edu.level || '';
        const displayLevel = rawLevel.toLowerCase() === 'undergraduate' ? 'College' : rawLevel;
        const displayDegree = edu.degree ? ` - ${edu.degree}` : '';
        const displayYear = edu.yearGraduated ? ` (${edu.yearGraduated})` : '';
        
        stack.push({
          level: displayLevel,
          text: `${displayLevel}${displayDegree}${displayYear}`
        });
      });
    }

    if (application.gradGradeSchool && !stack.some(e => e.level === 'Grade School')) {
      stack.push({ level: 'Grade School', text: `Grade School (${application.gradGradeSchool})` });
    }
    if (application.gradJHS && !stack.some(e => e.level === 'Junior High School')) {
      stack.push({ level: 'Junior High School', text: `Junior High School (${application.gradJHS})` });
    }
    if (application.gradSHS && !stack.some(e => e.level === 'Senior High School')) {
      stack.push({ level: 'Senior High School', text: `Senior High School (${application.gradSHS})` });
    }

    if (application.course) {
      const degrees = application.course.split(',').map(d => d.trim()).filter(Boolean);

      degrees.forEach((degree) => {
        const lowerDegree = degree.toLowerCase();
        const isPostGradText = lowerDegree.includes('master') || lowerDegree.includes('doctor') || lowerDegree.includes('phd') || lowerDegree.includes('juris');

        if (isPostGradText) {
          if (!stack.some(e => e.text.includes(degree))) {
            const pgYear = application.gradPostGrad && application.gradPostGrad !== 'N/A' ? ` (${application.gradPostGrad})` : '';
            stack.push({ level: 'Post-Graduate', text: `Post-Graduate - ${degree}${pgYear}` });
          }
        } else {
          if (!stack.some(e => e.text.includes(degree))) {
            const collYear = application.gradCollege && application.gradCollege !== 'N/A' ? ` (${application.gradCollege})` : '';
            stack.push({ level: 'College', text: `College - ${degree}${collYear}` });
          }
        }
      });
    }

    if (application.gradCollege && application.gradCollege !== 'N/A' && !stack.some(e => e.level === 'College')) {
      stack.push({ level: 'College', text: `College (${application.gradCollege})` });
    }
    if (application.gradPostGrad && application.gradPostGrad !== 'N/A' && !stack.some(e => e.level === 'Post-Graduate')) {
      stack.push({ level: 'Post-Graduate', text: `Post-Graduate (${application.gradPostGrad})` });
    }

    if (stack.length === 0) return <div className="text-muted fst-italic">—</div>;

    const PRIORITY = ['Grade School', 'Junior High School', 'Senior High School', 'College', 'Post-Graduate'];
    const sortedStack = [...stack].sort((a, b) => PRIORITY.indexOf(a.level) - PRIORITY.indexOf(b.level));

    return (
      <div className="d-flex flex-column gap-1">
        {sortedStack.map((item, idx) => (
          <div key={idx} className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
            {item.text}
          </div>
        ))}
      </div>
    );
  };

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
                      <i className="bi bi-check" style={{ display: done && !active ? 'block' : 'none' }} />
                      <i className={`bi ${step.icon}`} style={{ display: active || !done ? 'block' : 'none' }} />
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
          <div className="row g-3" style={{ fontSize: 13 }}>
            <div className="col-12 col-md-4">
              <div className="text-muted mb-1" style={{ fontSize: 11 }}>Full Name</div>
              <div className="fw-semibold text-primary">{[application.firstName, application.lastName].filter(Boolean).join(' ') || '—'}</div>
              
              <div className="text-muted mt-3 mb-1" style={{ fontSize: 11 }}>XU ID Number</div>
              <div className="fw-semibold">{application.universityIdNumber || '—'}</div>

              <div className="text-muted mt-3 mb-1" style={{ fontSize: 11 }}>Date Applied</div>
              <div className="fw-semibold">{application.createdAt?.slice(0, 10) || '—'}</div>
            </div>
            
            <div className="col-12 col-md-8">
              <div className="text-muted mb-1" style={{ fontSize: 11 }}>Education Background</div>
              <div className="p-3 bg-light rounded border border-light">
                {renderTrackerEducation()}
              </div>
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
  const [error, setError] = useState(''); 

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError('Invalid file type. Please upload a PNG or JPG image.');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setError('');
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const clear = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange(null);
    setError(''); 
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
            border: error ? '2px dashed #dc3545' : '2px dashed #d1d5db', 
            borderRadius: 6, padding: '20px 16px',
            textAlign: 'center', cursor: 'pointer', background: error ? '#fff5f5' : '#fafafa',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = error ? '#dc3545' : '#1e2d5e'}
          onMouseLeave={e => e.currentTarget.style.borderColor = error ? '#dc3545' : '#d1d5db'}
        >
          <i className={`bi ${error ? 'bi-exclamation-circle' : 'bi-cloud-upload'}`} 
             style={{ fontSize: 24, color: error ? '#dc3545' : '#9ca3af' }} 
          />
          <div className="mt-1" style={{ fontSize: 13, color: error ? '#dc3545' : '#6b7280' }}>
            {error ? error : label}
          </div>
          {!error && hint && <div style={{ fontSize: 11, color: '#9ca3af' }}>{hint}</div>}
        </div>
      )}

      {error && (
        <div className="text-danger mt-1" style={{ fontSize: 11, fontWeight: '500' }}>
          <i className="bi bi-x-circle me-1" />{error}
        </div>
      )}

      <input 
        ref={inputRef} 
        type="file" 
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        style={{ display: 'none' }} 
        onChange={handleFile} 
      />
    </div>
  );
}

function ApplicationForm({ profile, education = [], onSubmitted, token, isRenewal }) {
  const collegeEntries = education.filter(edu => edu.level === 'College');
  const postGradEntries = education.filter(edu => edu.level === 'Post-Graduate');

  const EDUCATION_PRIORITY = [
    'Post-Graduate',
    'College',
    'Senior High School',
    'Junior High School',
    'Grade School',
  ];

  const highestEducation = [...education]
    .sort(
      (a, b) =>
        EDUCATION_PRIORITY.indexOf(a.level) -
        EDUCATION_PRIORITY.indexOf(b.level)
    )[0];

  const getCourseDisplay = (edu) => {
    if (!edu) return '';
    if (edu.level === 'Grade School' || edu.level === 'Junior High School') return '';
    return edu.degree || '';
  };

  const [form, setForm] = useState({
    ...BLANK_FORM,
    lastName: profile?.surname || '',
    firstName: profile?.firstName || '',
    middleName: profile?.middleName || '',
    bloodType: profile?.bloodType || '',
    course: getCourseDisplay(highestEducation),
    gradGradeSchool: education.find(e => e.level === 'Grade School')?.yearGraduated || '',
    gradJHS: education.find(e => e.level === 'Junior High School')?.yearGraduated || '',
    gradSHS: education.find(e => e.level === 'Senior High School')?.yearGraduated || '',
    gradCollege: collegeEntries[0]?.yearGraduated || '',
    gradPostGrad: postGradEntries[0]?.yearGraduated || '',
    
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
    if (!form.lastName.trim())  missing.push('Last Name');
    if (!form.firstName.trim()) missing.push('First Name');
    if (!form.homeAddress.trim()) missing.push('Home Address');
    if (missing.length > 0) {
      return alert(`Please fill in the required fields:\n• ${missing.join('\n• ')}`);
    }
    setSubmitting(true);
    try {
      const previousApplicationId = sessionStorage.getItem('previousApplicationId');
      const userId = user.id || user._id;
      const payload = {
        ...form,
        educationSnapshot: education,
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
                <input className="form-control" style={{ fontSize: 14 }} value={f('lastName')} placeholder="N/A" readOnly />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="First Name" required>
                <input className="form-control" style={{ fontSize: 14 }} value={f('firstName')} placeholder="N/A" readOnly />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Middle Name">
                <input className="form-control" style={{ fontSize: 14 }} value={f('middleName')} placeholder="N/A" readOnly />
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
              <Field label="XU ID Number">
                <input className="form-control" style={{ fontSize: 14 }} value={f('universityIdNumber')} onChange={set('universityIdNumber')} placeholder="e.g. 2019-XXXXX" />
              </Field>
            </div>
            <div className="col-md-4">
              <Field
                label={
                  highestEducation?.level === 'Senior High School'
                    ? 'Strand'
                    : 'Degree / Course'
                }
              >
                {(education.filter(e => e.level === 'College').length > 1 || 
                  education.filter(e => e.level === 'Post-Graduate').length > 1) ? (
                  <div 
                    className="form-control bg-light text-muted text-truncate" 
                    style={{ fontSize: 14, minHeight: '38px', lineHeight: '24px' }}
                    title={education
                      .filter(e => e.level === 'College' || e.level === 'Post-Graduate')
                      .map(e => e.degree)
                      .filter(Boolean)
                      .join(', ')}
                  >
                    {education
                      .filter(e => e.level === 'College' || e.level === 'Post-Graduate')
                      .map(e => e.degree)
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                ) : (
                  <input
                    className="form-control"
                    style={{ fontSize: 14 }}
                    value={f('course')}
                    onChange={set('course')}
                    placeholder="N/A"
                    readOnly
                  />         
                )}
              </Field>
            </div>
            <div className="col-12">
              <Field label="Home Address" required>
                <input className="form-control" style={{ fontSize: 14 }} value={f('homeAddress')} onChange={set('homeAddress')}/>
              </Field>
            </div>
          </div>
        </div>

 <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            Year of Graduation
          </div>
          
          <div className="row g-3 mb-3">
            {[
              { field: 'gradGradeSchool', label: 'Grade School' },
              { field: 'gradJHS',         label: 'Junior High School' },
              { field: 'gradSHS',         label: 'Senior High School' },
            ].map(({ field, label }) => (
              <div key={field} className="col-6 col-md-4">
                <Field label={label}>
                  <input
                    className="form-control bg-light"
                    style={{ fontSize: 14 }}
                    value={f(field)}
                    onChange={set(field)}
                    placeholder="N/A"
                    maxLength={4}
                    readOnly 
                  />
                </Field>
              </div>
            ))}
          </div>

          <div className="row g-3 align-items-start">
            
            <div className="col-md-6">
              <label className="form-label fw-bold mb-2" style={{ fontSize: 12, color: '#374151' }}>
                College 
              </label>
              
              <div 
                className="border rounded p-2 bg-white" 
                style={{ 
                  minHeight: '84px', 
                  maxHeight: '110px', 
                  overflowY: 'auto',
                  borderColor: '#dee2e6'
                }}
              >
                {collegeEntries && collegeEntries.length > 0 ? (
                  collegeEntries.map((edu, index) => (
                    <div 
                      key={index} 
                      className={`d-flex justify-content-between align-items-center py-1 ${
                        index !== collegeEntries.length - 1 ? 'border-bottom mb-1' : ''
                      }`}
                    >
                      <span className="text-secondary text-truncate me-2" style={{ fontSize: 14 }} title={edu.degree}>
                        {edu.degree || 'College Degree'}
                      </span>
                      <span 
                        className="badge rounded text-white px-2 py-1" 
                        style={{ backgroundColor: '#1e2d5e', fontSize: 12, minWidth: '45px', textAlign: 'center' }}
                      >
                        {edu.yearGraduated || 'YYYY'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted pt-2 ps-1 fst-italic" style={{ fontSize: 13 }}>No college records found</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold mb-2" style={{ fontSize: 12, color: '#374151' }}>
                Post-Graduate
              </label>
              
              <div 
                className="border rounded p-2 bg-white" 
                style={{ 
                  minHeight: '84px', 
                  maxHeight: '110px', 
                  overflowY: 'auto',
                  borderColor: '#dee2e6'
                }}
              >
                {postGradEntries && postGradEntries.length > 0 ? (
                  postGradEntries.map((edu, index) => (
                    <div 
                      key={index} 
                      className={`d-flex justify-content-between align-items-center py-1 ${
                        index !== postGradEntries.length - 1 ? 'border-bottom mb-1' : ''
                      }`}
                    >
                      <span className="text-secondary text-truncate me-2" style={{ fontSize: 14 }} title={edu.degree}>
                        {edu.degree || 'Post-Grad Degree'}
                      </span>
                      <span 
                        className="badge rounded text-white px-2 py-1" 
                        style={{ backgroundColor: '#7b6b24', fontSize: 12, minWidth: '45px', textAlign: 'center' }}
                      >
                        {edu.yearGraduated || 'YYYY'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted pt-2 ps-1 fst-italic" style={{ fontSize: 13 }}>No post-grad records found</div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="mb-4">
          <div className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: 13, color: '#1e2d5e' }}>
            ID Photo
          </div>
          <Field label="Upload Your Photo">
            <PhotoUpload
              label="Click to upload a photo for your Alumni ID"
              hint="PNG or JPEG only, plain background preferred"
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

          <div className={sigMode === 'draw' ? '' : 'd-none'}>
            <Field label="Draw Your Signature" key="sig-pad-field">
              <SignaturePad
                value={f('signature')}
                onChange={(data) => setForm(prev => ({ ...prev, signature: data }))}
              />
            </Field>
          </div>

          <div className={sigMode === 'upload' ? '' : 'd-none'}>
            <Field label="Upload Signature Image" key="sig-upload-field">
              <PhotoUpload
                key="sig-upload-input"
                label="Click to upload your e-signature image"
                hint="PNG or JPEG with transparent or white background"
                value={sigUpload}
                onChange={sigUpload => setSigUpload(sigUpload)}
              />
            </Field>
          </div>
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

export default function AlumniIdApplication() {
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [profile, setProfile]         = useState(null);
  const [education, setEducation]     = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isRenewing, setIsRenewing]   = useState(false);

  const fetchStatus = async () => {
    try {
      const appRes = await axios.get('/api/IdApplication/my', { headers });
      setApplication(appRes.data[0] || null);
    } catch (err) {
      console.error(err);
    }
  };

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

  useEffect(() => {
    if (!application) return;

    const shouldPoll = !['released', 'rejected'].includes(application.status);
    
    if (shouldPoll) {
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [application?.status, application?._id]);

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
          <StatusTracker
  application={application}
  education={application.educationSnapshot || []}
/>
          
          <PaymentInstructions application={application} />

          {application.status === 'released' && (
            <RenewCard application={application} onRenew={handleRenew} />
          )}

          {application.status === 'rejected' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-2">Re-apply</h6>
                <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                  Your previous application was rejected. You may contact the Alumni Relations Office for more information, or re-apply by submitting a new application.
                </p>
                <button
                  className="btn d-inline-flex align-items-center shadow-sm"
                  style={{ 
                    backgroundColor: '#1e2d5e', 
                    color: '#fff', 
                    padding: '10px 20px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none'
                  }}
                  onClick={() => {
                    setApplication(null);
                    setIsRenewing(false);
                  }}
                >
                  <i className="bi bi-plus-lg me-2"></i>
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