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
                  <span className="text-secondary fw-semibold text-uppercase" style={{ fontSize: 10 }}>{parts[0].trim()}:</span>
                  <span className="text-dark ms-1 d-block text-wrap">{parts.slice(1).join(':').trim()}</span>
                </div>
              );
            }
            return <div key={idx} className="text-secondary text-wrap">{item.trim()}</div>;
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
    bg = '#dcfce7'; color = '#15803d';
  } else if (act.includes('start') || act.includes('print')) {
    bg = '#e0f2fe'; color = '#0369a1';
  } else if (act.includes('release')) {
    bg = '#f3e8ff'; color = '#6b21a8';
  }

  return (
    <span className="badge border-0 px-2 py-1 text-uppercase" style={{ backgroundColor: bg, color: color, fontSize: 11, fontWeight: 500 }}>
      {action.replace(/_/g, ' ')}
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
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'payment', 'released'

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

  const processedLogs = useMemo(() => {
    return logs
      .filter(log => {
        if (!log.action) return false;
        const normalizedAction = log.action.toUpperCase().replace(/[\s-]/g, '_');
        
        if (normalizedAction.includes('VERIFY') || normalizedAction.includes('PAYMENT')) {
          return true;
        }
        return BOOK_CENTER_ACTIONS.some(allowedAction => 
          normalizedAction === allowedAction || normalizedAction.includes(allowedAction)
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

            if (matchingPaymentLog && matchingPaymentLog.target) {
              displayTarget = matchingPaymentLog.target; 
              let cleanFullName = '';
              const paymentDetails = matchingPaymentLog.details || '';
              const nameMatch = paymentDetails.match(/applicant:\s*([^.\n]+)/i) || paymentDetails.match(/for\s+([^.\n]+)/i);
              
              if (nameMatch && nameMatch[1]) {
                cleanFullName = nameMatch[1].trim(); 
              } else {
                cleanFullName = studentName; 
              }

              const cleanDbDetails = (log.details || '')
                .replace(/^Status changed to released\.\s*/i, ''); 

              displayDetails = `ID Card Issued to Applicant: ${cleanFullName}`;
            }
          }
        }

        return {
          ...log,
          displayTarget,
          displayDetails
        };
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

    return tabFilteredLogs.filter(log => {
      return (
        (log.action || '').toLowerCase().includes(q) ||
        log.displayTarget.toLowerCase().includes(q) ||
        log.displayDetails.toLowerCase().includes(q) ||
        (log.performedBy?.name || '').toLowerCase().includes(q)
      );
    });
  }, [tabFilteredLogs, search]);

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Book Center System Logs</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Track payment verification and student ID card releases
      </p>

      {/* Tabs Layout */}
      <ul className="nav nav-tabs border-bottom mb-4" style={{ gap: '4px' }}>
        {[
          { id: 'all', label: 'All Operations', icon: 'bi-grid' },
          { id: 'payment', label: 'Payments & Approvals', icon: 'bi-cash-coin' },
          { id: 'released', label: 'Released IDs', icon: 'bi-card-checkmark' }
        ].map(tab => (
          <li className="nav-item" key={tab.id}>
            <button 
              className={`nav-link border-0 px-4 py-2 fw-semibold ${activeTab === tab.id ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
              onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              style={{ fontSize: 14, background: 'none', transition: 'all 0.15s ease-in-out' }}
            >
              <i className={`bi ${tab.icon} me-2`} />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search" />
            </span>
            <input
              className="form-control border-start-0 ps-0"
              placeholder="Search logs by staff name, ID number, applicant keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-4">
            Activities Archive ({filtered.length})
          </h6>

          {loading ? (
            <div className="text-muted small text-center py-5">
              <div className="spinner-border spinner-border-sm text-secondary me-2" role="status" />
              Loading Book Center transactions...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted small text-center py-5">
              No matching records index entries found under this section.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr className="table-light">
                    <th className="fw-semibold text-dark border-top-0 border-bottom ps-3" style={{ width: '20%' }}>Date &amp; Time</th>
                    <th className="fw-semibold text-dark border-top-0 border-bottom" style={{ width: '18%' }}>Staff Handlers</th>
                    <th className="fw-semibold text-dark border-top-0 border-bottom" style={{ width: '18%' }}>Action Type</th>
                    <th className="fw-semibold text-dark border-top-0 border-bottom" style={{ width: '16%' }}>Target Reference</th>
                    <th className="fw-semibold text-dark border-top-0 border-bottom pe-3" style={{ width: '28%' }}>Context Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log._id} className="border-bottom-0">
                      <td className="text-secondary ps-3" style={{ whiteSpace: 'nowrap' }}>
                        {fmtDate(log.createdAt)}
                      </td>
                      <td className="text-primary fw-medium">
                        {log.performedBy?.name || '—'}
                      </td>
                      <td>
                        {getActionBadge(log.action)}
                      </td>
                      <td className="text-secondary fw-bold">
                        {log.displayTarget}
                      </td>
                      <td className="text-muted small pe-3" style={{ whiteSpace: 'pre-wrap' }}>
                        {renderDetails(log.displayDetails)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}