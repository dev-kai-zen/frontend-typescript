import { useQuery } from "@tanstack/react-query";

import { fetchUserLogs } from "../services/user-logs-api";
import type { ListUserLogsQuery } from "../types/user-logs.types";
import { userLogsKeys } from "./user-logs-query-keys";

export function useUserLogsQuery(query: ListUserLogsQuery) {
  return useQuery({
    queryKey: userLogsKeys.list(query),
    queryFn: () => fetchUserLogs(query),
  });
}
