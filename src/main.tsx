import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Initialize performance monitoring for Lighthouse optimization
import { initializeLighthouseOptimization } from './utils/performance'

// Start performance monitoring
if (process.env.NODE_ENV === 'development') {
  initializeLighthouseOptimization();
}
import RouterApp from "./RouterApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterApp />
  </StrictMode>
);
