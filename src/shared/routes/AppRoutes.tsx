import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/auth-store";
import LoginPage from "../../modules/auth/LoginPage";
import MainLayout from "../shell/MainLayout";
import NotFoundPage from "../pages/NotFoundPage";
import RestrictedPage from "../pages/RestrictedPage";
import { viewerMayAccessNavItem } from "./route-permission";
import type { RouteNavItem, RouteNavLeaf } from "./route-nav-types";
import { isRouteNavGroup } from "./route-nav-types";
import { ROUTES_NAV_TREE } from "./routesConfig";
import RequireAuth from "./RequireAuth";

// Get the routes from the routesConfig (Like getting the leaves from the tree)
function collectLayoutLeavesFromTree(
  items: RouteNavItem[],
  accumulated: RouteNavLeaf[],
): void {
  for (const item of items) {
    if (isRouteNavGroup(item)) {
      collectLayoutLeavesFromTree(item.children, accumulated);
    } else {
      accumulated.push(item);
    }
  }
}

// Get the leaves from the tree
function navTreeToLayoutRouteLeaves(items: RouteNavItem[]): RouteNavLeaf[] {
  const leaves: RouteNavLeaf[] = [];
  collectLayoutLeavesFromTree(items, leaves);
  return leaves;
}

// Routes from the routesConfig (Leaves from the tree)
const layoutRouteLeaves = navTreeToLayoutRouteLeaves(ROUTES_NAV_TREE);

// Check if the user has access to the leaf (route)
function canViewerOpenLeaf(
  permissionCodes: readonly string[],
  roleName: string | null,
  leaf: RouteNavLeaf,
): boolean {
  return viewerMayAccessNavItem(permissionCodes, roleName, leaf);
}

// Outlet for each leaf in `ROUTES_NAV_TREE`: check access, otherwise restricted screen.
function RouteLeafOutlet({ leaf }: { leaf: RouteNavLeaf }) {
  const permissionCodes = useAuthStore((s) => s.user?.permissions ?? []);
  const roleName = useAuthStore((s) => s.user?.role?.role_name ?? null);

  if (!canViewerOpenLeaf(permissionCodes, roleName, leaf)) {
    return <RestrictedPage />;
  }

  const Page = leaf.Page;
  return <Page />;
}


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          {layoutRouteLeaves.map((leaf) => (
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
