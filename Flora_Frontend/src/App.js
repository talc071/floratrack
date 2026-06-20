import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import PlantProfilePage from './pages/PlantProfilePage';
import AddPlantPage from './pages/AddPlantPage';
import CalendarPage from './pages/CalendarPage';
import { getSession } from './services/authService';

const ProtectedRoute = ({ children }) => {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"               element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/plants/add"     element={<ProtectedRoute><AddPlantPage /></ProtectedRoute>} />
        <Route path="/plants/:id"     element={<ProtectedRoute><PlantProfilePage /></ProtectedRoute>} />
        <Route path="/calendar"       element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/settings"       element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
