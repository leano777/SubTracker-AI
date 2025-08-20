import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { Toaster } from "sonner";

export const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};