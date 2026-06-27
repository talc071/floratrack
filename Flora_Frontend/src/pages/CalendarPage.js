import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getMyPlants } from '../services/plantsService';
import '../App.css';
import './CalendarPage.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const toDateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const buildTaskMap = (plants, year, month) => {
  const map = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  plants.forEach((plant) => {
    if (!plant.lastWatered || !plant.wateringFrequencyDays) return;
    const freq = plant.wateringFrequencyDays;
    let cursor = new Date(plant.lastWatered);
    cursor.setHours(0, 0, 0, 0);
    cursor = new Date(cursor.getTime() + freq * 86400000);

    const limit = new Date(year, month + 1, 10);
    while (cursor <= limit) {
      if (cursor.getFullYear() === year && cursor.getMonth() === month) {
        const key = toDateKey(cursor);
        if (!map[key]) map[key] = [];
        map[key].push({ plant, type: 'watering' });
      }
      cursor = new Date(cursor.getTime() + freq * 86400000);
    }
  });

  return map;
};

const buildCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
};

function CalendarPage() {
  const navigate  = useNavigate();
  const now       = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMyPlants()
      .then(setPlants)
      .finally(() => setLoading(false));
  }, []);

  const taskMap = buildTaskMap(plants, year, month);
  const days    = buildCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const todayKey = toDateKey(now);

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <h1 className="page-title">📅 Care Calendar</h1>
        <p className="page-subtitle">Monthly overview of upcoming watering tasks for all your plants.</p>

        {loading ? (
          <div className="loading-spinner">Loading…</div>
        ) : (
          <>
            {/* Month navigation */}
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <h2 className="cal-month-title">{MONTH_NAMES[month]} {year}</h2>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            {/* Calendar grid */}
            <div className="cal-grid">
              {DAY_NAMES.map((d) => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
              {days.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />;
                const key   = toDateKey(date);
                const tasks = taskMap[key] || [];
                const isToday = key === todayKey;
                const isSelected = selected && toDateKey(selected) === key;
                return (
                  <div
                    key={key}
                    className={`cal-cell ${isToday ? 'cal-cell--today' : ''} ${isSelected ? 'cal-cell--selected' : ''} ${tasks.length ? 'cal-cell--has-tasks' : ''}`}
                    onClick={() => setSelected(tasks.length ? date : null)}
                  >
                    <span className="cal-date-num">{date.getDate()}</span>
                    {tasks.length > 0 && (
                      <div className="cal-task-dots">
                        {tasks.slice(0, 3).map((t, ti) => (
                          <span key={ti} className="cal-dot">💧</span>
                        ))}
                        {tasks.length > 3 && <span className="cal-dot-more">+{tasks.length - 3}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected day panel */}
            {selected && (
              <div className="cal-day-panel">
                <h3 className="cal-day-panel-title">
                  Tasks for {selected.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className="cal-task-list">
                  {(taskMap[toDateKey(selected)] || []).map((t, i) => (
                    <div key={i} className="cal-task-item" onClick={() => navigate(`/plants/${t.plant.plantId}`)}>
                      <span className="cal-task-icon">💧</span>
                      <div>
                        <div className="cal-task-plant">{t.plant.name}</div>
                        <div className="cal-task-sub">{t.plant.species} · {t.plant.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="cal-legend">
              <span className="cal-legend-item"><span className="cal-legend-dot today-dot" /> Today</span>
              <span className="cal-legend-item">💧 Watering due</span>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CalendarPage;
