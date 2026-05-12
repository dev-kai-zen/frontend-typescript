/**
 * DTOs for `/api/v1/rbac/groups` (snake_case from Sequelize).
 */

export type RbacGroupDto = {
  id: number;
  group_name: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateRbacGroupPayload = {
  groupName: string;
};

export type UpdateRbacGroupPayload = {
  groupName: string;
};
