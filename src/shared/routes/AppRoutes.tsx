import { LinearProgress } from "@mui/material";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "../../modules/auth/authStore";
import LoginPage from "../../modules/auth/LoginPage";
import MainLayout from "../shell/MainLayout";
import NotFoundPage from "./NotFoundPage";
import { viewerMayAccessNavItem } from "./route-permission";
import type { RouteNavLeaf } from "./route-nav-types";
import { getLayoutRouteLeaves } from "./route-nav";

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

/** Enforces optional `permission` / `permissionAny` / `permissionAll` from the route config. */
function RouteLeafOutlet({ leaf }: { leaf: RouteNavLeaf }) {
  const permissionCodes = useAuthStore((s) => s.user?.permissions ?? []);
  const roleName = useAuthStore((s) => s.user?.role?.role_name ?? null);

  if (!viewerMayAccessNavItem(permissionCodes, roleName, leaf)) {
    return <NotFoundPage />;
  }

  return leaf.element;
}

export default function AppRoutes() {
  const layoutLeaves = getLayoutRouteLeaves();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          {layoutLeaves.map((leaf) => (
            <Route
              key={leaf.key}
              path={leaf.path}
              element={<RouteLeafOutlet leaf={leaf} />}
            />
          ))}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
