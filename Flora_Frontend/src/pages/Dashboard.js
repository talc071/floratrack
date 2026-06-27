import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PlantCard from '../components/PlantCard';
import DataTable from '../components/DataTable';
import LiveNotifications from '../components/LiveNotifications';
import { getMyPlants } from '../services/plantsService';
import { logCareAction } from '../services/careLogsService';
import '../App.css';
import './Dashboard.css';

const HEALTH_LABEL = {
  healthy:          { label: 'Healthy',         color: '#2e7d32', bg: '#e8f5e9' },
  'needs-attention':{ label: 'Needs Attention',  color: '#e65100', bg: '#fff3e0' },
  critical:         { label: 'Critical',         color: '#c62828', bg: '#ffeaea' },
};

const TABLE_COLUMNS = [
  { key: 'name',    label: 'Plant' },
  { key: 'species', label: 'Species' },
  { key: 'location',label: 'Location' },
  { key: 'wateringFrequencyDays', label: 'Watering (days)' },
  {
    key: 'healthStatus',
    label: 'Health Status',
    render: (val) => {
      const c = HEALTH_LABEL[val] || HEALTH_LABEL.healthy;
      return (
        <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '0.78rem' }}>
          {c.label}
        </span>
      );
    },
  },
  {
    key: 'lastWatered',
    label: 'Last Watered',
    render: (val) => val ? new Date(val).toLocaleDateString('en-GB') : '—',
  },
  { key: 'notes', label: 'Notes' },
];

const FILTERS = ['all', 'healthy', 'needs-attention', 'critical'];

const needsWateringToday = (plant) => {
  if (!plant.lastWatered) return true;
  const daysSince = (Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);
  return daysSince >= (plant.wateringFrequencyDays || 7);
};

function Dashboard() {
  const [plants,   setPlants]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all');
  const [watering, setWatering] = useState({});
  const navigate = useNavigate();

  const loadPlants = useCallback(() => {
    setLoading(true);
    getMyPlants()
      .then(setPlants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPlants(); }, [loadPlants]);

  const handleWater = async (plant) => {
    setWatering((w) => ({ ...w, [plant.plantId]: true }));
    try {
      await logCareAction({ plantId: plant.plantId, actionType: 'watering' });
      loadPlants();
    } catch {
      // silently ignore – plant list will still refresh
    } finally {
      setWatering((w) => ({ ...w, [plant.plantId]: false }));
    }
  };

  const thirsty  = plants.filter(needsWateringToday);
  const filtered = filter === 'all' ? plants : plants.filter((p) => p.healthStatus === filter);

  const stats = {
    total:     plants.length,
    healthy:   plants.filter((p) => p.healthStatus === 'healthy').length,
    attention: plants.filter((p) => p.healthStatus === 'needs-attention').length,
    critical:  plants.filter((p) => p.healthStatus === 'critical').length,
  };

  return (
    <div className="page-layout">
      <Navbar />

      <main className="page-content">
        <div className="dashboard-header-row">
          <div>
            <h1 className="page-title">🌿 Plant Dashboard</h1>
            <p className="page-subtitle">Monitor and manage all your plants in one place.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/plants/add')}>
            + Add Plant
          </button>
        </div>

        {/* Stats summary */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderTopColor: 'var(--color-primary)' }}>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Plants</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: '#4caf50' }}>
            <div className="stat-value">{stats.healthy}</div>
            <div className="stat-label">Healthy</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: '#ff9800' }}>
            <div className="stat-value">{stats.attention}</div>
            <div className="stat-label">Needs Attention</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: '#f44336' }}>
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>

        {loading && <div className="loading-spinner">Loading plants…</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <LiveNotifications onRefresh={loadPlants} />
        )}

        {!loading && !error && (
          <>
            {/* Needs watering today */}
            {thirsty.length > 0 && (
              <div className="watering-alert-box">
                <h2 className="watering-alert-title">💧 Needs Watering Today ({thirsty.length})</h2>
                <div className="watering-list">
                  {thirsty.map((plant) => (
                    <div key={plant.plantId} className="watering-item">
                      <span
                        className="watering-plant-name"
                        onClick={() => navigate(`/plants/${plant.plantId}`)}
                      >
                        🌱 {plant.name}
                        <span className="watering-plant-sub"> — {plant.location}</span>
                      </span>
                      <button
                        className="btn-water-done"
                        disabled={watering[plant.plantId]}
                        onClick={() => handleWater(plant)}
                      >
                        {watering[plant.plantId] ? 'Saving…' : '✓ Done'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cards section */}
            <div className="section-header">
              <h2 className="section-title">Plant Cards</h2>
              <div className="filter-tabs">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`filter-tab ${filter === f ? 'active' : ''}`}
                  >
                    {f === 'all' ? 'All' : f === 'needs-attention' ? 'Needs Attention' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                {plants.length === 0 ? (
                  <>
                    <h3>No plants yet</h3>
                    <p>Add your first plant to get started.</p>
                    <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/plants/add')}>
                      + Add Plant
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No plants match this filter</h3>
                    <p>Try selecting a different health status above.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="cards-grid">
                {filtered.map((plant) => (
                  <PlantCard
                    key={plant.plantId}
                    plant={plant}
                    onWater={handleWater}
                    watering={!!watering[plant.plantId]}
                  />
                ))}
              </div>
            )}

            {/* Data Table section */}
            <h2 className="section-title" style={{ marginTop: '44px', marginBottom: '16px' }}>
              All Plants — Data Table
            </h2>
            <DataTable
              columns={TABLE_COLUMNS}
              data={plants}
              emptyMessage="You have no plants yet. Add one from the dashboard."
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
