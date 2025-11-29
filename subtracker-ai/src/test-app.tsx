import React from 'react';

export const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test App is Working!</h1>
      <p>If you see this, React is loading correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};