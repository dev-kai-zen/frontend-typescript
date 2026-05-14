import { useQuery } from "@tanstack/react-query";

import { fetchRoleAssignmentsSnapshot } from "../services/role-assignments-history-snapshot";
import { roleAssignmentsHistoryKeys } from "./role-assignments-history-query-keys";

export function useRoleAssignmentsHistoryQuery() {
  return useQuery({
    queryKey: roleAssignmentsHistoryKeys.snapshot(),
    queryFn: fetchRoleAssignmentsSnapshot,
  });
}
