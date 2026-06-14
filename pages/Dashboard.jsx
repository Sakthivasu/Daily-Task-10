import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ApplicationCard from '../components/ApplicationCard';
import api from '../api';

const Dashboard = ({ user, setUser }) => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/applications/stats')
      .then(res => setMetrics(res.data))
      .catch(() => setError('Error syncing tracking metrics from server data layers.'));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Navbar username={user.username} setUser={setUser} />
      <div style={{ padding: '20px' }}>
        <h2>Metrics Dashboard</h2>
        {error && <p style={{ color: '#e74c3c' }}>{error}</p>}

        {metrics && (
          <>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
              <ApplicationCard label="Total Apps" count={metrics.total} color="#2c3e50" />
              <ApplicationCard label="Applied" count={metrics.status_counts.Applied} color="#3498db" />
              <ApplicationCard label="Shortlisted" count={metrics.status_counts.Shortlisted} color="#f1c40f" />
              <ApplicationCard label="Interviews" count={metrics.status_counts['Interview Scheduled']} color="#e67e22" />
              <ApplicationCard label="Offers" count={metrics.status_counts['Offer Received']} color="#2ecc71" />
              <ApplicationCard label="Rejected" count={metrics.status_counts.Rejected} color="#e74c3c" />
            </div>

            <h3>Recent Tracking Logs</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Company</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Date Applied</th>
                </tr>
              </thead>
              {/* NEW FIXED CODE */}
<tbody>
  {/* The ?. map prevents the crash if latest_applications is missing */}
  {metrics.latest_applications?.map(app => (
    <tr key={app.id} style={{ borderBottom: '1px solid #dee2e6' }}>
      <td style={{ padding: '12px' }}>{app.company}</td>
      <td style={{ padding: '12px' }}>{app.role}</td>
      <td style={{ padding: '12px' }}>
        <span style={{ background: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{app.status}</span>
      </td>
      <td style={{ padding: '12px' }}>{app.applied_on}</td>
    </tr>
  ))}
  {/* Added safe fallback logic here too */}
  {(!metrics.latest_applications || metrics.latest_applications.length === 0) && (
    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>No submission rows found.</td></tr>
  )}
</tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;