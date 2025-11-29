import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import DesignSystemDemo from "./pages/DesignSystemDemo";
import { ThemeTest } from "./components/ThemeTest";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/design-system" element={<DesignSystemDemo />} />
      <Route path="/theme-test" element={<ThemeTest />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};