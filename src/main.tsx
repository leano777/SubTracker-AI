import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

// Using full RouterApp with ModernAppShell and all features
import RouterApp from "./RouterApp.tsx";
// Temporarily disabled to see actual errors
// import { SimpleErrorBoundary } from "./components/SimpleErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <RouterApp />
);
