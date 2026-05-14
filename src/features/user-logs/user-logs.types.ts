/**
 * DTOs for `/api/v1/user-logs`.
 * List responses use Sequelize snake_case; query params use camelCase (controller schema).
 */

export type UserLogDto = {
  id: number;
  user_id: number | null;
  action: string;
  module: string | null;
  description: string | null;
  method: string | null;
  route: string | null;
  status_code: number | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

/** GET `/api/v1/user-logs` query — mirrors backend `listUserLogsQuerySchema`. */
export type ListUserLogsQuery = {
  userId?: number;
  action?: string;
  module?: string;
  limit?: number;
  offset?: number;
};
