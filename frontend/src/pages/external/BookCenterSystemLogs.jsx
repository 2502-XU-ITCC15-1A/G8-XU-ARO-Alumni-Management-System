import { useEffect, useState } from 'react';
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
    <span className="badge border-0 px-2 py-1" style={{ backgroundColor: bg, color: color, fontSize: 11, fontWeight: 500 }}>
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

  const processLogData = (log) => {
    let target = log.target || '—';
    let details = log.details || '';

    const isReleased = (log.action || '').toUpperCase() === 'ID_RELEASED';

    if (isReleased) {
      const studentName = log.target;

      if (studentName && /^[a-zA-Z\s.]+$/.test(studentName)) {
        const nameKeywords = studentName.toLowerCase().split(' ').filter(k => k.length > 2);
        
        const matchingPaymentLog = logs.find(l => {
          const isPayment = (l.action || '').toUpperCase().includes('PAYMENT');
          return isPayment && l.details && nameKeywords.every(kw => l.details.toLowerCase().includes(kw));
        });

        if (matchingPaymentLog && matchingPaymentLog.target) {
          target = matchingPaymentLog.target;
          details = `Status changed to released. Applicant: ${studentName}`; 
        }
      }
    }

    return { target, details };
  };

  const filtered = logs
    .filter(log => {
      if (!log.action) return false;
      
      const normalizedAction = log.action.toUpperCase().replace(/[\s-]/g, '_');
      
      if (normalizedAction.includes('VERIFY') || normalizedAction.includes('PAYMENT')) {
        return true;
      }

      return BOOK_CENTER_ACTIONS.some(allowedAction => 
        normalizedAction === allowedAction || 
        normalizedAction.includes(allowedAction)
      );
    })
    .filter(log => {
      const q = search.toLowerCase();
      const data = processLogData(log);
      
      return (
        (log.action || '').toLowerCase().includes(q) ||
        data.target.toLowerCase().includes(q) ||
        data.details.toLowerCase().includes(q) ||
        (log.performedBy?.name || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">Book Center System Logs</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Track payment verification, printing, and ID release activities
      </p>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search" />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">
            Book Center Activity ({filtered.length})
          </h6>

          {loading ? (
            <div className="text-muted small text-center py-4">
              Loading logs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted small text-center py-4">
              No Book Center logs found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    <th className="fw-semibold text-dark border-top-0">Date</th>
                    <th className="fw-semibold text-dark border-top-0">Staff</th>
                    <th className="fw-semibold text-dark border-top-0">Action</th>
                    <th className="fw-semibold text-dark border-top-0">Target</th>
                    <th className="fw-semibold text-dark border-top-0">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => {
                    const displayData = processLogData(log);
                    return (
                      <tr key={log._id}>
                        <td className="text-secondary">
                          {fmtDate(log.createdAt)}
                        </td>
                        <td className="text-primary fw-medium">
                          {log.performedBy?.name || '—'}
                        </td>
                        <td>
                          {getActionBadge(log.action)}
                        </td>
                        <td className="text-secondary fw-semibold">
                          {displayData.target}
                        </td>
                        <td className="text-muted small" style={{ whiteSpace: 'pre-wrap' }}>
                          {renderDetails(displayData.details)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}