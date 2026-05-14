import apiClient from "../../../../shared/api/api-client";
import type {
  CreateRbacRolePayload,
  RbacRoleDto,
  UpdateRbacRolePayload,
} from "../types/rbac-roles.types";

type ListRolesResponse = { data: RbacRoleDto[] };

/**
 * GET /api/v1/rbac/roles
 */
export async function fetchRbacRoles(): Promise<RbacRoleDto[]> {
  const body = (await apiClient.get(
    "/api/v1/rbac/roles",
  )) as ListRolesResponse;
  return body.data ?? [];
}

export async function createRbacRole(
  payload: CreateRbacRolePayload,
): Promise<RbacRoleDto> {
  return (await apiClient.post("/api/v1/rbac/roles", {
    roleName: payload.roleName.trim(),
    roleDescription:
      payload.roleDescription === undefined || payload.roleDescription === ""
        ? null
        : payload.roleDescription,
  })) as RbacRoleDto;
}

export async function updateRbacRole(
  id: number,
  payload: UpdateRbacRolePayload,
): Promise<RbacRoleDto> {
  const body: Record<string, unknown> = {};
  if (payload.roleName !== undefined) {
    body.roleName = payload.roleName.trim();
  }
  if (payload.roleDescription !== undefined) {
    body.roleDescription =
      payload.roleDescription === "" ? null : payload.roleDescription;
  }
  if (payload.isActive !== undefined) {
    body.isActive = payload.isActive;
  }
  return (await apiClient.patch(`/api/v1/rbac/roles/${id}`, body)) as RbacRoleDto;
}

export async function deleteRbacRole(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/rbac/roles/${id}`);
}
