import { useState, useCallback, useEffect } from 'react';
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

      <div
        style={{
          flex: 1,
          color: s.text,
          fontSize: 13,
          whiteSpace: 'pre-line',
        }}
      >
        {toast.message}
      </div>

      <button
        onClick={onDismiss}
        style={{
          border: 'none',
          background: 'none',
          color: s.text,
        }}
      >
        <i className="bi bi-x" />
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label
        className="form-label fw-semibold"
        style={{ fontSize: 12, color: '#374151' }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  ...props
}) {
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

function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
}) {
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
    <button
      className="btn btn-approve px-4"
      onClick={onClick}
      disabled={saving}
    >
      {saving ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Saving...
        </>
      ) : children}
    </button>
  );
}

export default function AddAlumniRecord() {
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('alumni_profile');
    return saved ? JSON.parse(saved) : BLANK_PROFILE;
    });

  const [education, setEducation] = useState(() => {
    const saved = localStorage.getItem('alumni_education');
    return saved ? JSON.parse(saved) : [];
    });

  const [work, setWork] = useState(() => {
    const saved = localStorage.getItem('alumni_work');
    return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
    localStorage.setItem('alumni_profile', JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
    localStorage.setItem('alumni_education', JSON.stringify(education));
    }, [education]);

    useEffect(() => {
    localStorage.setItem('alumni_work', JSON.stringify(work));
    }, [work]);

  const [editingEdu, setEditingEdu] = useState(null);
  const [eduForm, setEduForm] = useState(BLANK_EDU);
  const [editingWork, setEditingWork] = useState(null);
  const [workForm, setWorkForm] = useState(BLANK_WORK);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [showClearModal, setShowClearModal] = useState(false);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const handleClearSaved = () => {
    const confirmClear = window.confirm(
        'Are you sure you want to erase all saved form data? This cannot be undone.'
    );

    if (!confirmClear) return;

    setProfile(BLANK_PROFILE);
    setEducation([]);
    setWork([]);

    localStorage.removeItem('alumni_profile');
    localStorage.removeItem('alumni_education');
    localStorage.removeItem('alumni_work');

    showToast('Saved form data cleared.', 'success');
    };

  const handleSubmit = async () => {
    const missing = [];

    if (!profile.surname.trim()) {
      missing.push('Last Name');
    }

    if (!profile.firstName.trim()) {
      missing.push('First Name');
    }

    if (!profile.gender.trim()) {
      missing.push('Gender');
    }

    if (!profile.birthdate.trim()) {
      missing.push('Birthdate');
    }

    if (!profile.universityIdNumber.trim()) {
      missing.push('XU University ID Number');
    }

    if (!profile.email.trim()) {
      missing.push('Email Address');
    }

    if (!profile.phone.trim()) {
      missing.push('Phone Number');
    }

    if (!profile.address.street.trim()) {
      missing.push('Street');
    }

    if (!profile.address.city.trim()) {
      missing.push('City');
    }

    if (!profile.address.country.trim()) {
      missing.push('Country');
    }

    if (missing.length > 0) {
      showToast(
        `Please complete the following required fields:\n• ${missing.join('\n• ')}`,
        'error'
      );

      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (profile.birthdate > today) {
    showToast('Birthdate cannot be in the future.', 'error');
    return;
    }

    try {
      setSaving(true);

      await axios.post(
        '/api/alumni',
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

      showToast('Alumni record added successfully.', 'success');

        setProfile(BLANK_PROFILE);
        setEducation([]);
        setWork([]);

        localStorage.removeItem('alumni_profile');
        localStorage.removeItem('alumni_education');
        localStorage.removeItem('alumni_work');
    } catch (err) {
      console.error(err);

      showToast('Failed to add alumni record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 p-lg-5">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="mb-4">
        <h4 className="page-title mb-1">Add Alumni Record</h4>

        <p className="text-muted" style={{ fontSize: 14 }}>
          Create a complete alumni profile record.
        </p>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: '#ffffff' }}>
        <h6 className="fw-bold mb-3">Basic Information</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <Field label={<>Last Name <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.surname} onChange={(v) => setProfile({ ...profile, surname: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>First Name <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v }) } />
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
              <Select value={profile.gender} onChange={(v) => setProfile({ ...profile, gender: v }) }
                options={[ 'Male', 'Female', 'Non-binary', 'Prefer not to say',]}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>Birthdate <span style={{ color: '#dc2626' }}>*</span></>}>
                <Input type="date" value={profile.birthdate} onChange={(v) => setProfile({ ...profile, birthdate: v }) } max={new Date().toISOString().split('T')[0]}/>
            </Field>
            </div>

          <div className="col-md-4">
            <Field label="Blood Type">
              <Select value={profile.bloodType} onChange={(v) => setProfile({ ...profile, bloodType: v }) } options={BLOOD_TYPES} />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Nationality">
              <Input value={profile.nationality} onChange={(v) => setProfile({ ...profile, nationality: v }) } />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Religion">
              <Input value={profile.religion} onChange={(v) => setProfile({ ...profile, religion: v }) } />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>XU University ID Number <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.universityIdNumber} onChange={(v) => setProfile({ ...profile, universityIdNumber: v, }) } />
            </Field>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: '#ffffff' }} >
        <h6 className="fw-bold mb-3">Family Information</h6>

        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Spouse Name">
              <Input value={profile.spouseName} onChange={(v) => setProfile({ ...profile, spouseName: v,})}/>
            </Field>
          </div>

          <div className="col-12">
            <Field label="Children">
              {profile.childrenNames.map((child, index) => (
                <div key={index} className="d-flex gap-2 mb-2">
                  <Input value={child} onChange={(v) => { const updated = [...profile.childrenNames]; updated[index] = v;
                      setProfile({ ...profile, childrenNames: updated, }); }}/>

                  <button type="button" className="btn btn-outline-danger" onClick={() => {
                      const updated =
                        profile.childrenNames.filter(
                          (_, i) => i !== index
                        );

                      setProfile({ ...profile, childrenNames: updated, }); }}>
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              ))}

              <button type="button"className="btn btn-outline-secondary btn-sm" onClick={() =>
                  setProfile({ ...profile, childrenNames: [ ...profile.childrenNames, '',], })}  >
                <i className="bi bi-plus-lg me-1" />
                Add Child
              </button>
            </Field>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4"style={{ background: '#ffffff' }}>
        <h6 className="fw-bold mb-3">Contact Information</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <Field label={<>Email Address <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input type="email"value={profile.email} onChange={(v) =>setProfile({ ...profile, email: v })}/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>Phone Number <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Facebook">
              <Input value={profile.facebook} onChange={(v) => setProfile({ ...profile, facebook: v }) }/>
            </Field>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: '#ffffff' }} >
        <h6 className="fw-bold mb-3">Address</h6>

        <div className="row g-3">
          <div className="col-md-6">
            <Field label={<>Street / House No. <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.address.street} onChange={(v) => setProfile({ ...profile, address: { ...profile.address, street: v, }, }) } />
            </Field>
          </div>

          <div className="col-md-6">
            <Field label="Barangay">
              <Input value={profile.address.barangay} onChange={(v) => setProfile({ ...profile, address: { ...profile.address, barangay: v, },})}
              />
            </Field>
          </div>

          <div className="col-md-4">
            <Field label={<>City / Municipality <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.address.city} onChange={(v) => setProfile({ ...profile, address: { ...profile.address, city: v, }, }) }/>
            </Field>
          </div>

          <div className="col-md-4">
            <Field label="Province">
              <Input value={profile.address.province} onChange={(v) => setProfile({ ...profile, address: { ...profile.address, province: v, }, }) } />
            </Field>
          </div>

          <div className="col-md-2">
            <Field label="Zip Code">
              <Input value={profile.address.zipCode} onChange={(v) => setProfile({ ...profile, address: { ...profile.address, zipCode: v, }, }) } />
            </Field>
          </div>

          <div className="col-md-2">
            <Field label={<>Country <span style={{ color: '#dc2626' }}>*</span></>}>
              <Input value={profile.address.country} onChange={(v) => setProfile({ ...profile, address: { ...profile.address, country: v, }, }) } />
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
          <div className="fw-semibold" style={{ fontSize: 14 }} > 
            {edu.schoolName || 'Untitled School'}
          </div>

          <div className="text-muted" style={{ fontSize: 12 }} >
            {edu.level}
            {edu.degree ? ` · ${edu.degree}` : ''}
            {edu.yearGraduated
              ? ` · ${edu.yearGraduated}`
              : ''}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary px-2"  onClick={() => { setEditingEdu(index); setEduForm(edu); }} >
            <i className="bi bi-pencil" />
          </button>

          <button className="btn btn-sm btn-outline-danger px-2" onClick={() => { setEducation( education.filter((_, i) => i !== index)  ); }} >
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
            <Select  value={eduForm.level} onChange={(v) => setEduForm({ ...eduForm,  level: v,  }) } options={EDUCATION_LEVELS} />
          </Field>
        </div>

        <div className="col-md-8">
          <Field label={<>School / University <span style={{ color: '#dc2626' }}>*</span></>}>
            <Input value={eduForm.schoolName} onChange={(v) =>  setEduForm({ ...eduForm, schoolName: v,  }) } />
          </Field>
        </div>

        <div className="col-md-6">
          <Field label="Degree / Program">
            <Input value={eduForm.degree}  onChange={(v) =>  setEduForm({  ...eduForm, degree: v, })  } />
          </Field>
        </div>

        <div className="col-md-3">
          <Field label="Year Graduated">
            <Input type="number" value={eduForm.yearGraduated} onChange={(v) => setEduForm({ ...eduForm, yearGraduated: v, }) } />
          </Field>
        </div>
      </div>

      <div className="d-flex gap-2 mt-2">
        <SaveBtn saving={false} onClick={() => {
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

            }}>
            <i className="bi bi-check2 me-1" />
            Save Changes
            </SaveBtn>

        <button className="btn btn-outline-secondary" onClick={() => { setEditingEdu(null); setEduForm(BLANK_EDU);  }} >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => { setEditingEdu('new'); setEduForm(BLANK_EDU); }} >
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
    <div key={index} className="card border-0 bg-light mb-2 p-3" >
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="fw-semibold" style={{ fontSize: 14 }} >
            {job.company || 'Untitled Company'}
          </div>

          <div className="text-muted"  style={{ fontSize: 12 }} >
            {[job.position, job.department]
              .filter(Boolean)
              .join(' · ')}
          </div>

          {job.address && (
            <div className="text-muted" style={{ fontSize: 11 }} >
              {job.address}
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => { setEditingWork(index);  setWorkForm(job);  }} >
            <i className="bi bi-pencil" />
          </button>

          <button className="btn btn-sm btn-outline-danger px-2"  onClick={() => { setWork( work.filter((_, i) => i !== index) ); }} >
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
            <Input value={workForm.company} onChange={(v) =>  setWorkForm({ ...workForm,  company: v,  }) }  />
          </Field>
        </div>

        <div className="col-md-6">
          <Field label="Department">
            <Input value={workForm.department} onChange={(v) =>  setWorkForm({ ...workForm, department: v,  }) } />
          </Field>
        </div>

        <div className="col-md-4">
          <Field label="Position / Title">
            <Input value={workForm.position} onChange={(v) =>  setWorkForm({  ...workForm,  position: v, }) } />
          </Field>
        </div>

        <div className="col-md-4">
          <Field label="Work Phone">
            <Input value={workForm.phone}  onChange={(v) => setWorkForm({  ...workForm, phone: v, }) } />
          </Field>
        </div>

        <div className="col-md-4">
          <Field label="Work Email">
            <Input type="email" value={workForm.email} onChange={(v) => setWorkForm({ ...workForm, email: v, })  } />
          </Field>
        </div>

        <div className="col-12">
          <Field label="Office Address">
            <Input value={workForm.address} onChange={(v) => setWorkForm({ ...workForm, address: v,  })  } />
          </Field>
        </div>
      </div>

      <div className="d-flex gap-2 mt-2">
       <SaveBtn saving={false} onClick={() => {
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

            }}>
            <i className="bi bi-check2 me-1" />
            Save Changes
            </SaveBtn>

        <button className="btn btn-outline-secondary"  onClick={() => { setEditingWork(null); setWorkForm(BLANK_WORK); }} >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => { setEditingWork('new');  setWorkForm(BLANK_WORK); }} >
      <i className="bi bi-plus-lg me-1" />
      Add Work Experience
    </button>
  )}
</div>

      <div className="d-flex justify-content-end mt-4 gap-2">
        <button className="btn btn-outline-danger px-4" onClick={() => setShowClearModal(true)}>
          <i className="bi bi-trash me-1" />
            Clear Saved Data
        </button>

        <button className="btn btn-approve px-4"  onClick={handleSubmit}  disabled={saving} >
            {saving ? (
            <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
            </>
            ) : (
            <>
                <i className="bi bi-plus-circle me-1" />
                Add Alumni Record
            </>
            )}
        </button>

         {showClearModal && (
            <>
                <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
                    <div className="modal-content border-0 rounded-3 overflow-hidden">
                    <div className="bg-danger text-white p-3">
                        <h6 className="mb-0 fw-bold">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Confirm Data Deletion
                        </h6>
                    </div>
                    <div className="p-4 text-center">
                        <div className="mb-3">
                        <div
                            style={{ width: 70, height: 70, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', }}>
                            <i className="bi bi-trash3-fill text-danger" style={{ fontSize: 28 }} />
                        </div>
                        </div>

                        <h6 className="fw-bold mb-2">Delete all saved form data?</h6>

                        <p className="text-muted small mb-0">
                        This will permanently erase your draft form data (profile, education, and work experience).  
                        You cannot undo this action.
                        </p>
                    </div>
                    <div className="modal-footer border-top d-flex justify-content-center gap-2">
                        <button
                        className="btn btn-light border px-4"
                        onClick={() => setShowClearModal(false)}
                        >
                        Cancel
                        </button>

                        <button
                        className="btn btn-danger px-4"
                        onClick={() => {
                            setProfile(BLANK_PROFILE);
                            setEducation([]);
                            setWork([]);

                            localStorage.removeItem('alumni_profile');
                            localStorage.removeItem('alumni_education');
                            localStorage.removeItem('alumni_work');

                            setShowClearModal(false);
                            showToast('Saved form data cleared.', 'success');
                        }}
                        >
                        Yes, Delete
                        </button>
                    </div>
                    </div>
                </div>
                </div>
                <div
                className="modal-backdrop show"
                style={{ zIndex: 1050 }}
                onClick={() => setShowClearModal(false)}
                />
            </>
            )} 
        </div>
    </div>
  );
}