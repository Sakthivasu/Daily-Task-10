import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

const AddApplicationPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: '', role: '', status: 'Applied',
    applied_on: new Date().toISOString().split('T')[0],
    location: '', job_url: '', notes: ''
  });
  const [err, setErr] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/applications', form);
      navigate('/applications');
    } catch (ex) {
      setErr('Failed to dispatch application parameter payload details.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Navbar username={user.username} setUser={setUser} />
      <div style={{ maxWidth: '460px', margin: '30px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Log New Position</h2>
        {err && <div style={{ color: 'red', marginBottom: '15px' }}>{err}</div>}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '10px' }}><label>Company *</label>
            <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Role *</label>
            <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Current Pipeline Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}><label>Applied Date *</label>
            <input type="date" value={form.applied_on} onChange={e => setForm({...form, applied_on: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Location</label>
            <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} placeholder="Remote, Hybrid, NYC..." />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Job URL</label>
            <input type="url" value={form.job_url} onChange={e => setForm({...form, job_url: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}><label>Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '8px', height: '70px', boxSizing: 'border-box' }}></textarea>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Record</button>
        </form>
      </div>
    </div>
  );
};

export default AddApplicationPage;