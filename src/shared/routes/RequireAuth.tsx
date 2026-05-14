import { useAuthStore } from "../../features/auth/auth-store";
import { useLocation } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";

/** Redirects to `/login` until the app has checked session storage and optionally refreshed the user. */
export default function RequireAuth() {
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
  