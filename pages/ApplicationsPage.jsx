import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

const ApplicationsPage = ({ user, setUser }) => {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const loadData = () => {
    api.get('/api/applications')
      .then(res => setList(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoval = async (id) => {
    if (window.confirm("Delete this submission row profile permanently?")) {
      try {
        await api.delete(`/api/applications/${id}`);
        loadData();
      } catch (err) {
        alert("Deletion processing error.");
      }
    }
  };

  const filteredList = filter === 'All' ? list : list.filter(item => item.status === filter);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Navbar username={user.username} setUser={setUser} />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Tracked Applications</h2>
          <div>
            <label style={{ marginRight: '10px' }}>Filter Status:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }}>
              <option value="All">All Status Options</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Company</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Applied Date</th>
              <th style={{ padding: '12px' }}>Location</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px' }}>{item.company}</td>
                <td style={{ padding: '12px' }}>{item.role}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#34495e', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.status}</span>
                </td>
                <td style={{ padding: '12px' }}>{item.applied_on}</td>
                <td style={{ padding: '12px' }}>{item.location || 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => navigate(`/edit/${item.id}`, { state: { app: item } })} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', marginRight: '5px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleRemoval(item.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsPage;