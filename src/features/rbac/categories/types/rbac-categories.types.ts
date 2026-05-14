/**
 * DTOs for `/api/v1/rbac/categories` (snake_case from Sequelize).
 */

export type RbacCategoryDto = {
  id: number;
  category_name: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateRbacCategoryPayload = {
  categoryName: string;
};

export type UpdateRbacCategoryPayload = {
  categoryName: string;
};
