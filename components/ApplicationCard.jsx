import React from 'react';

const ApplicationCard = ({ label, count, color }) => {
  const cardStyle = {
    flex: '1', minWidth: '160px', padding: '20px', background: color,
    color: 'white', borderRadius: '6px', textAlign: 'center',
    fontFamily: 'sans-serif', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{count}</h3>
      <p style={{ margin: '0', fontWeight: 'bold', opacity: '0.9' }}>{label}</p>
    </div>
  );
};

export default ApplicationCard;