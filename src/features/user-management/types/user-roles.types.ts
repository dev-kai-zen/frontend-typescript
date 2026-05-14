/**
 * DTOs for `/api/v1/rbac/users/:userId/roles`.
 */

export type UserRoleLinkDto = {
  id: number;
  user_id: number;
  role_id: number;
  assigned_by: number;
  /** Present when the API returns Sequelize timestamps (`rbac_user_roles`). */
  created_at?: string | null;
  updated_at?: string | null;
};

export type SetUserRolesPayload = {
  roleIds: number[];
  assignedBy: number;
};
