import { useEffect, useState } from 'react';
import axios from 'axios';

const ROLE_LABELS = {
  'xu-aro':   'ARO Staff',
  'external': 'Book Center',
};

const ROLE_COLORS = {
  'xu-aro':   'primary',
  'external': 'secondary',
};

function RoleBadge({ role }) {
  return (
    <span className={`badge bg-${ROLE_COLORS[role] || 'dark'}`} style={{ fontSize: 11 }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

const EMPTY_FORM = { name: '', email: '', password: '', role: 'xu-aro' };

export default function UserManagement() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const token = localStorage.getItem('token');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('/api/users', authHeader)
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.name  || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowAdd(true);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async e => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.email || !form.password) {
      setFormError('Name, email, and password are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post('/api/users', form, authHeader);
      setUsers(prev => [res.data, ...prev]);
      setShowAdd(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/users/${confirmId}`, authHeader);
      setUsers(prev => prev.filter(u => u._id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">User Management</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Manage <span className="text-primary">staff accounts</span> that can access the ARO portal
      </p>

      {/* Search + Add */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="d-flex gap-2 align-items-center">
            <div className="input-group flex-grow-1">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 text-nowrap" onClick={openAdd}>
              <i className="bi bi-person-plus" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">Staff Accounts ({filtered.length})</h6>

          {loading ? (
            <div className="text-center py-4 text-muted small">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              {search ? 'No users match your search.' : 'No staff accounts yet. Click "Add User" to create one.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Role', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold text-dark border-top-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id}>
                      <td className="fw-medium text-primary">
                        {u.name}
                        {u._id === currentUserId && (
                          <span className="text-muted fw-normal ms-1" style={{ fontSize: 11 }}>(you)</span>
                        )}
                      </td>
                      <td>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>
                        {u._id !== currentUserId && (
                          <button className="action-btn text-danger" onClick={() => setConfirmId(u._id)}>
                            <i className="bi bi-trash fs-6" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
              <div className="modal-content border-0 rounded-3 overflow-hidden">
                <div className="modal-header-dark">
                  <h5 className="text-white fw-bold mb-0">Add Staff User</h5>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body p-4">
                    {formError && (
                      <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: 13 }}>
                        {formError}
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="e.g. Maria Santos"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleFormChange}
                        placeholder="e.g. staff@xu.edu.ph"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={form.password}
                        onChange={handleFormChange}
                        placeholder="Temporary password"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                    <div className="mb-1">
                      <label className="form-label fw-semibold small">Role</label>
                      <select
                        className="form-select"
                        name="role"
                        value={form.role}
                        onChange={handleFormChange}
                        style={{ fontSize: 13 }}
                      >
                        <option value="xu-aro">ARO Staff — can view and manage alumni records &amp; applications</option>
                        <option value="external">Book Center — can view approved applications</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer border-top gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAdd(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={() => !saving && setShowAdd(false)} />
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
                  <h6 className="fw-bold mb-2">Remove this user?</h6>
                  <p className="text-muted small mb-0">
                    This will permanently remove the staff account. They will no longer be able to log in.
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
                    {deleting ? 'Removing...' : 'Yes, Remove'}
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
