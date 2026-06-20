import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getPlantHistory, updatePlant, deletePlant } from '../services/plantsService';
import { logCareAction } from '../services/careLogsService';
import { getSession } from '../services/authService';
import { connectSocket, onSocketEvent, subscribeToPlant } from '../services/socketService';
import '../App.css';
import './PlantProfilePage.css';

const HEALTH_CONFIG = {
  healthy:          { label: 'Healthy',         color: '#2e7d32', bg: '#e8f5e9' },
  'needs-attention':{ label: 'Needs Attention',  color: '#e65100', bg: '#fff3e0' },
  critical:         { label: 'Critical',         color: '#c62828', bg: '#ffeaea' },
};

const ACTION_ICON = { watering: '💧', fertilizing: '🌱' };
const LOCATIONS = ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Balcony', 'Garden', 'Bathroom', 'Other'];

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtFull = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function PlantProfilePage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const session    = getSession();
  const canEdit    = session && ['admin', 'manager'].includes(session.userRole);
  const canDelete  = session && session.userRole === 'admin';

  const [plant,    setPlant]    = useState(null);
  const [owner,    setOwner]    = useState(null);
  const [shared,   setShared]   = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [actioning, setActioning] = useState('');
  const [editing,  setEditing]  = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getPlantHistory(id)
      .then(({ plant: p, owner: o, sharedUsers, careLogs }) => {
        setPlant(p);
        setOwner(o);
        setShared(sharedUsers || []);
        setLogs(careLogs);
        setEditForm({
          name: p.name,
          species: p.species,
          location: p.location,
          wateringFrequencyDays: p.wateringFrequencyDays,
          healthStatus: p.healthStatus,
          notes: p.notes || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    connectSocket();
    subscribeToPlant(Number(id));
    const off = onSocketEvent('careLog:created', (payload) => {
      if (payload.plantId === Number(id)) load();
    });
    return () => off();
  }, [id, load]);

  const handleAction = async (actionType) => {
    setActioning(actionType);
    try {
      await logCareAction({ plantId: Number(id), actionType });
      load();
    } finally {
      setActioning('');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlant(id, {
        ...editForm,
        wateringFrequencyDays: Number(editForm.wateringFrequencyDays),
      });
      setEditing(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${plant.name}" permanently?`)) return;
    try {
      await deletePlant(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content"><div className="loading-spinner">Loading plant…</div></main>
      <Footer />
    </div>
  );

  if (error && !plant) return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <div className="alert alert-error">{error || 'Plant not found.'}</div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>← Back</button>
      </main>
      <Footer />
    </div>
  );

  const health = HEALTH_CONFIG[plant.healthStatus] || HEALTH_CONFIG.healthy;

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <button className="btn-back" onClick={() => navigate('/')}>← Back to Dashboard</button>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="profile-header">
          <div>
            <h1 className="profile-plant-name">{plant.name}</h1>
            <p className="profile-species">{plant.species}</p>
            {owner && (
              <p className="profile-owner">Owner: {owner.firstName} {owner.lastName}</p>
            )}
          </div>
          <span className="profile-health-badge" style={{ background: health.bg, color: health.color }}>
            {health.label}
          </span>
        </div>

        {editing ? (
          <div className="settings-card profile-edit-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={editForm.name} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="species">Species</label>
                <input id="species" name="species" value={editForm.species} onChange={handleEditChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <select id="location" name="location" value={editForm.location} onChange={handleEditChange}>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="wateringFrequencyDays">Watering (days)</label>
                <input id="wateringFrequencyDays" name="wateringFrequencyDays" type="number" min="1" value={editForm.wateringFrequencyDays} onChange={handleEditChange} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="healthStatus">Health Status</label>
              <select id="healthStatus" name="healthStatus" value={editForm.healthStatus} onChange={handleEditChange}>
                <option value="healthy">Healthy</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows={3} value={editForm.notes} onChange={handleEditChange} />
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-info-grid">
              <div className="profile-info-card">
                <div className="profile-info-label">📍 Location</div>
                <div className="profile-info-value">{plant.location}</div>
              </div>
              <div className="profile-info-card">
                <div className="profile-info-label">💧 Watering Frequency</div>
                <div className="profile-info-value">Every {plant.wateringFrequencyDays} day(s)</div>
              </div>
              <div className="profile-info-card">
                <div className="profile-info-label">🗓 Last Watered</div>
                <div className="profile-info-value">{fmt(plant.lastWatered)}</div>
              </div>
              <div className="profile-info-card">
                <div className="profile-info-label">🌿 Last Fertilized</div>
                <div className="profile-info-value">{fmt(plant.lastFertilized)}</div>
              </div>
              <div className="profile-info-card">
                <div className="profile-info-label">📅 Date Added</div>
                <div className="profile-info-value">{fmt(plant.createDate)}</div>
              </div>
              {plant.notes && (
                <div className="profile-info-card profile-info-card--wide">
                  <div className="profile-info-label">📝 Notes</div>
                  <div className="profile-info-value">{plant.notes}</div>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <button className="btn btn-primary" disabled={actioning === 'watering'} onClick={() => handleAction('watering')}>
                {actioning === 'watering' ? 'Saving…' : '💧 Log Watering'}
              </button>
              <button className="btn btn-secondary" disabled={actioning === 'fertilizing'} onClick={() => handleAction('fertilizing')}>
                {actioning === 'fertilizing' ? 'Saving…' : '🌱 Log Fertilizing'}
              </button>
              {canEdit && (
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Edit Plant</button>
              )}
              {canDelete && (
                <button className="btn btn-danger" onClick={handleDelete}>🗑 Delete Plant</button>
              )}
            </div>
          </>
        )}

        {shared.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: 36, marginBottom: 16 }}>Shared With</h2>
            <ul className="shared-users-list">
              {shared.map((u) => (
                <li key={u.userId}>{u.firstName} {u.lastName} ({u.accessLevel})</li>
              ))}
            </ul>
          </>
        )}

        <h2 className="section-title" style={{ marginTop: 36, marginBottom: 16 }}>Care Log History</h2>
        {logs.length === 0 ? (
          <div className="empty-state"><p>No care actions logged yet.</p></div>
        ) : (
          <div className="timeline">
            {logs.map((log) => (
              <div key={log.logId} className="timeline-item">
                <div className="timeline-icon">{ACTION_ICON[log.actionType] || '📋'}</div>
                <div className="timeline-body">
                  <div className="timeline-action">
                    {log.actionType.charAt(0).toUpperCase() + log.actionType.slice(1)}
                  </div>
                  <div className="timeline-date">{fmtFull(log.performedAt)}</div>
                  {log.notes && <div className="timeline-notes">{log.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default PlantProfilePage;
