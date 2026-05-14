import { useQuery } from "@tanstack/react-query";

import { fetchUserManagementSnapshot } from "../services/user-management-snapshot";
import { userManagementKeys } from "./user-management-query-keys";

export function useUserManagementSnapshotQuery() {
  return useQuery({
    queryKey: userManagementKeys.snapshot(),
    queryFn: fetchUserManagementSnapshot,
  });
}
