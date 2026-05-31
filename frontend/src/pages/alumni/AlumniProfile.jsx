import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: 'bi-person-fill' },
  { id: 'family', label: 'Family', icon: 'bi-house-heart-fill' },
  { id: 'contact', label: 'Contact', icon: 'bi-telephone-fill' },
  { id: 'address', label: 'Address', icon: 'bi-geo-alt-fill' },
  { id: 'education', label: 'Education', icon: 'bi-mortarboard-fill' },
  { id: 'work', label: 'Work', icon: 'bi-briefcase-fill' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BLANK_PROFILE = {
  surname: '', firstName: '', middleName: '', nickname: '',
  gender: '', birthdate: '', bloodType: '', nationality: '', religion: '', universityIdNumber: '',
  spouseName: '', childrenNames: [],
  email: '', phone: '', facebook: '',
  address: { street: '', barangay: '', city: '', province: '', country: '', zipCode: '' },
};

const BLANK_EDU  = { level: '', schoolName: '', degree: '', yearGraduated: '' };
const BLANK_WORK = { company: '', department: '', position: '', address: '', phone: '', email: '' };

const EDUCATION_LEVELS = ['Grade School', 'Junior High School', 'Senior High School', 'College', 'Post-Graduate'];

function ConfirmModal({ confirm, onCancel }) {
  if (!confirm) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, padding: '28px 32px',
          maxWidth: 380, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <div className="fw-bold mb-2" style={{ fontSize: 16 }}>Confirm Delete</div>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{confirm.message}</p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary btn-sm px-3" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger btn-sm px-3" onClick={confirm.onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ fontSize: 12, color: '#374151' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder = '', max, min }) {
  return (
    <input
      type={type}
      className="form-control"
      style={{ fontSize: 14 }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      max={max}
      min={min}
    />
  );
}

function Select({ value, onChange, options, placeholder = 'Select...' }) {
  return (
    <select className="form-select" style={{ fontSize: 14 }} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const generateGraduationYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1933;
  const years = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString());
  }
  return years;
};

function SaveBtn({ saving, onClick }) {
  return (
    <button
      className="btn btn-approve px-4"
      onClick={onClick}
      disabled={saving}
    >
      {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2 me-1" />Save Changes</>}
    </button>
  );
}


function BasicTab({ profile, onChange, onSave, onSaveAndContinue, saving, setStatus }) {
  const f = (field) => profile[field] ?? '';
  const set = (field) => (val) => onChange({ ...profile, [field]: val });

  const handleSave = () => {
    const missing = [];
    if (!f('surname').trim())   missing.push('Last Name');
    if (!f('firstName').trim())  missing.push('First Name');
    if (!f('gender'))           missing.push('Gender');
    if (!f('birthdate'))         missing.push('Birthdate');
    
    if (missing.length > 0) {
      setStatus({ type: 'error', message: `Please fill in the required fields: ${missing.join(', ')}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSaveAndContinue();
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-4">
          <Field label={<>Last Name <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={f('surname')} onChange={set('surname')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label={<>First Name <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={f('firstName')} onChange={set('firstName')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Middle Name">
            <Input value={f('middleName')} onChange={set('middleName')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Nickname">
            <Input value={f('nickname')} onChange={set('nickname')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label={<>Gender <span style={{ color: '#dc2626' }}>*</span></>}>
            <Select value={f('gender')} onChange={set('gender')} options={['Male', 'Female', 'Non-binary', 'Prefer not to say']} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label={<>Birthdate <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input type="date" max={new Date(Date.now() - 86400000).toISOString().split("T")[0]} value={f('birthdate') ? f('birthdate').slice(0, 10) : ''} onChange={set('birthdate')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Blood Type">
            <Select value={f('bloodType')} onChange={set('bloodType')} options={BLOOD_TYPES} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Nationality">
            <Input value={f('nationality')} onChange={set('nationality')} placeholder="e.g. Filipino" />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Religion">
            <Input value={f('religion')} onChange={set('religion')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="XU University ID Number">
            <Input value={f('universityIdNumber')} onChange={set('universityIdNumber')} placeholder="e.g. 2019-XXXXX" />
          </Field>
        </div>
      </div>
      <div className="d-flex justify-content-end mt-2">
        <SaveBtn saving={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

function FamilyTab({ profile, onChange, onSave,  onSaveAndContinue, saving }) {
  const spouseName = profile.spouseName ?? '';
  const children   = profile.childrenNames ?? [];

  const setSpouse   = (val) => onChange({ ...profile, spouseName: val });
  const setChild    = (i, val) => {
    const next = [...children];
    next[i] = val;
    onChange({ ...profile, childrenNames: next });
  };
  const addChild    = () => onChange({ ...profile, childrenNames: [...children, ''] });
  const removeChild = (i) => onChange({ ...profile, childrenNames: children.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <Field label="Spouse Name">
            <Input value={spouseName} onChange={setSpouse} placeholder="Full name of spouse" />
          </Field>
        </div>
      </div>

      <div className="fw-semibold mb-2 mt-1" style={{ fontSize: 13 }}>Children</div>
      {children.length === 0 && (
        <p className="text-muted" style={{ fontSize: 13 }}>No children added yet.</p>
      )}
      {children.map((c, i) => (
        <div key={i} className="d-flex gap-2 mb-2">
          <input
            className="form-control"
            style={{ fontSize: 14 }}
            value={c}
            onChange={e => setChild(i, e.target.value)}
            placeholder={`Child ${i + 1} full name`}
          />
          <button className="btn btn-outline-danger btn-sm px-2" onClick={() => removeChild(i)}>
            <i className="bi bi-trash3" />
          </button>
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm mb-4" onClick={addChild}>
        <i className="bi bi-plus-lg me-1" />Add Child
      </button>

      <div className="d-flex justify-content-end">
        <SaveBtn saving={saving} onClick={onSaveAndContinue} />
      </div>
    </div>
  );
}

function ContactTab({ profile, onChange, onSave, onSaveAndContinue, saving, setStatus }) {
  const f   = (field) => profile[field] ?? '';
  const set = (field) => (val) => onChange({ ...profile, [field]: val });

  const handleSave = () => {
    const missing = [];
    if (!f('email').trim()) missing.push('Email Address');
    if (!f('phone').trim()) missing.push('Phone Number');
    if (missing.length > 0) {
      setStatus({ type: 'error', message: `Please fill in the required fields: ${missing.join(', ')}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSaveAndContinue();
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-5">
          <Field label={<>Email Address <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input type="email" value={f('email')} onChange={set('email')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label={<>Phone Number <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input type="tel" value={f('phone')} onChange={set('phone')} placeholder="+63 9XX XXX XXXX" />
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="Facebook Profile Link">
            <Input value={f('facebook')} onChange={set('facebook')} placeholder="facebook.com/..." />
          </Field>
        </div>
      </div>
      <div className="d-flex justify-content-end mt-2">
        <SaveBtn saving={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

function AddressTab({ profile, onChange, onSave, onSaveAndContinue, saving, setStatus }) {
  const addr = profile.address ?? {};
  const setAddr = (field) => (val) => onChange({ ...profile, address: { ...addr, [field]: val } });

  const handleSave = () => {
    const missing = [];
    if (!addr.street?.trim())  missing.push('House No. / Street / Subdivision');
    if (!addr.city?.trim())    missing.push('City / Municipality');
    if (!addr.country?.trim()) missing.push('Country');
    if (missing.length > 0) {
      setStatus({ type: 'error', message: `Please fill in the required fields: ${missing.join(', ')}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSaveAndContinue();
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <Field label={<>House No. / Street / Subdivision  <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={addr.street ?? ''} onChange={setAddr('street')} placeholder="Street address" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Barangay">
            <Input value={addr.barangay ?? ''} onChange={setAddr('barangay')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label={<>City / Municipality<span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={addr.city ?? ''} onChange={setAddr('city')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Province">
            <Input value={addr.province ?? ''} onChange={setAddr('province')} />
          </Field>
        </div>
        <div className="col-md-2">
          <Field label="Zip Code">
            <Input value={addr.zipCode ?? ''} onChange={setAddr('zipCode')} />
          </Field>
        </div>
        <div className="col-md-2">
            <Field label={<>Country <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={addr.country ?? ''} onChange={setAddr('country')} placeholder="Philippines" />
          </Field>
        </div>
      </div>
      <div className="d-flex justify-content-end mt-2">
        <SaveBtn saving={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

function EducationTab({ records, setRecords, token, setStatus, showConfirm }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK_EDU);
  const [saving, setSaving] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const isHigherEd = ['College', 'Post-Graduate'].includes(form.level);
  const isSHS = form.level === 'Senior High School';
  const hideField = ['Grade School', 'Junior High School'].includes(form.level);

  const graduationYearOptions = generateGraduationYears();

  useEffect(() => {
    if (editing) {
      setForm(prev => ({
        ...prev,
        schoolName: prev.schoolName || "Xavier University - Ateneo de Cagayan"
      }));
    }
  }, [editing]);

  const getPlaceholder = () => {
    if (isSHS) return "e.g. STEM, HUMSS, ABM";
    if (form.level === 'College') return "e.g. BS Psychology";
    if (form.level === 'Post-Graduate') return "e.g. Juris Doctor, Doctor of Medicine, MA in Nursing";
    return "";
  };

  const save = async () => {
    const missing = [];
    if (!form.schoolName.trim()) missing.push('School Name');
    if (!form.level) missing.push('Level');
    if ((isHigherEd || isSHS) && !form.degree?.trim()) missing.push(isSHS ? 'Strand' : 'Degree');

    if (missing.length > 0) {
      setStatus({ type: 'error', message: `Required: ${missing.join(', ')}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const restrictedLevels = ['Grade School', 'Junior High School', 'Senior High School'];
    if (restrictedLevels.includes(form.level)) {
      const isDuplicate = records.some(r => r.level === form.level && r._id !== editing);
      if (isDuplicate) {
        setStatus({ type: 'error', message: `You can only add one record for ${form.level}.` });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSaving(true);
    try {
      const res = editing === 'new' 
        ? await axios.post('/api/education', form, { headers })
        : await axios.put(`/api/education/${editing}`, form, { headers });
      setRecords(prev => editing === 'new' ? [...prev, res.data] : prev.map(r => r._id === editing ? res.data : r));
      setStatus({ type: 'success', message: 'Education saved!' });
      setEditing(null);
    } catch {
      setStatus({ type: 'error', message: 'Save failed.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {!editing && EDUCATION_LEVELS.map(levelHeader => {
        const levelRecords = records.filter(r => r.level === levelHeader);
        
        if (levelRecords.length === 0) return null;

        return (
          <div key={levelHeader} className="mb-4">
            <h5 className="fw-bold mb-2 text-dark" style={{ fontSize: 15 }}>
              {levelHeader}
            </h5>
            
            {levelRecords.map(r => (
              <div key={r._id} className="card border-0 bg-light mb-2 p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold text-dark" style={{ fontSize: 14 }}>
                      {r.schoolName}
                    </div>
                    <div className="text-muted small mt-1">
                      {r.degree ? <div>{r.degree} {r.yearGraduated && `(${r.yearGraduated})`}</div> : r.yearGraduated && `(${r.yearGraduated})`}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(r._id) || setForm(r)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => showConfirm('Delete record?', () => axios.delete(`/api/education/${r._id}`, { headers }).then(() => setRecords(p => p.filter(x => x._id !== r._id))))}>
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {!editing && records.length === 0 && (
        <p className="text-muted small mb-3">No education records added yet.</p>
      )}

      {editing ? (
        <div className="card border p-4 mt-2">
          <div className="row g-3">
            <div className="col-md-4">
              <Field label={<>Level <span style={{ color: '#dc2626' }}>*</span></>}>
                <Select value={form.level} options={EDUCATION_LEVELS} onChange={v => setForm(f => ({ ...f, level: v, degree: ['Grade School', 'Junior High School'].includes(v) ? '' : f.degree }))} />
              </Field>
            </div>
            <div className="col-md-8">
              <Field label={<>School <span style={{ color: '#dc2626' }}>*</span></>}>
                <input
                  className="form-control"
                  value={form.schoolName}
                  readOnly
                  tabIndex={-1}
                  style={{
                    fontSize: 14,
                    backgroundColor: '#f3f4f6',
                    cursor: 'not-allowed',
                    pointerEvents: 'none'
                  }}
                />
              </Field>
            </div>
            {!hideField && (
              <div className="col-md-8">
                <Field label={<>{isSHS ? 'Strand' : 'Degree / Program'} <span style={{ color: '#dc2626' }}>*</span></>}>
                  <Input 
                    value={form.degree} 
                    onChange={v => setForm(f => ({ ...f, degree: v }))} 
                    placeholder={getPlaceholder()} 
                  />
                </Field>
              </div>
            )}
            <div className="col-md-4">
              <Field label="Year Graduated">
                <Select 
                  value={form.yearGraduated} 
                  onChange={v => setForm(f => ({ ...f, yearGraduated: v }))} 
                  options={graduationYearOptions}
                  placeholder="Select Year"
                />
              </Field>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <SaveBtn saving={saving} onClick={save} />
            <button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setEditing('new') || setForm(BLANK_EDU)}>
          + Add Education
        </button>
      )}
    </div>
  );
}

function WorkTab({ records, setRecords, token, setStatus, showConfirm }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK_WORK);
  const [saving, setSaving] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const openNew = () => { setEditing('new'); setForm(BLANK_WORK); };
  const openEdit = (r) => { setEditing(r._id); setForm({ ...r }); };
  const cancel = () => { setEditing(null); setForm(BLANK_WORK); };

  const save = async () => {
    if (!form.company) {
      setStatus({ type: 'error', message: 'Company name is required.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        const res = await axios.post('/api/work', form, { headers });
        setRecords(prev => [...prev, res.data]);
      } else {
        const res = await axios.put(`/api/work/${editing}`, form, { headers });
        setRecords(prev => prev.map(r => r._id === editing ? res.data : r));
      }
      setStatus({ type: 'success', message: 'Work experience updated!' });
      setTimeout(() => setStatus(null), 3000);
      cancel();
    } catch {
      setStatus({ type: 'error', message: 'Failed to save work experience.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {records.length === 0 && !editing && <p className="text-muted" style={{ fontSize: 13 }}>No work history added.</p>}
      {!editing && records.map(r => (
        <div key={r._id} className="card border-0 bg-light mb-2 p-3">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <div className="fw-semibold" style={{ fontSize: 14 }}>{r.position}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{r.company} {r.department ? `| ${r.department}` : ''}</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => openEdit(r)}><i className="bi bi-pencil" /></button>
              <button className="btn btn-sm btn-outline-danger px-2" onClick={() => {
                showConfirm('Delete this work experience?', async () => {
                  try {
                    await axios.delete(`/api/work/${r._id}`, { headers });
                    setRecords(prev => prev.filter(item => item._id !== r._id));
                    setStatus({ type: 'success', message: 'Experience removed.' });
                    setTimeout(() => setStatus(null), 3000);
                  } catch { setStatus({ type: 'error', message: 'Failed to delete.' }); }
                });
              }}><i className="bi bi-trash3" /></button>
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <div className="card border p-4 mt-2">
          <div className="row g-3">
            <div className="col-md-6">
            <Field label={<>Company / Business <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Department"><Input value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Position Title"><Input value={form.position} onChange={v => setForm(f => ({ ...f, position: v }))} /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Office Phone"><Input value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} /></Field>
            </div>
            <div className="col-md-12">
              <Field label="Office Address"><Input value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} /></Field>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <SaveBtn saving={saving} onClick={save} />
            <button className="btn btn-outline-secondary px-4" onClick={cancel} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}
      {!editing && <button className="btn btn-outline-secondary btn-sm mt-2" onClick={openNew}><i className="bi bi-plus-lg me-1" />Add Work Experience</button>}
    </div>
  );
}

export default function AlumniProfile() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'basic');
  const [profile, setProfile] = useState(BLANK_PROFILE);
  const [originalProfile, setOriginalProfile] = useState(BLANK_PROFILE);
  const [education, setEducation] = useState([]);
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null);

  const goToNextTab = useCallback(() => {
  const currentIndex = TABS.findIndex(tab => tab.id === activeTab);

  if (currentIndex < TABS.length - 1) {
    setActiveTab(TABS[currentIndex + 1].id);
  }
}, [activeTab]);

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmModal({
      message,
      onConfirm: () => {
        setConfirmModal(null);
        onConfirm();
      },
    });
  }, []);

  const dismissConfirm = () => setConfirmModal(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/alumni/me', { headers }),
      axios.get('/api/education', { headers }),
      axios.get('/api/work', { headers }),
    ])
      .then(([profileRes, eduRes, workRes]) => {
        if (profileRes.data) {
          setProfile(profileRes.data);
          setOriginalProfile(profileRes.data);
        }
        setEducation(eduRes.data);
        setWork(workRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = useCallback(async (moveNext = false) => {
    const isUnchanged = JSON.stringify(profile) === JSON.stringify(originalProfile);
    
    if (isUnchanged) {
      setStatus({ type: 'warning', message: 'No changes were made to your profile.' });
      setTimeout(() => setStatus(null), 3000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      const res = await axios.put('/api/alumni/me', profile, { headers });
      setProfile(res.data);
      setOriginalProfile(res.data);
      setStatus({
      type: 'success',
      message: 'Profile changes saved successfully!'});
      if (moveNext) {goToNextTab(); }
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to save profile. Please check your connection and try again.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [profile, originalProfile, goToNextTab]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="text-muted">Loading profile...</div>
      </div>
    );
  }

  const profileTabProps = { profile, onChange: setProfile, onSave: saveProfile, onSaveAndContinue: () => saveProfile(true), saving, setStatus };

  const getStatusStyles = () => {
    if (status?.type === 'success') return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: 'bi-check-circle-fill' };
    if (status?.type === 'warning') return { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: 'bi-exclamation-circle-fill' };
    if (status?.type === 'error')   return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: 'bi-x-circle-fill' };
    return {};
  };

  const s = getStatusStyles();

  return (
    <div className="p-4 p-lg-5">
      <ConfirmModal confirm={confirmModal} onCancel={dismissConfirm} />

      <div className="mb-1">
        <h4 className="page-title mb-0">My Profile</h4>
      </div>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Keep your information up to date — it will be used for your Alumni ID application.
      </p>

      <div className="d-flex gap-1 flex-wrap mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setStatus(null); }}
            className="d-flex align-items-center gap-2 px-3 py-2"
            style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #1e2d5e' : '2px solid transparent',
              marginBottom: -2,
              color: activeTab === tab.id ? '#1e2d5e' : '#6b7280',
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <i className={`bi ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      {status && (
        <div 
          className="d-flex align-items-center gap-2 px-3 py-2 mb-3" 
          style={{ 
            backgroundColor: s.bg, border: `1px solid ${s.border}`, 
            borderRadius: '8px', color: s.text, fontSize: 13, fontWeight: 600,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <i className={`bi ${s.icon}`} /> {status.message}
        </div>
      )}

      <div className="card border-0 shadow-sm p-4">
        {activeTab === 'basic'     && <BasicTab     {...profileTabProps} />}
        {activeTab === 'family'    && <FamilyTab    {...profileTabProps} />}
        {activeTab === 'contact'   && <ContactTab   {...profileTabProps} />}
        {activeTab === 'address'   && <AddressTab   {...profileTabProps} />}
        {activeTab === 'education' && <EducationTab  records={education} setRecords={setEducation} token={token} setStatus={setStatus} showConfirm={showConfirm} />}
        {activeTab === 'work'      && <WorkTab       records={work}      setRecords={setWork}      token={token} setStatus={setStatus} showConfirm={showConfirm} />}
      </div>
    </div>
  );
}