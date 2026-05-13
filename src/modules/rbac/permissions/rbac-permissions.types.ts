/**
 * DTOs for `/api/v1/rbac/permissions`.
 * Shapes follow the Sequelize models (snake_case) returned by the backend.
 */

export type { RbacCategoryDto } from "../categories/rbac-categories.types";

export type RbacPermissionDto = {
  id: number;
  permission_code: string;
  permission_description: string | null;
  category_id: number | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateRbacPermissionPayload = {
  permissionCode: string;
  permissionDescription?: string | null;
  categoryId?: number | null;
};

export type UpdateRbacPermissionPayload = {
  permissionCode?: string;
  permissionDescription?: string | null;
  categoryId?: number | null;
};
