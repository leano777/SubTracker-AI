import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#00ff00',
      color: '#000',
      padding: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 999999
    }}>
      ✅ APP IS LOADING! Time: {new Date().toLocaleTimeString()}
    </div>
  );
};