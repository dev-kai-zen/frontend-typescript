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

// =============================================================================
// Read this file top → bottom:
// (1) turn config tree into a flat route list  →  layoutRouteLeaves
// (2) helpers for route leaves
// (3) AppRoutes: wire Login, auth shell, layout, and those routes
// =============================================================================

// -----------------------------------------------------------------------------
// (1) Config tree → flat list of leaf routes React Router will register
// -----------------------------------------------------------------------------

/** Groups have `children` we walk into; leaves get appended to `accumulated`. */
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

function navTreeToLayoutRouteLeaves(items: RouteNavItem[]): RouteNavLeaf[] {
  const leaves: RouteNavLeaf[] = [];
  collectLayoutLeavesFromTree(items, leaves);
  return leaves;
}

/** Every URL registered under `<MainLayout />` lives here (after flattening groups). */
const layoutRouteLeaves = navTreeToLayoutRouteLeaves(ROUTES_NAV_TREE);

// -----------------------------------------------------------------------------
// (2) Helpers for leaf routes — permissions, then mounting the Page
// -----------------------------------------------------------------------------

/** Uses `permission` / `permissionAny` / `permissionAll` from the leaf’s config + auth store. */
function canViewerOpenLeaf(
  permissionCodes: readonly string[],
  roleName: string | null,
  leaf: RouteNavLeaf,
): boolean {
  return viewerMayAccessNavItem(permissionCodes, roleName, leaf);
}

/**
 * Outlet for each leaf in `ROUTES_NAV_TREE`: check access, otherwise restricted screen.
 * Order inside: read session → gate → render `Page`.
 */
function RouteLeafOutlet({ leaf }: { leaf: RouteNavLeaf }) {
  const permissionCodes = useAuthStore((s) => s.user?.permissions ?? []);
  const roleName = useAuthStore((s) => s.user?.role?.role_name ?? null);

  if (!canViewerOpenLeaf(permissionCodes, roleName, leaf)) {
    return <RestrictedPage />;
  }

  const Page = leaf.Page;
  return <Page />;
}

// -----------------------------------------------------------------------------
// (3) App route tree — public login, authenticated shell, configured layout routes
// -----------------------------------------------------------------------------

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
