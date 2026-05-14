import apiClient from "../../../shared/api/api-client";
import type { AuditLogDto, ListAuditLogsQuery } from "../types/audit-logs.types";

type ListAuditLogsResponse = { data: AuditLogDto[] };

function buildParams(query: ListAuditLogsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.action !== undefined && query.action !== "") {
    params.action = query.action;
  }
  if (query.entity_type !== undefined && query.entity_type !== "") {
    params.entity_type = query.entity_type;
  }
  if (query.limit !== undefined) {
    params.limit = query.limit;
  }
  if (query.offset !== undefined) {
    params.offset = query.offset;
  }
  return params;
}

/**
 * GET /api/v1/audit-logs — newest first (`created_at` on the server).
 */
export async function fetchAuditLogs(
  query: ListAuditLogsQuery = {},
): Promise<AuditLogDto[]> {
  const body = (await apiClient.get("/api/v1/audit-logs", {
    params: buildParams(query),
  })) as ListAuditLogsResponse;
  return body.data ?? [];
}
