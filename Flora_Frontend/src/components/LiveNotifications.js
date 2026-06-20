import React, { useEffect, useState } from 'react';
import { connectSocket, onSocketEvent } from '../services/socketService';
import './LiveNotifications.css';

function LiveNotifications({ onRefresh }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    connectSocket();

    const handlers = [
      onSocketEvent('plant:created', (payload) => {
        setNotifications((n) => [{ id: Date.now(), type: 'created', ...payload }, ...n].slice(0, 5));
        onRefresh?.();
      }),
      onSocketEvent('plant:updated', (payload) => {
        setNotifications((n) => [{ id: Date.now(), type: 'updated', ...payload }, ...n].slice(0, 5));
        onRefresh?.();
      }),
      onSocketEvent('plant:deleted', (payload) => {
        setNotifications((n) => [{ id: Date.now(), type: 'deleted', ...payload }, ...n].slice(0, 5));
        onRefresh?.();
      }),
      onSocketEvent('careLog:created', (payload) => {
        setNotifications((n) => [{ id: Date.now(), type: 'care', ...payload }, ...n].slice(0, 5));
        onRefresh?.();
      }),
    ];

    return () => handlers.forEach((off) => off());
  }, [onRefresh]);

  if (notifications.length === 0) return null;

  return (
    <div className="live-notifications">
      <div className="live-notifications-header">
        <span className="live-dot" /> Live Activity
      </div>
      {notifications.map((n) => (
        <div key={n.id} className={`live-notification live-notification--${n.type}`}>
          {n.message || 'Plant activity detected'}
        </div>
      ))}
    </div>
  );
}

export default LiveNotifications;
