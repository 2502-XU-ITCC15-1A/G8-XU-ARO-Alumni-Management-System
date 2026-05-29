import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

function fmtDate(val) {
  if (!val) return '—';
  return new Date(val).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function renderDetails(details) {
  if (!details) return <span className="text-muted">——</span>;

  if (typeof details === 'string' && (details.trim().startsWith('{') || details.trim().startsWith('['))) {
    try {
      const parsed = JSON.parse(details);
      return (
        <pre className="mb-0 p-2 rounded text-dark bg-light border" style={{ fontSize: 11, fontFamily: 'monospace', maxWidth: '320px', overflowX: 'auto' }}>
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (e) {}
  }

  if (typeof details === 'string' && (details.includes(':') || details.includes(','))) {
    const items = details.split(/,|\n/).filter(item => item.trim());
    if (items.length > 1) {
      return (
        <div className="d-flex flex-column gap-1" style={{ fontSize: 12, minWidth: '220px' }}>
          {items.map((item, idx) => {
            const parts = item.split(':');
            if (parts.length > 1) {
              return (
                <div key={idx} className="border-bottom pb-1 mb-1">
                  <span className="text-secondary fw-semibold text-uppercase" style={{ fontSize: 10 }}>
                    {parts[0].trim()}:
                  </span>
                  <span className="text-dark ms-1 d-block text-wrap">
                    {parts.slice(1).join(':').trim()}
                  </span>
                </div>
              );
            }
            return (
              <div key={idx} className="text-secondary text-wrap">
                {item.trim()}
              </div>
            );
          })}
        </div>
      );
    }
  }

  return (
    <div className="text-secondary text-wrap" style={{ fontSize: 12, maxWidth: '280px', lineHeight: '1.4' }}>
      {details}
    </div>
  );
}

function getActionBadge(action) {
  const act = (action || '').toLowerCase();
  let bg = '#e2e8f0';
  let color = '#475569';

  if (act.includes('verify') || act.includes('approved') || act.includes('paid')) {
    bg = '#dcfce7';
    color = '#15803d';
  } else if (act.includes('start') || act.includes('print')) {
    bg = '#e0f2fe';
    color = '#0369a1';
  } else if (act.includes('release')) {
    bg = '#f3e8ff';
    color = '#6b21a8';
  }

  return (
    <span className="badge border-0 px-2 py-1 text-uppercase" style={{ backgroundColor: bg, color, fontSize: 11, fontWeight: 500 }}>
      {action?.replace(/_/g, ' ')}
    </span>
  );
}

const BOOK_CENTER_ACTIONS = [
  'PAYMENT_VERIFIED',
  'ID_PRINTING_STARTED',
  'ID_RELEASED',
  'APPLICATION_APPROVED',
];

export default function BookCenterSystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/system-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const processedLogs = useMemo(() => {
    return logs
      .filter(log => {
        if (!log.action) return false;
        const normalizedAction = log.action.toUpperCase().replace(/[\s-]/g, '_');

        if (normalizedAction.includes('VERIFY') || normalizedAction.includes('PAYMENT')) {
          return true;
        }

        return BOOK_CENTER_ACTIONS.some(a =>
          normalizedAction === a || normalizedAction.includes(a)
        );
      })
      .map(log => {
        let displayTarget = log.target || '—';
        let displayDetails = log.details || '';
        const actionUpper = (log.action || '').toUpperCase();

        if (actionUpper === 'ID_RELEASED' && log.target) {
          const studentName = log.target;

          const nameKeywords = studentName
            .replace(/[0-9.]/g, ' ')
            .toLowerCase()
            .split(/[\s_]+/)
            .filter(k => k.length > 2);

          if (nameKeywords.length > 0) {
            const matchingPaymentLog = logs.find(l => {
              const isPayment = (l.action || '').toUpperCase().includes('PAYMENT');
              if (!isPayment || !l.details) return false;

              const detailsLower = l.details.toLowerCase();
              return nameKeywords.some(kw => detailsLower.includes(kw));
            });

            if (matchingPaymentLog?.target) {
              displayTarget = matchingPaymentLog.target;

              const paymentDetails = matchingPaymentLog.details || '';
              const nameMatch =
                paymentDetails.match(/applicant:\s*([^.\n]+)/i) ||
                paymentDetails.match(/for\s+([^.\n]+)/i);

              const cleanFullName = nameMatch?.[1]?.trim() || studentName;

              displayDetails = `ID Card Issued to Applicant: ${cleanFullName}`;
            }
          }
        }

        return { ...log, displayTarget, displayDetails };
      });
  }, [logs]);

  const tabFilteredLogs = useMemo(() => {
    return processedLogs.filter(log => {
      const act = (log.action || '').toUpperCase();

      if (activeTab === 'payment') {
        return act.includes('PAYMENT') || act.includes('VERIFY') || act.includes('APPROVED');
      }

      if (activeTab === 'released') {
        return act.includes('RELEASE');
      }

      return true;
    });
  }, [processedLogs, activeTab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tabFilteredLogs;

    return tabFilteredLogs.filter(log =>
      (log.action || '').toLowerCase().includes(q) ||
      log.displayTarget.toLowerCase().includes(q) ||
      log.displayDetails.toLowerCase().includes(q) ||
      (log.performedBy?.name || '').toLowerCase().includes(q)
    );
  }, [tabFilteredLogs, search]);

  // ✅ PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedLogs = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filtered, currentPage]);

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Book Center System Logs</h4>

      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Track payment verification and student ID card releases
      </p>

      {/* Tabs */}
      <ul className="nav nav-tabs border-bottom mb-4">
        {[
          { id: 'all', label: 'All Operations' },
          { id: 'payment', label: 'Payments & Approvals' },
          { id: 'released', label: 'Released IDs' }
        ].map(tab => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">Activities Archive ({filtered.length})</h6>

          {loading ? (
            <div className="text-center py-5 text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">No logs found.</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Staff</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLogs.map(log => (
                      <tr key={log._id}>
                        <td>{fmtDate(log.createdAt)}</td>
                        <td>{log.performedBy?.name || '—'}</td>
                        <td>{getActionBadge(log.action)}</td>
                        <td>{log.displayTarget}</td>
                        <td>{renderDetails(log.displayDetails)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ PAGINATION */}
              <div className="d-flex justify-content-between align-items-center px-2 py-3 border-top flex-wrap gap-2">
                <div className="small text-muted">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                  {filtered.length}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </button>

                  <span className="small fw-medium">
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}