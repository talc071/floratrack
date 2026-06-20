import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getSession } from '../services/authService';
import './Navbar.css';

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const session   = getSession();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🌿</span>
          <span>FloraTrack</span>
        </Link>

        <div className="navbar-links">
          <Link to="/"          className={`nav-link ${isActive('/')}`}>Dashboard</Link>
          <Link to="/plants/add"className={`nav-link ${location.pathname === '/plants/add' ? 'active' : ''}`}>Add Plant</Link>
          <Link to="/calendar"  className={`nav-link ${isActive('/calendar')}`}>Calendar</Link>
          <Link to="/settings"  className={`nav-link ${isActive('/settings')}`}>Settings</Link>
        </div>

        <div className="navbar-user">
          <span className="navbar-username">
            👤 {session?.firstName} {session?.lastName}
            <span className="navbar-role">{session?.userRole}</span>
          </span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
