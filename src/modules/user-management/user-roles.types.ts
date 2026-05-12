/**
 * DTOs for `/api/v1/rbac/users/:userId/roles`.
 */

export type UserRoleLinkDto = {
  id: number;
  user_id: number;
  role_id: number;
  assigned_by: number;
};

export type SetUserRolesPayload = {
  roleIds: number[];
  assignedBy: number;
};
