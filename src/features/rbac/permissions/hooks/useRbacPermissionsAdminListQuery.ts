import { useQuery } from "@tanstack/react-query";

import { fetchRbacPermissionsForAdminFilter } from "../services/rbac-permissions-admin-fetch";
import { rbacPermissionsKeys } from "./rbac-permissions-query-keys";

/** Permissions table rows for the admin filter (all / uncategorized / category id). */
export function useRbacPermissionsAdminListQuery(filterCategoryId: string) {
  return useQuery({
    queryKey: rbacPermissionsKeys.adminFilter(filterCategoryId),
    queryFn: () => fetchRbacPermissionsForAdminFilter(filterCategoryId),
  });
}
