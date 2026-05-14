import type { RbacCategoryDto } from "../../categories/types/rbac-categories.types";
import type { RbacPermissionDto } from "../../permissions/types/rbac-permissions.types";
import type { RbacRoleDto } from "../../roles/types/rbac-roles.types";

export type RolePermissionsMatrixSnapshot = {
  roles: RbacRoleDto[];
  categories: RbacCategoryDto[];
  catalog: RbacPermissionDto[];
  matrix: Record<number, number[]>;
};

export type CategoryBlock = {
  key: string;
  title: string;
  permissions: RbacPermissionDto[];
};
