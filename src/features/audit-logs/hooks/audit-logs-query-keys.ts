import type { ListAuditLogsQuery } from "../types/audit-logs.types";

export const auditLogsKeys = {
  all: ["audit-logs"] as const,
  list: (query: ListAuditLogsQuery) =>
    [...auditLogsKeys.all, "list", query] as const,
};
