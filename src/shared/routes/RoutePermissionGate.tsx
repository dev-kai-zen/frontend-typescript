import type { ReactNode } from "react";

import { useAuthStore } from "../../modules/auth/auth-store";

import RestrictedPage from "../pages/RestrictedPage";
import { userCanAccessRoute } from "./route-access";

type RoutePermissionGateProps = {
  children: ReactNode;
  permissionsAny?: readonly string[];
  permissionsAll?: readonly string[];
};

export default function RoutePermissionGate({
  children,
  permissionsAny,
  permissionsAll,
}: RoutePermissionGateProps) {
  const user = useAuthStore((s) => s.user);
  const permissionList = user?.permissions ?? [];

  const allowed = userCanAccessRoute(permissionList, {
    permissionsAny,
    permissionsAll,
  });

  if (!allowed) {
    return <RestrictedPage />;
  }

  return <>{children}</>;
}
