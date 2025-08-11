import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

// Using full RouterApp with ModernAppShell and all features
import RouterApp from "./RouterApp.tsx";
// Global error boundary for the entire app
import { SimpleErrorBoundary } from "./components/SimpleErrorBoundary";

// Global fallback UI for critical app errors
const AppFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center max-w-lg mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          SubTracker Error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The application encountered a critical error and couldn't load properly. 
          This might be due to a network issue or a temporary problem.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reload Application
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear Data & Reload
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          If this problem persists, try clearing your browser cache or contact support.
        </p>
      </div>
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SimpleErrorBoundary fallback={<AppFallback />}>
      <RouterApp />
    </SimpleErrorBoundary>
  </StrictMode>
);
