import React, { useEffect, useState } from 'react';
import { get, post } from '../utils/api';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ShareIcon from '@mui/icons-material/Share';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import './Notifications.css';

const typeIcons = {
  like: <FavoriteIcon style={{ color: '#B71C1C' }} />,
  comment: <ChatBubbleIcon style={{ color: '#1565C0' }} />,
  follow: <PersonAddIcon style={{ color: '#1565C0' }} />,
  upload: <FiberNewIcon style={{ color: '#D32F2F' }} />,
  share: <ShareIcon style={{ color: '#B71C1C' }} />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    get('/api/notifications')
      .then(setNotifications)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => post(`/api/notifications/${n._id}/read`, {}))
      );
      fetchNotifications();
    } catch {}
    setMarking(false);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <NotificationsIcon fontSize="large" style={{ color: '#B71C1C', marginRight: 8 }} />
        <h1>Notifications</h1>
        <button className="mark-all-btn" onClick={markAllAsRead} disabled={marking}>
          <DoneAllIcon /> Mark all as read
        </button>
      </div>
      {loading ? (
        <div className="notifications-loading">Loading...</div>
      ) : error ? (
        <div className="notifications-error">Error: {error}</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">No notifications yet.</div>
      ) : (
        <ul className="notifications-list">
          {notifications.map(n => (
            <li key={n._id} className={`notification-card${n.read ? ' read' : ''}`}>
              <span className="notification-icon">{typeIcons[n.type] || <NotificationsIcon />}</span>
              <span className="notification-message">{n.message}</span>
              <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 