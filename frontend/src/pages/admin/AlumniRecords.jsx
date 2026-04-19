import { useEffect, useState } from 'react';
import axios from 'axios';

function StatusBadge({ status = 'active' }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

function fullName(a) {
  return [a.firstName, a.middleName, a.surname].filter(Boolean).join(' ') || '—';
}

export default function AlumniRecords() {
  const [alumni, setAlumni]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

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
                      <button className="action-btn text-warning">
                        <i className="bi bi-pencil-square fs-6" />
                      </button>
                      <button className="action-btn text-danger">
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
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 600 }}>
              <div className="modal-content border-0 rounded-3 overflow-hidden">
                <div className="modal-header-dark">
                  <h5 className="text-white fw-bold mb-0">Alumni Details</h5>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {[
                      ['ID Number',     selected.universityIdNumber || '—'],
                      ['Status',        <StatusBadge />],
                      ['Full Name',     fullName(selected)],
                      ['Email',         selected.email || '—'],
                      ['Phone',         selected.phone || '—'],
                      ['Nationality',   selected.nationality || '—'],
                      ['Gender',        selected.gender || '—'],
                      ['Address',       selected.address?.city ? `${selected.address.city}, ${selected.address.country}` : '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="col-6">
                        <div className="fw-semibold text-dark small mb-1">{label}</div>
                        <div className={typeof value !== 'object' ? 'text-primary' : ''} style={{ fontSize: 14 }}>
                          {value}
                        </div>
                      </div>
                    ))}
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
    </div>
  );
}
