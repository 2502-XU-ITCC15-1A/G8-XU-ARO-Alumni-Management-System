import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EDUCATION_LEVELS = [
  'Grade School',
  'Junior High School',
  'Senior High School',
  'College',
  'Post-Graduate',
  'Vocational',
  'Other',
];

const BLANK_PROFILE = {
  surname: '',
  firstName: '',
  middleName: '',
  nickname: '',
  gender: '',
  birthdate: '',
  bloodType: '',
  nationality: '',
  religion: '',
  universityIdNumber: '',
  spouseName: '',
  childrenNames: [''],
  email: '',
  phone: '',
  facebook: '',
  address: {
    street: '',
    barangay: '',
    city: '',
    province: '',
    country: '',
    zipCode: '',
  },
};

const BLANK_EDU = {
  level: '',
  schoolName: '',
  degree: '',
  yearGraduated: '',
};

const BLANK_WORK = {
  company: '',
  department: '',
  position: '',
  address: '',
  phone: '',
  email: '',
};

function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const styles = {
    error: {
      bg: '#fef2f2',
      border: '#fca5a5',
      text: '#dc2626',
      icon: 'bi-x-circle-fill',
    },
    success: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#16a34a',
      icon: 'bi-check-circle-fill',
    },
  };

  const s = styles[toast.type] || styles.error;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 10,
        padding: '14px 18px',
        maxWidth: 380,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        gap: 10,
      }}
    >
      <i className={`bi ${s.icon}`} style={{ color: s.text }} />
      <div style={{ flex: 1, color: s.text, fontSize: 13, whiteSpace: 'pre-line' }}>
        {toast.message}
      </div>
      <button onClick={onDismiss} style={{ border: 'none', background: 'none', color: s.text }}>
        <i className="bi bi-x" />
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ fontSize: 12, color: '#374151' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder = '', ...props }) {
  return (
    <input
      type={type}
      className="form-control"
      style={{ fontSize: 14 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  );
}

function Select({ value, onChange, options, placeholder = 'Select...' }) {
  return (
    <select
      className="form-select"
      style={{ fontSize: 14 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SaveBtn({ saving, children, onClick }) {
  return (
    <button className="btn btn-approve px-4" onClick={onClick} disabled={saving}>
      {saving ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Saving...
        </>
      ) : children}
    </button>
  );
}

export default function EditAlumniRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(BLANK_PROFILE);
  const [education, setEducation] = useState([]);
  const [work, setWork] = useState([]);

  const [editingEdu, setEditingEdu] = useState(null);
  const [eduForm, setEduForm] = useState(BLANK_EDU);

  const [editingWork, setEditingWork] = useState(null);
  const [workForm, setWorkForm] = useState(BLANK_WORK);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/alumni/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setProfile({
          ...BLANK_PROFILE,
          ...data,
          birthdate: data.birthdate
            ? new Date(data.birthdate).toISOString().split('T')[0]
            : '',
          address: {
            ...BLANK_PROFILE.address,
            ...data.address,
          },
          childrenNames:
            data.childrenNames?.length > 0 ? data.childrenNames : [''],
        });

        setEducation(data.education || []);
        setWork(data.work || []);
      } catch (err) {
        showToast('Failed to load alumni record.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, showToast]);

  const handleSave = async () => {
    try {
      setSaving(true);

      await axios.put(
        `/api/alumni/${id}`,
        {
          ...profile,
          education,
          work,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast('Alumni record updated successfully.', 'success');

      setTimeout(() => {
        navigate('/alumni-records');
      }, 1200);
    } catch {
      showToast('Failed to update alumni record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-center text-muted">Loading alumni record...</div>;
  }

  return (
    <div className="p-4 p-lg-5">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="mb-4">
        <h4 className="page-title mb-1">Edit Alumni Record</h4>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Update complete alumni profile.
        </p>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="fw-bold mb-3">Basic Information</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <Field label={<>Last Name <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.surname} onChange={(v) => setProfile({ ...profile, surname: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>First Name <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Middle Name">
              <Input value={profile.middleName} onChange={(v) => setProfile({ ...profile, middleName: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Nickname">
              <Input value={profile.nickname} onChange={(v) => setProfile({ ...profile, nickname: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>Gender <span style={{ color: '#dc2626' }}>*</span></>}>
              <Select
                value={profile.gender}
                onChange={(v) => setProfile({ ...profile, gender: v })}
                options={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
              />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>Birthdate <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input
                type="date"
                value={profile.birthdate}
                onChange={(v) => setProfile({ ...profile, birthdate: v })}
                max={new Date().toISOString().split('T')[0]}
              />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Blood Type">
              <Select
                value={profile.bloodType}
                onChange={(v) => setProfile({ ...profile, bloodType: v })}
                options={BLOOD_TYPES}
              />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Nationality">
              <Input value={profile.nationality} onChange={(v) => setProfile({ ...profile, nationality: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Religion">
              <Input value={profile.religion} onChange={(v) => setProfile({ ...profile, religion: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>XU University ID Number <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input
                value={profile.universityIdNumber}
                onChange={(v) => setProfile({ ...profile, universityIdNumber: v })}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="fw-bold mb-3">Family Information</h6>

        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Spouse Name">
              <Input value={profile.spouseName} onChange={(v) => setProfile({ ...profile, spouseName: v })}/>
            </Field>
          </div>

          <div className="col-12">
            <Field label="Children">
              {profile.childrenNames.map((child, index) => (
                <div key={index} className="d-flex gap-2 mb-2">
                  <Input
                    value={child}
                    onChange={(v) => {
                      const updated = [...profile.childrenNames];
                      updated[index] = v;
                      setProfile({ ...profile, childrenNames: updated });
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      const updated = profile.childrenNames.filter((_, i) => i !== index);
                      setProfile({ ...profile, childrenNames: updated });
                    }}
                  >
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  setProfile({
                    ...profile,
                    childrenNames: [...profile.childrenNames, ''],
                  })
                }
              >
                <i className="bi bi-plus-lg me-1" />
                Add Child
              </button>
            </Field>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="fw-bold mb-3">Contact Information</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <Field label={<>Email Address <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>Phone Number <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Facebook">
              <Input value={profile.facebook} onChange={(v) => setProfile({ ...profile, facebook: v })}/>
            </Field>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="fw-bold mb-3">Address</h6>

        <div className="row g-3">
          <div className="col-md-6">
            <Field label={<>Street / House No. <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input
                value={profile.address.street}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, street: v },
                  })
                }
              />
            </Field>
          </div>

          <div className="col-md-6">
            <Field label="Barangay">
              <Input
                value={profile.address.barangay}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, barangay: v },
                  })
                }
              />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>City / Municipality <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input
                value={profile.address.city}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, city: v },
                  })
                }
              />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Province">
              <Input
                value={profile.address.province}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, province: v },
                  })
                }
              />
            </Field>
          </div>

          <div className="col-md-2">
            <Field label="Zip Code">
              <Input
                value={profile.address.zipCode}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, zipCode: v },
                  })
                }
              />
            </Field>
          </div>

          <div className="col-md-2">
            <Field label={<>Country <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input
                value={profile.address.country}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, country: v },
                  })
                }
              />
            </Field>
          </div>
        </div>
      </div>
    <div className="card border-0 shadow-sm p-4 mb-4">
  <h6 className="fw-bold mb-3">Education</h6>

  {education.length === 0 && !editingEdu && (
    <p className="text-muted" style={{ fontSize: 13 }}>
      No education records added yet.
    </p>
  )}

  {education.map((edu, index) => (
    <div key={index} className="card border-0 bg-light mb-2 p-3">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-semibold" style={{ fontSize: 14 }}>
            {edu.schoolName || 'Untitled School'}
          </div>

          <div className="text-muted" style={{ fontSize: 12 }}>
            {edu.level}
            {edu.degree ? ` · ${edu.degree}` : ''}
            {edu.yearGraduated ? ` · ${edu.yearGraduated}` : ''}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary px-2"
            onClick={() => {
              setEditingEdu(index);
              setEduForm(edu);
            }}
          >
            <i className="bi bi-pencil" />
          </button>

          <button
            className="btn btn-sm btn-outline-danger px-2"
            onClick={() => {
              setEducation(education.filter((_, i) => i !== index));
            }}
          >
            <i className="bi bi-trash3" />
          </button>
        </div>
      </div>
    </div>
  ))}

  {editingEdu !== null ? (
    <div className="card border p-4 mt-3">
      <h6 className="fw-bold mb-3">
        {typeof editingEdu === 'number' ? 'Edit Education' : 'Add Education'}
      </h6>

      <div className="row g-3">
        <div className="col-md-4">
          <Field label={<>Level <span style={{ color: '#dc2626' }}>*</span></>}>
            <Select
              value={eduForm.level}
              onChange={(v) => setEduForm({ ...eduForm, level: v })}
              options={EDUCATION_LEVELS}
            />
          </Field>
        </div>

        <div className="col-md-8">
          <Field label={<>School / University <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input
              value={eduForm.schoolName}
              onChange={(v) => setEduForm({ ...eduForm, schoolName: v })}
            />
          </Field>
        </div>

        <div className="col-md-6">
          <Field label="Degree / Program">
            <Input
              value={eduForm.degree}
              onChange={(v) => setEduForm({ ...eduForm, degree: v })}
            />
          </Field>
        </div>

        <div className="col-md-3">
          <Field label="Year Graduated">
            <Input
              type="number"
              value={eduForm.yearGraduated}
              onChange={(v) => setEduForm({ ...eduForm, yearGraduated: v })}
            />
          </Field>
        </div>
      </div>

      <div className="d-flex gap-2 mt-2">
        <SaveBtn
          saving={false}
          onClick={() => {
            if (!eduForm.level.trim() || !eduForm.schoolName.trim()) {
              showToast('Education Level and School / University are required.', 'error');
              return;
            }

            if (typeof editingEdu === 'number') {
              const updated = [...education];
              updated[editingEdu] = eduForm;
              setEducation(updated);
            } else {
              setEducation([...education, eduForm]);
            }

            setEditingEdu(null);
            setEduForm(BLANK_EDU);
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </SaveBtn>

        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setEditingEdu(null);
            setEduForm(BLANK_EDU);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button
      className="btn btn-outline-secondary btn-sm mt-2"
      onClick={() => {
        setEditingEdu('new');
        setEduForm(BLANK_EDU);
      }}
    >
      <i className="bi bi-plus-lg me-1" />
      Add Education Record
    </button>
  )}
</div>

<div className="card border-0 shadow-sm p-4 mb-4">
  <h6 className="fw-bold mb-3">Work Experience</h6>

  {work.length === 0 && !editingWork && (
    <p className="text-muted" style={{ fontSize: 13 }}>
      No work records added yet.
    </p>
  )}

  {work.map((job, index) => (
    <div key={index} className="card border-0 bg-light mb-2 p-3">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-semibold" style={{ fontSize: 14 }}>
            {job.company || 'Untitled Company'}
          </div>

          <div className="text-muted" style={{ fontSize: 12 }}>
            {[job.position, job.department].filter(Boolean).join(' · ')}
          </div>

          {job.address && (
            <div className="text-muted" style={{ fontSize: 11 }}>
              {job.address}
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary px-2"
            onClick={() => {
              setEditingWork(index);
              setWorkForm(job);
            }}
          >
            <i className="bi bi-pencil" />
          </button>

          <button
            className="btn btn-sm btn-outline-danger px-2"
            onClick={() => {
              setWork(work.filter((_, i) => i !== index));
            }}
          >
            <i className="bi bi-trash3" />
          </button>
        </div>
      </div>
    </div>
  ))}

  {editingWork !== null ? (
    <div className="card border p-4 mt-3">
      <h6 className="fw-bold mb-3">
        {typeof editingWork === 'number' ? 'Edit Work Experience' : 'Add Work Experience'}
      </h6>

      <div className="row g-3">
        <div className="col-md-6">
          <Field label={<>Company / Organization <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input
              value={workForm.company}
              onChange={(v) => setWorkForm({ ...workForm, company: v })}
            />
          </Field>
        </div>

        <div className="col-md-6">
          <Field label="Department">
            <Input
              value={workForm.department}
              onChange={(v) => setWorkForm({ ...workForm, department: v })}
            />
          </Field>
        </div>

        <div className="col-md-4">
          <Field label="Position / Title">
            <Input
              value={workForm.position}
              onChange={(v) => setWorkForm({ ...workForm, position: v })}
            />
          </Field>
        </div>

        <div className="col-md-4">
          <Field label="Work Phone">
            <Input
              value={workForm.phone}
              onChange={(v) => setWorkForm({ ...workForm, phone: v })}
            />
          </Field>
        </div>

        <div className="col-md-4">
          <Field label="Work Email">
            <Input
              type="email"
              value={workForm.email}
              onChange={(v) => setWorkForm({ ...workForm, email: v })}
            />
          </Field>
        </div>

        <div className="col-12">
          <Field label="Office Address">
            <Input
              value={workForm.address}
              onChange={(v) => setWorkForm({ ...workForm, address: v })}
            />
          </Field>
        </div>
      </div>

      <div className="d-flex gap-2 mt-2">
        <SaveBtn
          saving={false}
          onClick={() => {
            if (!workForm.company.trim()) {
              showToast('Company name is required.', 'error');
              return;
            }

            if (typeof editingWork === 'number') {
              const updated = [...work];
              updated[editingWork] = workForm;
              setWork(updated);
            } else {
              setWork([...work, workForm]);
            }

            setEditingWork(null);
            setWorkForm(BLANK_WORK);
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </SaveBtn>

        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setEditingWork(null);
            setWorkForm(BLANK_WORK);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button
      className="btn btn-outline-secondary btn-sm mt-2"
      onClick={() => {
        setEditingWork('new');
        setWorkForm(BLANK_WORK);
      }}
    >
      <i className="bi bi-plus-lg me-1" />
      Add Work Experience
    </button>
  )}
</div>
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/alumni-records')}>
          Cancel
        </button>

        <SaveBtn saving={saving} onClick={handleSave}>
          <i className="bi bi-check2 me-1" />
          Save Changes
        </SaveBtn>
      </div>
    </div>
  );
}