/**
 * DTOs for `/api/v1/rbac/permissions`.
 * Shapes follow the Sequelize models (snake_case) returned by the backend.
 */

export type { RbacCategoryDto } from "../categories/types/rbac-categories.types";

export type RbacPermissionDto = {
  id: number;
  permission_code: string;
  permission_description: string | null;
  category_id: number | null;
  /** When omitted by older APIs, treat as active. */
  is_active?: boolean;
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
  isActive?: boolean;
};
