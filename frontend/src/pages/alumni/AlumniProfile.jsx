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

const EDUCATION_LEVELS = ['Grade School', 'Junior High School', 'Senior High School', 'College', 'Post-Graduate', 'Vocational', 'Other'];

/* ─── Toast ───────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const styles = {
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', icon: 'bi-x-circle-fill' },
    success: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', icon: 'bi-check-circle-fill' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706', icon: 'bi-exclamation-triangle-fill' },
  };
  const s = styles[toast.type] ?? styles.error;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10,
      padding: '14px 18px', maxWidth: 380, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'fadeInDown 0.2s ease',
    }}>
      <i className={`bi ${s.icon}`} style={{ color: s.text, fontSize: 17, marginTop: 1 }} />
      <div style={{ flex: 1, fontSize: 13, color: s.text, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {toast.message}
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: s.text, fontSize: 18, lineHeight: 1 }}>
        <i className="bi bi-x" />
      </button>
    </div>
  );
}

/* ─── ConfirmModal ────────────────────────────────────────────── */
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

/* ─── Tab: Basic Info ─────────────────────────────────────────── */
function BasicTab({ profile, onChange, onSave, saving, showToast }) {
  const f = (field) => profile[field] ?? '';
  const set = (field) => (val) => onChange({ ...profile, [field]: val });

  const handleSave = () => {
    const missing = [];
    if (!f('surname').trim())            missing.push('Last Name');
    if (!f('firstName').trim())          missing.push('First Name');
    if (!f('gender'))                    missing.push('Gender');
    if (!f('birthdate'))                 missing.push('Birthdate');
    if (!f('universityIdNumber').trim()) missing.push('XU University ID Number');
    if (missing.length > 0) {
      showToast(`Please fill in the required fields:\n• ${missing.join('\n• ')}`, 'error');
      return;
    }
    onSave();
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-4">
          <Field label="Last Name *">
            <Input value={f('surname')} onChange={set('surname')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="First Name *">
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
          <Field label="Gender *">
            <Select value={f('gender')} onChange={set('gender')} options={['Male', 'Female', 'Non-binary', 'Prefer not to say']} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Birthdate *">
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
          <Field label="XU University ID Number *">
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

/* ─── Tab: Family ─────────────────────────────────────────────── */
function FamilyTab({ profile, onChange, onSave, saving }) {
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
        <SaveBtn saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

/* ─── Tab: Contact ────────────────────────────────────────────── */
function ContactTab({ profile, onChange, onSave, saving, showToast }) {
  const f   = (field) => profile[field] ?? '';
  const set = (field) => (val) => onChange({ ...profile, [field]: val });

  const handleSave = () => {
    const missing = [];
    if (!f('email').trim()) missing.push('Email Address');
    if (!f('phone').trim()) missing.push('Phone Number');
    if (missing.length > 0) {
      showToast(`Please fill in the required fields:\n• ${missing.join('\n• ')}`, 'error');
      return;
    }
    onSave();
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-5">
          <Field label="Email Address *">
            <Input type="email" value={f('email')} onChange={set('email')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="Phone Number *">
            <Input type="tel" value={f('phone')} onChange={set('phone')} placeholder="+63 9XX XXX XXXX" />
          </Field>
        </div>
        <div className="col-md-3">
          <Field label="Facebook Profile">
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

/* ─── Tab: Address ────────────────────────────────────────────── */
function AddressTab({ profile, onChange, onSave, saving, showToast }) {
  const addr = profile.address ?? {};
  const setAddr = (field) => (val) => onChange({ ...profile, address: { ...addr, [field]: val } });

  const handleSave = () => {
    const missing = [];
    if (!addr.street?.trim())  missing.push('Street / House No.');
    if (!addr.city?.trim())    missing.push('City / Municipality');
    if (!addr.country?.trim()) missing.push('Country');
    if (missing.length > 0) {
      showToast(`Please fill in the required fields:\n• ${missing.join('\n• ')}`, 'error');
      return;
    }
    onSave();
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <Field label="Street / House No. *">
            <Input value={addr.street ?? ''} onChange={setAddr('street')} placeholder="Street address" />
          </Field>
        </div>
        <div className="col-md-6">
          <Field label="Barangay">
            <Input value={addr.barangay ?? ''} onChange={setAddr('barangay')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field label="City / Municipality *">
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
          <Field label="Country *">
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

/* ─── Tab: Education ──────────────────────────────────────────── */
function EducationTab({ records, setRecords, token, showToast, showConfirm }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(BLANK_EDU);
  const [saving, setSaving]   = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const openNew  = () => { setEditing('new'); setForm(BLANK_EDU); };
  const openEdit = (r) => { setEditing(r._id); setForm({ ...r }); };
  const cancel   = () => { setEditing(null); setForm(BLANK_EDU); };

  const save = async () => {
    if (!form.schoolName || !form.level) {
      showToast('School name and level are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        const res = await axios.post('/api/education', form, { headers });
        setRecords(prev => [...prev, res.data]);
      } else {
        const res = await axios.put(`/api/education/${editing}`, form, { headers });
        setRecords(prev => prev.map(r => r._id === editing ? res.data : r));
      }
      cancel();
    } catch {
      showToast('Failed to save education record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = (id) => {
    showConfirm('Are you sure you want to delete this education record? This cannot be undone.', async () => {
      try {
        await axios.delete(`/api/education/${id}`, { headers });
        setRecords(prev => prev.filter(r => r._id !== id));
      } catch {
        showToast('Failed to delete education record.', 'error');
      }
    });
  };

  return (
    <div>
      {records.length === 0 && !editing && (
        <p className="text-muted" style={{ fontSize: 13 }}>No education records added yet.</p>
      )}

      {records.map(r => (
        <div key={r._id} className="card border-0 bg-light mb-2 p-3">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <div className="fw-semibold" style={{ fontSize: 14 }}>{r.schoolName}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {r.level}{r.degree ? ` · ${r.degree}` : ''}{r.yearGraduated ? ` · ${r.yearGraduated}` : ''}
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => openEdit(r)}>
                <i className="bi bi-pencil" />
              </button>
              <button className="btn btn-sm btn-outline-danger px-2" onClick={() => remove(r._id)}>
                <i className="bi bi-trash3" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {editing ? (
        <div className="card border p-4 mt-3">
          <h6 className="fw-bold mb-3">{editing === 'new' ? 'Add Education' : 'Edit Education'}</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <Field label="Level *">
                <Select value={form.level} onChange={v => setForm(f => ({ ...f, level: v }))} options={EDUCATION_LEVELS} />
              </Field>
            </div>
            <div className="col-md-8">
              <Field label="School / University *">
                <Input value={form.schoolName} onChange={v => setForm(f => ({ ...f, schoolName: v }))} />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Degree / Program">
                <Input value={form.degree} onChange={v => setForm(f => ({ ...f, degree: v }))} placeholder="e.g. BS Computer Science" />
              </Field>
            </div>
            <div className="col-md-3">
              <Field label="Year Graduated">
                <Input type="number" value={form.yearGraduated} onChange={v => setForm(f => ({ ...f, yearGraduated: v }))} placeholder="YYYY" />
              </Field>
            </div>
          </div>
          <div className="d-flex gap-2 mt-2">
            <SaveBtn saving={saving} onClick={save} />
            <button className="btn btn-outline-secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-outline-secondary btn-sm mt-2" onClick={openNew}>
          <i className="bi bi-plus-lg me-1" />Add Education Record
        </button>
      )}
    </div>
  );
}

/* ─── Tab: Work ───────────────────────────────────────────────── */
function WorkTab({ records, setRecords, token, showToast, showConfirm }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(BLANK_WORK);
  const [saving, setSaving]   = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const openNew  = () => { setEditing('new'); setForm(BLANK_WORK); };
  const openEdit = (r) => { setEditing(r._id); setForm({ ...r }); };
  const cancel   = () => { setEditing(null); setForm(BLANK_WORK); };

  const save = async () => {
    if (!form.company) {
      showToast('Company name is required.', 'error');
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
      cancel();
    } catch {
      showToast('Failed to save work record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = (id) => {
    showConfirm('Are you sure you want to delete this work record? This cannot be undone.', async () => {
      try {
        await axios.delete(`/api/work/${id}`, { headers });
        setRecords(prev => prev.filter(r => r._id !== id));
      } catch {
        showToast('Failed to delete work record.', 'error');
      }
    });
  };

  return (
    <div>
      {records.length === 0 && !editing && (
        <p className="text-muted" style={{ fontSize: 13 }}>No work records added yet.</p>
      )}

      {records.map(r => (
        <div key={r._id} className="card border-0 bg-light mb-2 p-3">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <div className="fw-semibold" style={{ fontSize: 14 }}>{r.company}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {[r.position, r.department].filter(Boolean).join(' · ')}
              </div>
              {r.address && <div className="text-muted" style={{ fontSize: 11 }}>{r.address}</div>}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => openEdit(r)}>
                <i className="bi bi-pencil" />
              </button>
              <button className="btn btn-sm btn-outline-danger px-2" onClick={() => remove(r._id)}>
                <i className="bi bi-trash3" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {editing ? (
        <div className="card border p-4 mt-3">
          <h6 className="fw-bold mb-3">{editing === 'new' ? 'Add Work Experience' : 'Edit Work Experience'}</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Company / Organization *">
                <Input value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Department">
                <Input value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Position / Title">
                <Input value={form.position} onChange={v => setForm(f => ({ ...f, position: v }))} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Work Phone">
                <Input type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Work Email">
                <Input type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Office Address">
                <Input value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
              </Field>
            </div>
          </div>
          <div className="d-flex gap-2 mt-2">
            <SaveBtn saving={saving} onClick={save} />
            <button className="btn btn-outline-secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-outline-secondary btn-sm mt-2" onClick={openNew}>
          <i className="bi bi-plus-lg me-1" />Add Work Experience
        </button>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function AlumniProfile() {
  const location = useLocation();
  const token    = localStorage.getItem('token');
  const headers  = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'basic');
  const [profile, setProfile]     = useState(BLANK_PROFILE);
  const [education, setEducation] = useState([]);
  const [work, setWork]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [toast, setToast]         = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
        if (profileRes.data) setProfile(profileRes.data);
        setEducation(eduRes.data);
        setWork(workRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = useCallback(async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/alumni/me', profile, { headers });
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [profile, showToast]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="text-muted">Loading profile...</div>
      </div>
    );
  }

  const profileTabProps = { profile, onChange: setProfile, onSave: saveProfile, saving, showToast };

  return (
    <div className="p-4 p-lg-5">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmModal confirm={confirmModal} onCancel={dismissConfirm} />

      <div className="d-flex align-items-center justify-content-between mb-1">
        <h4 className="page-title mb-0">My Profile</h4>
        {saved && (
          <span className="text-success fw-semibold" style={{ fontSize: 13 }}>
            <i className="bi bi-check-circle-fill me-1" />Saved
          </span>
        )}
      </div>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Keep your information up to date — it will be used for your Alumni ID application.
      </p>

      {/* Tab strip */}
      <div className="d-flex gap-1 flex-wrap mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="d-flex align-items-center gap-2 px-3 py-2"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #1e2d5e' : '2px solid transparent',
              marginBottom: -2,
              color: activeTab === tab.id ? '#1e2d5e' : '#6b7280',
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <i className={`bi ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card border-0 shadow-sm p-4">
        {activeTab === 'basic'     && <BasicTab     {...profileTabProps} />}
        {activeTab === 'family'    && <FamilyTab    {...profileTabProps} />}
        {activeTab === 'contact'   && <ContactTab   {...profileTabProps} />}
        {activeTab === 'address'   && <AddressTab   {...profileTabProps} />}
        {activeTab === 'education' && <EducationTab  records={education} setRecords={setEducation} token={token} showToast={showToast} showConfirm={showConfirm} />}
        {activeTab === 'work'      && <WorkTab       records={work}      setRecords={setWork}      token={token} showToast={showToast} showConfirm={showConfirm} />}
      </div>
    </div>
  );
}
