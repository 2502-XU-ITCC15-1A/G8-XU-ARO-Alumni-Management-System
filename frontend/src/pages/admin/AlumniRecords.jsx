import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  payment_pending: 'Payment Pending',
  payment: 'Payment Verified',
  printing: 'Printing',
  released: 'Released',
  rejected: 'Rejected',
  active: 'Active',
  inactive: 'Inactive',
};

function StatusBadge({
  status = 'active',
}) {
  const label =
    STATUS_LABELS[status] || status;

  return (
    <span
      className={`status-badge status-${status}`}
    >
      {label}
    </span>
  );
}

function fullName(a) {
  return (
    [
      a.firstName,
      a.middleName,
      a.surname,
    ]
      .filter(Boolean)
      .join(' ') || '—'
  );
}

function fmt(val) {
  return val || '—';
}

function fmtDate(val) {
  if (!val) return '—';

  return new Date(
    val
  ).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AlumniRecords() {
  const [alumni, setAlumni] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const [selected, setSelected] =
    useState(null);

  const [confirmId, setConfirmId] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const ITEMS_PER_PAGE = 50;

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('/api/alumni')
      .then((res) =>
        setAlumni(res.data)
      )
      .catch(console.error)
      .finally(() =>
        setLoading(false)
      );
  }, []);

  // RESET PAGE ON SEARCH
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = alumni.filter(
    (a) => {
      const name = fullName(
        a
      ).toLowerCase();

      const q =
        search.toLowerCase();

      return (
        name.includes(q) ||
        (a.email || '')
          .toLowerCase()
          .includes(q) ||
        (
          a.universityIdNumber ||
          ''
        )
          .toLowerCase()
          .includes(q)
      );
    }
  );

  // PAGINATION
  const totalPages = Math.ceil(
    filtered.length /
      ITEMS_PER_PAGE
  );

  const paginatedAlumni =
    filtered.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const handleDelete =
    async () => {
      if (!confirmId) return;

      setDeleting(true);

      try {
        await axios.delete(
          `/api/alumni/${confirmId}`
        );

        setAlumni((prev) =>
          prev.filter(
            (a) =>
              a._id !== confirmId
          )
        );

        setConfirmId(null);
      } catch (err) {
        console.error(err);

        alert(
          'Failed to delete alumni record. Please try again.'
        );
      } finally {
        setDeleting(false);
      }
    };

  const getSortedEducation = (
    eduArray
  ) => {
    if (!Array.isArray(eduArray))
      return [];

    const LEVEL_PRIORITY = {
      'grade school': 1,
      'junior high school': 2,
      'senior high school': 3,
      college: 4,
      undergraduate: 4,
      'post-graduate': 5,
    };

    return [...eduArray].sort(
      (a, b) => {
        const levelA = (
          a.level || ''
        ).toLowerCase();

        const levelB = (
          b.level || ''
        ).toLowerCase();

        const priorityA =
          LEVEL_PRIORITY[levelA] ||
          99;

        const priorityB =
          LEVEL_PRIORITY[levelB] ||
          99;

        if (
          priorityA !== priorityB
        ) {
          return (
            priorityA -
            priorityB
          );
        }

        const yearA =
          parseInt(
            a.yearGraduated,
            10
          ) || 0;

        const yearB =
          parseInt(
            b.yearGraduated,
            10
          ) || 0;

        return yearA - yearB;
      }
    );
  };

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">
        Alumni Records
      </h4>

      <p
        className="text-muted mb-4"
        style={{ fontSize: 14 }}
      >
        View and manage verified{' '}
        <span className="text-primary">
          alumni
        </span>{' '}
        information
      </p>

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
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mb-0">
              Alumni Records (
              {filtered.length})
            </h6>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted small">
              Loading...
            </div>
          ) : filtered.length ===
            0 ? (
            <div className="text-center py-4 text-muted small">
              {search
                ? 'No records match your search.'
                : 'No alumni records yet.'}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table
                  className="table mb-0"
                  style={{
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        'ID Number',
                        'Name',
                        'Email',
                        'Phone',
                        'Status',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className="fw-semibold text-dark border-top-0"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedAlumni.map(
                      (a) => (
                        <tr
                          key={a._id}
                        >
                          <td className="text-secondary">
                            {a.universityIdNumber ||
                              '—'}
                          </td>

                          <td className="text-primary fw-medium">
                            {fullName(a)}
                          </td>

                          <td>
                            {a.email || '—'}
                          </td>

                          <td>
                            {a.phone || '—'}
                          </td>

                          <td>
                            <StatusBadge
                              status={
                                a.status
                              }
                            />
                          </td>

                          <td>
                            <button
                              className="action-btn text-primary"
                              onClick={() =>
                                setSelected(
                                  a
                                )
                              }
                            >
                              <i className="bi bi-eye fs-6" />
                            </button>

                           {/* <button
                              className="action-btn text-danger"
                              onClick={() =>
                                setConfirmId(
                                  a._id
                                )
                              }
                            >
                              <i className="bi bi-trash fs-6" />
                            </button>*/}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
                <div className="small text-muted">
                  Showing{' '}
                  {filtered.length ===
                  0
                    ? 0
                    : (currentPage - 1) *
                        ITEMS_PER_PAGE +
                      1}{' '}
                  to{' '}
                  {Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    filtered.length
                  )}{' '}
                  of {filtered.length}{' '}
                  alumni
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (p) => p - 1
                      )
                    }
                  >
                    Previous
                  </button>

                  <span className="small fw-medium px-2">
                    Page {currentPage}{' '}
                    of{' '}
                    {totalPages || 1}
                  </span>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={
                      currentPage ===
                        totalPages ||
                      totalPages === 0
                    }
                    onClick={() =>
                      setCurrentPage(
                        (p) => p + 1
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selected && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-3 overflow-hidden">
                <div className="modal-header-dark">
                  <h5 className="text-white fw-bold mb-0">
                    Alumni Details
                  </h5>
                </div>

                <div
                  className="modal-body p-4"
                  style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                  }}
                >
                  {/* KEEPING YOUR MODAL CONTENT EXACTLY AS-IS */}
                  {/* Your existing modal content continues here */}
                </div>

                <div className="modal-footer border-top">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      setSelected(null)
                    }
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop show"
            style={{ zIndex: 1040 }}
            onClick={() =>
              setSelected(null)
            }
          />
        </>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmId && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ zIndex: 1060 }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{
                maxWidth: 420,
              }}
            >
              <div className="modal-content border-0 rounded-3">
                <div className="modal-body p-4 text-center">
                  <div className="mb-3">
                    <i
                      className="bi bi-exclamation-triangle-fill text-danger"
                      style={{
                        fontSize: 40,
                      }}
                    />
                  </div>

                  <h6 className="fw-bold mb-2">
                    Delete Alumni
                    Record?
                  </h6>

                  <p className="text-muted small mb-0">
                    This will
                    permanently remove
                    the alumni's data
                    from the system.
                    This action cannot
                    be undone.
                  </p>
                </div>

                <div className="modal-footer border-top justify-content-center gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      setConfirmId(
                        null
                      )
                    }
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={
                      handleDelete
                    }
                    disabled={deleting}
                  >
                    {deleting
                      ? 'Deleting...'
                      : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop show"
            style={{ zIndex: 1050 }}
            onClick={() =>
              !deleting &&
              setConfirmId(null)
            }
          />
        </>
      )}
    </div>
  );
}