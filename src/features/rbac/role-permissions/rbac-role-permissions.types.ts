/**
 * Join rows for `/api/v1/rbac/roles/:id/permissions`.
 */

export type RbacRolePermissionDto = {
  id: number;
  role_id: number;
  permission_id: number;
  created_at?: string;
  updated_at?: string;
};
