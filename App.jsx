import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ApplicationsPage from './pages/ApplicationsPage';
import AddApplicationPage from './pages/AddApplicationPage';
import EditApplicationPage from './pages/EditApplicationPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/me')
      .then(res => {
        if (res.data.logged_in) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Authenticating Session Session Token...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Flow */}
        <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />

        {/* Protected Dashboard and Activity Flow */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard user={user} setUser={setUser} /></ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute><ApplicationsPage user={user} setUser={setUser} /></ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute><AddApplicationPage user={user} setUser={setUser} /></ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute><EditApplicationPage user={user} setUser={setUser} /></ProtectedRoute>
        } />

        {/* Root Fallback Redirection */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;