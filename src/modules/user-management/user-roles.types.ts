/**
 * DTOs for `/api/v1/rbac/users/:userId/roles`.
 */

a

export type SetUserRolesPayload = {
  roleIds: number[];
  assignedBy: number;
};
