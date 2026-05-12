/**
 * DTOs for `/api/v1/rbac/roles`.
 * Shapes follow Sequelize models (snake_case) returned by the backend.
 */

export type RbacRoleDto = {
  id: number;
  role_name: string;
  role_description: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateRbacRolePayload = {
  roleName: string;
  roleDescription?: string | null;
};

export type UpdateRbacRolePayload = {
  roleName?: string;
  roleDescription?: string | null;
};
