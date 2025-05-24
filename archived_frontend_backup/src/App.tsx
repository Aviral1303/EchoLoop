import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';

// Layouts
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<MainLayout requireAuth={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;
