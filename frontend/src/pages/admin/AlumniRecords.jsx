import { useEffect, useState } from 'react';
import axios from 'axios';

function StatusBadge({ status = 'active' }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

function fullName(a) {
  return [a.firstName, a.middleName, a.surname].filter(Boolean).join(' ') || '—';
}

function fmt(val) {
  return val || '—';
}

function fmtDate(val) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtAddress(addr) {
  if (!addr) return '—';
  return [addr.street, addr.barangay, addr.city, addr.province, addr.country, addr.zipCode]
    .filter(Boolean).join(', ') || '—';
}

export default function AlumniRecords() {
  const [alumni, setAlumni]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    axios.get('/api/alumni')
      .then(res => setAlumni(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = alumni.filter(a => {
    const name = fullName(a).toLowerCase();
    const q = search.toLowerCase();
    return (
      name.includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.universityIdNumber || '').toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/alumni/${confirmId}`);
      setAlumni(prev => prev.filter(a => a._id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete alumni record. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Alumni Records</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        View and manage verified <span className="text-primary">alumni</span> information
      </p>

      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by name, email, or ID number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">Alumni Records ({filtered.length})</h6>

          {loading ? (
            <div className="text-center py-4 text-muted small">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              {search ? 'No records match your search.' : 'No alumni records yet.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    {['ID Number', 'Name', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold text-dark border-top-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a._id}>
                      <td className="text-secondary">{a.universityIdNumber || '—'}</td>
                      <td className="text-primary fw-medium">{fullName(a)}</td>
                      <td>{a.email || '—'}</td>
                      <td>{a.phone || '—'}</td>
                      <td><StatusBadge /></td>
                      <td>
                        <button className="action-btn text-primary" onClick={() => setSelected(a)}>
                          <i className="bi bi-eye fs-6" />
                        </button>
                        <button className="action-btn text-danger" onClick={() => setConfirmId(a._id)}>
                          <i className="bi bi-trash fs-6" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {selected && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-3 overflow-hidden">
                <div className="modal-header-dark">
                  <h5 className="text-white fw-bold mb-0">Alumni Details</h5>
                </div>
                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                  <p className="fw-semibold text-uppercase text-muted small mb-3" style={{ letterSpacing: 1 }}>
                    Personal Information
                  </p>
                  <div className="row g-3 mb-4">
                    {[
                      ['University ID Number', fmt(selected.universityIdNumber)],
                      ['Status',               <StatusBadge />],
                      ['First Name',           fmt(selected.firstName)],
                      ['Middle Name',          fmt(selected.middleName)],
                      ['Surname',              fmt(selected.surname)],
                      ['Nickname',             fmt(selected.nickname)],
                      ['Gender',               fmt(selected.gender)],
                      ['Birthdate',            fmtDate(selected.birthdate)],
                      ['Nationality',          fmt(selected.nationality)],
                      ['Religion',             fmt(selected.religion)],
                    ].map(([label, value]) => (
                      <div key={label} className="col-6 col-md-4">
                        <div className="fw-semibold text-dark small mb-1">{label}</div>
                        <div className={typeof value !== 'object' ? 'text-primary' : ''} style={{ fontSize: 14 }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-3" />
                  <p className="fw-semibold text-uppercase text-muted small mb-3" style={{ letterSpacing: 1 }}>
                    Contact Information
                  </p>
                  <div className="row g-3 mb-4">
                    {[
                      ['Email',    fmt(selected.email)],
                      ['Phone',    fmt(selected.phone)],
                      ['Facebook', fmt(selected.facebook)],
                    ].map(([label, value]) => (
                      <div key={label} className="col-6 col-md-4">
                        <div className="fw-semibold text-dark small mb-1">{label}</div>
                        <div className="text-primary" style={{ fontSize: 14 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-3" />
                  <p className="fw-semibold text-uppercase text-muted small mb-3" style={{ letterSpacing: 1 }}>
                    Address
                  </p>
                  <div className="row g-3 mb-4">
                    {[
                      ['Street',   fmt(selected.address?.street)],
                      ['Barangay', fmt(selected.address?.barangay)],
                      ['City',     fmt(selected.address?.city)],
                      ['Province', fmt(selected.address?.province)],
                      ['Country',  fmt(selected.address?.country)],
                      ['Zip Code', fmt(selected.address?.zipCode)],
                    ].map(([label, value]) => (
                      <div key={label} className="col-6 col-md-4">
                        <div className="fw-semibold text-dark small mb-1">{label}</div>
                        <div className="text-primary" style={{ fontSize: 14 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-3" />
                  <p className="fw-semibold text-uppercase text-muted small mb-3" style={{ letterSpacing: 1 }}>
                    Family
                  </p>
                  <div className="row g-3">
                    <div className="col-6 col-md-4">
                      <div className="fw-semibold text-dark small mb-1">Spouse Name</div>
                      <div className="text-primary" style={{ fontSize: 14 }}>{fmt(selected.spouseName)}</div>
                    </div>
                    <div className="col-6 col-md-8">
                      <div className="fw-semibold text-dark small mb-1">Children</div>
                      <div className="text-primary" style={{ fontSize: 14 }}>
                        {selected.childrenNames?.length
                          ? selected.childrenNames.join(', ')
                          : '—'}
                      </div>
                    </div>
                  </div>

                </div>
                <div className="modal-footer border-top">
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={() => setSelected(null)} />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmId && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
              <div className="modal-content border-0 rounded-3">
                <div className="modal-body p-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: 40 }} />
                  </div>
                  <h6 className="fw-bold mb-2">Delete Alumni Record?</h6>
                  <p className="text-muted small mb-0">
                    This will permanently remove the alumni's data from the system. This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-top justify-content-center gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setConfirmId(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1050 }} onClick={() => !deleting && setConfirmId(null)} />
        </>
      )}
    </div>
  );
}
