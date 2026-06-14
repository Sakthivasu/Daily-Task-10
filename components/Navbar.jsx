import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Navbar = ({ username, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.get('/api/logout');
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error("Logout execution failed:", err);
    }
  };

  const containerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1a252f', padding: '12px 24px', color: '#fff', fontFamily: 'sans-serif'
  };

  const navLink = {
    color: '#fff', marginRight: '20px', textDecoration: 'none', fontWeight: '500'
  };

  return (
    <nav style={containerStyle}>
      <div>
        <Link to="/dashboard" style={navLink}>📈 Dashboard</Link>
        <Link to="/applications" style={navLink}>💼 Applications</Link>
        <Link to="/add" style={navLink}>➕ Add Application</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span>User: <strong>{username}</strong></span>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;