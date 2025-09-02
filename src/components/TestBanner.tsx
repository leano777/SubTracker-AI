import React from 'react';

export const TestBanner: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '50px',
      backgroundColor: 'red',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      fontSize: '20px',
      fontWeight: 'bold'
    }}>
      🚨 TEST BANNER - IF YOU SEE THIS, CHANGES ARE WORKING! 🚨
    </div>
  );
};