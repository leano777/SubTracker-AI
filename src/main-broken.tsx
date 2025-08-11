import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
// Initialize performance monitoring for Lighthouse optimization
import { initializeLighthouseOptimization } from './utils/performance'
// Import production monitoring for ST-042
import { initSentry } from './utils/sentry-config'
import './utils/production-monitoring' // Initialize production monitoring

// Initialize Sentry for production error tracking
initSentry();

// Start performance monitoring
if (process.env.NODE_ENV === 'development') {
  initializeLighthouseOptimization();
} else if (process.env.NODE_ENV === 'production') {
  // Production-specific initialization
  initializeLighthouseOptimization();
  console.log('🚀 ST-042 Production monitoring active');
}

import RouterApp from "./RouterApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterApp />
  </StrictMode>
);