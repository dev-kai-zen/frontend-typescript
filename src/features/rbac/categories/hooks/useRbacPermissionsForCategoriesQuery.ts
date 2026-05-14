import { useQuery } from "@tanstack/react-query";

import { fetchRbacPermissions } from "../../permissions/services/rbac-permissions-api";
import { rbacPermissionsForCategoriesKeys } from "./rbac-permissions-for-categories-query-keys";

export function useRbacPermissionsForCategoriesQuery() {
  return useQuery({
    queryKey: rbacPermissionsForCategoriesKeys.all,
    queryFn: () => fetchRbacPermissions(),
  });
}
