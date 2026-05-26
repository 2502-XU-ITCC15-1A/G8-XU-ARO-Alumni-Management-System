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

  if (act.includes('create') || act.includes('add') || act.includes('upload')) {
    bg = '#dcfce7'; color = '#15803d';
  } else if (act.includes('update') || act.includes('edit') || act.includes('verify') || act.includes('backup')) {
    bg = '#e0f2fe'; color = '#0369a1';
  } else if (act.includes('delete') || act.includes('remove') || act.includes('reject') || act.includes('fail')) {
    bg = '#fee2e2'; color = '#b91c1c';
  } else if (act.includes('release') || act.includes('print')) {
    bg = '#f3e8ff'; color = '#6b21a8';
  }

  return (
    <span className="badge border-0 px-2 py-1" style={{ backgroundColor: bg, color: color, fontSize: 11, fontWeight: 500 }}>
      {action}
    </span>
  );
}

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('system');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/system-logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabFilteredLogs = logs.filter((log) => {
    const logAction = (log.action || '').toUpperCase();
    const performerRole = (log.performedBy?.role || '').toLowerCase();

    const isMaintenanceAction = logAction.includes('BACKUP') || performerRole === 'system';

    if (activeTab === 'maintenance') {
      return isMaintenanceAction;
    } else {
      return !isMaintenanceAction;
    }
  });

  const filteredLogs = tabFilteredLogs.filter((log) => {
    const performerName = (log.performedBy?.name || '').toLowerCase();
    const performerRole = (log.performedBy?.role || '').toLowerCase();
    const logAction = (log.action || '').toUpperCase();

    if (
      performerRole === 'external' ||
      performerName.includes('book center') || 
      logAction.includes('PRINT') ||
      logAction.includes('RELEASE')
    ) {
      if (!logAction.includes('BACKUP') && !logAction.includes('USER')) {
        return false; 
      }
    }

    const q = search.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(q) ||
      (log.target || '').toLowerCase().includes(q) ||
      performerName.includes(q) ||
      performerRole.includes(q) ||
      (log.details || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 p-lg-5">
      <h4 className="page-title">System &amp; Maintenance Logs</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Monitor administrative staff workflow operations and automated cloud engine backups
      </p>

      <ul className="nav nav-tabs border-bottom mb-4" style={{ gap: '4px' }}>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 px-4 py-2 fw-semibold ${activeTab === 'system' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
            onClick={() => { setActiveTab('system'); setSearch(''); }}
            style={{ fontSize: 14, background: 'none', transition: 'all 0.2s' }}
          >
            <i className="bi bi-person-gear me-2" />
            System Action Logs
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 px-4 py-2 fw-semibold ${activeTab === 'maintenance' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
            onClick={() => { setActiveTab('maintenance'); setSearch(''); }}
            style={{ fontSize: 14, background: 'none', transition: 'all 0.2s' }}
          >
            <i className="bi bi-cloud-check me-2" />
            Cloud Maintenance Logs
          </button>
        </li>
      </ul>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder={activeTab === 'system' ? "Search actions, handlers, roles..." : "Search backup files, statuses, details..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mb-0">
              {activeTab === 'system' ? 'Staff & Operational Records' : 'Automated Cloud Snapshots'} ({filteredLogs.length})
            </h6>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted small">
              Loading transaction records...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No index modifications match your query parameters.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    <th className="fw-semibold text-dark border-top-0">Date &amp; Time</th>
                    <th className="fw-semibold text-dark border-top-0">{activeTab === 'system' ? 'Operator' : 'Trigger Agent'}</th>
                    <th className="fw-semibold text-dark border-top-0">Role</th>
                    <th className="fw-semibold text-dark border-top-0">Action Type</th>
                    <th className="fw-semibold text-dark border-top-0">{activeTab === 'system' ? 'Target Space' : 'Backup Identifier'}</th>
                    <th className="fw-semibold text-dark border-top-0">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                        {fmtDate(log.createdAt)}
                      </td>
                      <td className="text-primary fw-medium">
                        {log.performedBy?.name || '—'}
                      </td>
                      <td className="text-secondary text-uppercase" style={{ fontSize: 12 }}>
                        {log.performedBy?.role || '—'}
                      </td>
                      <td>
                        {getActionBadge(log.action)}
                      </td>
                      <td className="text-secondary fw-mono" style={{ fontSize: 13 }}>
                        {log.target || '—'}
                      </td>
                      <td className="text-muted small" style={{ whiteSpace: 'pre-wrap' }}>
                        {renderDetails(log.details)}
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