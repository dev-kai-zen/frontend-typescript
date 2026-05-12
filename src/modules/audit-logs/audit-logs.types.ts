/**
 * DTOs for `/api/v1/audit-logs`.
 * Shapes follow Sequelize models (snake_case) returned by the backend.
 */

export type AuditLogDto = {
  id: string;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  change_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
};

export type ListAuditLogsQuery = {
  action?: string;
  entity_type?: string;
  limit?: number;
  offset?: number;
};
