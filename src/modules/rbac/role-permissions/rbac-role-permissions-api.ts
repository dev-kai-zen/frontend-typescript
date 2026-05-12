import apiClient from "../../../shared/api/api-client";
import type { RbacRolePermissionDto } from "./rbac-role-permissions.types";

type ListResponse = { data: RbacRolePermissionDto[] };
type SetResponse = { data: RbacRolePermissionDto[] };

/**
 * GET /api/v1/rbac/roles/:roleId/permissions
 */
export async function fetchRolePermissions(
  roleId: number,
): Promise<RbacRolePermissionDto[]> {
  const body = (await apiClient.get(
    `/api/v1/rbac/roles/${roleId}/permissions`,
  )) as ListResponse;
  return body.data ?? [];
}

/**
 * PUT /api/v1/rbac/roles/:roleId/permissions — replaces the full permission set for the role.
 */
export async function setRolePermissions(
  roleId: number,
  permissionIds: number[],
): Promise<RbacRolePermissionDto[]> {
  const body = (await apiClient.put(
    `/api/v1/rbac/roles/${roleId}/permissions`,
    { permissionIds },
  )) as SetResponse;
  return body.data ?? [];
}
