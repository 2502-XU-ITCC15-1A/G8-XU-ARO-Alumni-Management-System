import { useState, useEffect } from 'react';
import axios from 'axios';

const TYPE_META = {
  info: {
    label: 'Info',
    color: '#1e40af',
    bg: '#dbeafe',
    icon: 'bi-info-circle-fill',
  },
  success: {
    label: 'Success',
    color: '#166534',
    bg: '#dcfce7',
    icon: 'bi-check-circle-fill',
  },
  warning: {
    label: 'Warning',
    color: '#92400e',
    bg: '#fef9c3',
    icon: 'bi-exclamation-triangle-fill',
  },
  error: {
    label: 'Error',
    color: '#991b1b',
    bg: '#fee2e2',
    icon: 'bi-x-circle-fill',
  },
};

export default function AlumniNotification() {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);  

  useEffect(() => {
    axios
      .get('/api/notifications/my', { headers })
      .then(res => setNotifications(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    axios
      .get('/api/notifications/unread-count', { headers })  
      .then(res => setUnreadCount(res.data.count || 0))
      .catch(console.error);
  }, [headers]);

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);  
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, { headers });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(unreadCount - 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="page-title mb-1">Notifications</h4>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Updates about your account, application, and announcements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#1e2d5e', color: '#fff', fontSize: 13 }}
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <i className="bi bi-bell-slash" style={{ fontSize: 30 }} />
          <div className="mt-2">No notifications yet</div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {notifications.map((notif, idx) => {
              const meta = TYPE_META[notif.type] || TYPE_META.info; 

              return (
                <div
                  key={notif._id}
                  className="d-flex align-items-start gap-3 p-3"
                  style={{
                    borderBottom: idx !== notifications.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: notif.read ? '#fff' : '#f8fafc',
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: 42,
                      height: 42,
                      backgroundColor: meta.bg,
                      color: meta.color,
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${meta.icon}`} />
                  </div>

                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: 14 }}>
                      {notif.title}
                    </div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      {notif.message}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: '#1e2d5e',
                        color: '#fff',
                        fontSize: 12,
                      }}
                      onClick={() => markAsRead(notif._id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}