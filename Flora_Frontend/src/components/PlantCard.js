import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlantCard.css';

const HEALTH_CONFIG = {
  healthy:          { label: 'Healthy',         color: '#2e7d32', bg: '#e8f5e9', icon: '✅' },
  'needs-attention':{ label: 'Needs Attention',  color: '#e65100', bg: '#fff3e0', icon: '⚠️' },
  critical:         { label: 'Critical',         color: '#c62828', bg: '#ffeaea', icon: '🚨' },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function PlantCard({ plant, onWater, watering }) {
  const health   = HEALTH_CONFIG[plant.healthStatus] || HEALTH_CONFIG.healthy;
  const navigate = useNavigate();

  return (
    <div className="plant-card" style={{ borderTop: `4px solid ${health.color}` }}>
      <div className="plant-card-header">
        <div>
          <h3
            className="plant-name plant-name-link"
            onClick={() => navigate(`/plants/${plant.plantId}`)}
          >
            {plant.name}
          </h3>
          <p className="plant-species">{plant.species}</p>
        </div>
        <span className="health-badge" style={{ backgroundColor: health.bg, color: health.color }}>
          {health.icon} {health.label}
        </span>
      </div>

      <div className="plant-card-body">
        <div className="plant-info-row">
          <span className="plant-info-label">📍 Location</span>
          <span>{plant.location}</span>
        </div>
        <div className="plant-info-row">
          <span className="plant-info-label">💧 Watering</span>
          <span>Every {plant.wateringFrequencyDays} day(s)</span>
        </div>
        <div className="plant-info-row">
          <span className="plant-info-label">🗓 Last Watered</span>
          <span>{formatDate(plant.lastWatered)}</span>
        </div>
        {plant.notes && <p className="plant-notes">{plant.notes}</p>}
      </div>

      <div className="plant-card-footer">
        <button
          className="btn-card-secondary"
          onClick={() => navigate(`/plants/${plant.plantId}`)}
        >
          View Profile
        </button>
        {onWater && (
          <button
            className="btn-card-water"
            disabled={watering}
            onClick={() => onWater(plant)}
          >
            {watering ? 'Saving…' : '💧 Watered'}
          </button>
        )}
      </div>
    </div>
  );
}

export default PlantCard;
