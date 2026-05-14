import { useQuery } from "@tanstack/react-query";

import { fetchRolePermissionsMatrixSnapshot } from "../services/role-permissions-matrix-snapshot";
import { rolePermissionsMatrixKeys } from "./role-permissions-matrix-query-keys";

export function useRolePermissionsMatrixQuery() {
  return useQuery({
    queryKey: rolePermissionsMatrixKeys.snapshot(),
    queryFn: fetchRolePermissionsMatrixSnapshot,
  });
}
