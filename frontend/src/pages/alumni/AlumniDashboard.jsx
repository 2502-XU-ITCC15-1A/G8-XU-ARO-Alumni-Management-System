import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_META = {
  pending:      { label: 'Pending Review',   color: '#92400e', bg: '#fef9c3', icon: 'bi-clock-fill' },
  under_review: { label: 'Under Review',     color: '#1e40af', bg: '#dbeafe', icon: 'bi-search' },
  approved:     { label: 'Approved',         color: '#166534', bg: '#dcfce7', icon: 'bi-check-circle-fill' },
  rejected:     { label: 'Rejected',         color: '#991b1b', bg: '#fee2e2', icon: 'bi-x-circle-fill' },
  printing:     { label: 'Being Printed',    color: '#6d28d9', bg: '#ede9fe', icon: 'bi-printer-fill' },
  released:     { label: 'ID Released',      color: '#065f46', bg: '#d1fae5', icon: 'bi-patch-check-fill' },
};

const STEPS = ['pending', 'under_review', 'approved', 'printing', 'released'];

function profileCompleteness(profile, education, work) {
  if (!profile) return 0;
  const basicFields = ['surname', 'firstName', 'gender', 'birthdate', 'nationality', 'email', 'phone'];
  const addressFields = ['street', 'city', 'province', 'country'];
  const filled = [
    ...basicFields.map(f => !!profile[f]),
    ...addressFields.map(f => !!(profile.address?.[f])),
    education.length > 0,
    work.length > 0,
  ];
  return Math.round((filled.filter(Boolean).length / filled.length) * 100);
}

export default function AlumniDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [profile, setProfile]     = useState(null);
  const [education, setEducation] = useState([]);
  const [work, setWork]           = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/alumni/me', { headers }),
      axios.get('/api/education', { headers }),
      axios.get('/api/work', { headers }),
      axios.get('/api/IdApplication/my', { headers }),
    ])
      .then(([profileRes, eduRes, workRes, appRes]) => {
        setProfile(profileRes.data);
        setEducation(eduRes.data);
        setWork(workRes.data);
        setApplication(appRes.data[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pct = profileCompleteness(profile, education, work);
  const appMeta = application ? STATUS_META[application.status] : null;
  const stepIdx = application ? STEPS.indexOf(application.status) : -1;

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Welcome back, {user.name?.split(' ')[0] || 'Alumni'}</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Xavier University — Alumni Self-Service Portal
      </p>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : (
        <>
          {/* Profile Completeness */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-5">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="stat-icon" style={{ backgroundColor: '#2563eb' }}>
                      <i className="bi bi-person-fill" />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: 15 }}>Profile Completion</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>Fill in all sections to apply for your Alumni ID</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="flex-grow-1 bg-light rounded" style={{ height: 8 }}>
                      <div
                        className="rounded"
                        style={{
                          height: 8,
                          width: `${pct}%`,
                          backgroundColor: pct === 100 ? '#16a34a' : pct >= 60 ? '#d97706' : '#2563eb',
                          transition: 'width 0.4s'
                        }}
                      />
                    </div>
                    <span className="fw-bold" style={{ fontSize: 14, minWidth: 36 }}>{pct}%</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {pct === 100 ? 'Profile complete!' : `${pct < 50 ? 'Just getting started' : 'Almost there'} — update your profile`}
                  </div>
                  <button
                    className="btn btn-sm mt-3"
                    style={{ backgroundColor: '#1e2d5e', color: '#fff', fontSize: 13 }}
                    onClick={() => navigate('/alumni-portal/profile')}
                  >
                    <i className="bi bi-pencil-fill me-1" />
                    {profile ? 'Edit Profile' : 'Set Up Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* ID Application Status */}
            <div className="col-12 col-md-7">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="stat-icon" style={{ backgroundColor: '#7b6b24' }}>
                        <i className="bi bi-card-heading" />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: 15 }}>Alumni ID Application</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>Track your application status</div>
                      </div>
                    </div>
                    {application && (
                      <span
                        className="px-3 py-1 rounded-pill fw-semibold"
                        style={{ fontSize: 12, backgroundColor: appMeta.bg, color: appMeta.color }}
                      >
                        <i className={`bi ${appMeta.icon} me-1`} />
                        {appMeta.label}
                      </span>
                    )}
                  </div>

                  {application ? (
                    <>
                      {/* Step tracker */}
                      <div className="d-flex align-items-center gap-1 mb-3" style={{ overflowX: 'auto' }}>
                        {STEPS.map((step, i) => {
                          const isRejected = application.status === 'rejected';
                          const done = !isRejected && i <= stepIdx;
                          const active = !isRejected && i === stepIdx;
                          return (
                            <div key={step} className="d-flex align-items-center" style={{ flexShrink: 0 }}>
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: 28, height: 28,
                                  backgroundColor: isRejected && i === 0 ? '#fee2e2' : done ? '#1e2d5e' : '#e5e7eb',
                                  border: active ? '2px solid #7b6b24' : 'none',
                                  fontSize: 12,
                                  color: done ? '#fff' : '#9ca3af',
                                  fontWeight: 700,
                                }}
                              >
                                {done && !active ? <i className="bi bi-check" /> : i + 1}
                              </div>
                              <div className="text-muted mx-1" style={{ fontSize: 10, maxWidth: 52, textAlign: 'center', lineHeight: 1.2 }}>
                                {STATUS_META[step]?.label.split(' ')[0]}
                              </div>
                              {i < STEPS.length - 1 && (
                                <div style={{ width: 20, height: 2, backgroundColor: done ? '#1e2d5e' : '#e5e7eb', flexShrink: 0 }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {application.status === 'rejected' && application.remarks && (
                        <div className="rounded p-2 mb-2" style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: 12 }}>
                          <i className="bi bi-info-circle me-1" />
                          Reason: {application.remarks}
                        </div>
                      )}

                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: '#1e2d5e', color: '#fff', fontSize: 13 }}
                        onClick={() => navigate('/alumni-portal/apply')}
                      >
                        View Application
                      </button>
                    </>
                  ) : (
                    <div>
                      <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                        You haven't applied for an Alumni ID yet. Complete your profile first, then submit an application.
                      </p>
                      <button
                        className="btn btn-sm btn-approve"
                        onClick={() => navigate('/alumni-portal/apply')}
                        disabled={pct < 50}
                      >
                        <i className="bi bi-plus-lg me-1" />
                        Apply for Alumni ID
                      </button>
                      {pct < 50 && (
                        <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                          Complete at least 50% of your profile to apply.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Quick Actions</h6>
              <div className="row g-3">
                {[
                  { label: 'Update Basic Info',  icon: 'bi-person',          path: '/alumni-portal/profile', tab: 'basic' },
                  { label: 'Add Education',       icon: 'bi-mortarboard',     path: '/alumni-portal/profile', tab: 'education' },
                  { label: 'Add Work History',    icon: 'bi-briefcase',       path: '/alumni-portal/profile', tab: 'work' },
                  { label: 'Alumni ID Status',    icon: 'bi-card-heading',    path: '/alumni-portal/apply' },
                ].map(action => (
                  <div key={action.label} className="col-6 col-md-3">
                    <button
                      className="w-100 card border-0 shadow-sm p-3 text-start"
                      style={{ cursor: 'pointer', background: '#fff' }}
                      onClick={() => navigate(action.path, action.tab ? { state: { tab: action.tab } } : undefined)}
                    >
                      <i className={`bi ${action.icon} mb-2`} style={{ fontSize: 22, color: '#1e2d5e' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e2d5e' }}>{action.label}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
