import { useQuery } from "@tanstack/react-query";

import { fetchAuditLogs } from "../services/audit-logs-api";
import type { ListAuditLogsQuery } from "../types/audit-logs.types";
import { auditLogsKeys } from "./audit-logs-query-keys";

export function useAuditLogsQuery(query: ListAuditLogsQuery) {
  return useQuery({
    queryKey: auditLogsKeys.list(query),
    queryFn: () => fetchAuditLogs(query),
  });
}
