import { LinearProgress } from "@mui/material";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { useAuthStore } from "../modules/auth/authStore";
import HomePage from "../modules/home/HomePage";
import LoginPage from "../modules/login/LoginPage";
import MainLayout from "./shell/MainLayout";

/** Redirects to `/login` until the app has checked session storage and optionally refreshed the user. */
function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isReady = useAuthStore((s) => s.isReady);
  const location = useLocation();

  if (!isReady) {
    return <LinearProgress />;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
