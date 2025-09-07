import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Simple test to see if React loads
const TestApp = () => {
  console.log('TestApp rendering');
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>✅ React is Working!</h1>
      <p>If you see this, the basic React setup is functioning.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
      <hr />
      <p>Now attempting to load the full app...</p>
    </div>
  );
};

console.log('main.tsx: Starting...');

try {
  const rootElement = document.getElementById("root");
  console.log('main.tsx: Root element found:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  console.log('main.tsx: React root created');
  
  root.render(
    <StrictMode>
      <TestApp />
    </StrictMode>
  );
  
  console.log('main.tsx: App rendered successfully');
  
  // After confirming React works, try loading the real app
  setTimeout(() => {
    console.log('main.tsx: Attempting to load full app...');
    import('./App-loader').then(module => {
      console.log('main.tsx: App module loaded');
      const { AppLoader } = module;
      root.render(
        <StrictMode>
          <AppLoader />
        </StrictMode>
      );
    }).catch(err => {
      console.error('main.tsx: Failed to load app:', err);
      root.render(
        <StrictMode>
          <div style={{ padding: '20px', color: 'red' }}>
            <h1>Failed to load app</h1>
            <pre>{err.message}</pre>
            <pre>{err.stack}</pre>
          </div>
        </StrictMode>
      );
    });
  }, 1000);
  
} catch (error) {
  console.error('main.tsx: Fatal error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Fatal Error</h1>
      <pre>${error}</pre>
    </div>
  `;
}