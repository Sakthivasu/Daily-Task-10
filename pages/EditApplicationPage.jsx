import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

const EditApplicationPage = ({ user, setUser }) => {
  const { id } = useParams();
  const locationState = useLocation();
  const navigate = useNavigate();
  
  // Pre-fill state passed down smoothly from table button selection router navigation context
  const [form, setForm] = useState(locationState.state?.app || {
    company: '', role: '', status: 'Applied', applied_on: '', location: '', job_url: '', notes: ''
  });
  const [err, setErr] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/applications/${id}`, form);
      navigate('/applications');
    } catch (ex) {
      setErr('Database structural modification update execution rejected.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Navbar username={user.username} setUser={setUser} />
      <div style={{ maxWidth: '460px', margin: '30px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Modify Position Details</h2>
        {err && <div style={{ color: 'red', marginBottom: '15px' }}>{err}</div>}
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '10px' }}><label>Company</label>
            <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Role</label>
            <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}><label>Applied Date</label>
            <input type="date" value={form.applied_on} onChange={e => setForm({...form, applied_on: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Location</label>
            <input type="text" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '10px' }}><label>Listing URL</label>
            <input type="url" value={form.job_url || ''} onChange={e => setForm({...form, job_url: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}><label>Notes</label>
            <textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '8px', height: '70px', boxSizing: 'border-box' }}></textarea>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Commit Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditApplicationPage;