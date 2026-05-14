import { useQuery } from "@tanstack/react-query";

import { fetchRbacPermissions } from "../services/rbac-permissions-api";
import { rbacPermissionsKeys } from "./rbac-permissions-query-keys";

/** Full permission catalog (optional category filter — matches `fetchRbacPermissions`). */
export function useRbacPermissionsListQuery(categoryId?: number) {
  return useQuery({
    queryKey: rbacPermissionsKeys.list(categoryId),
    queryFn: () => fetchRbacPermissions(categoryId),
  });
}
