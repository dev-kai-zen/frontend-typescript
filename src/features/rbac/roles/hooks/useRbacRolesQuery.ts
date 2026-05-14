import { useQuery } from "@tanstack/react-query";

import { fetchRbacRoles } from "../services/rbac-roles-api";
import { rbacRolesKeys } from "./rbac-roles-query-keys";

export function useRbacRolesQuery() {
  return useQuery({
    queryKey: rbacRolesKeys.list(),
    queryFn: fetchRbacRoles,
  });
}
