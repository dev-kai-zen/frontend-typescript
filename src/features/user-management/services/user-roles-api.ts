import apiClient from "../../../shared/api/api-client";

import type { SetUserRolesPayload, UserRoleLinkDto } from "../types/user-roles.types";

type ListResponse = { data: UserRoleLinkDto[] };
type SetResponse = { data: UserRoleLinkDto[] };

/**
 * GET /api/v1/rbac/users/:userId/roles
 */
export async function fetchUserRoles(userId: number): Promise<UserRoleLinkDto[]> {
  const body = (await apiClient.get(
    `/api/v1/rbac/users/${userId}/roles`,
  )) as ListResponse;
  return body.data ?? [];
}

/**
 * PUT /api/v1/rbac/users/:userId/roles — full replace for that user.
 */
export async function setUserRoles(
  userId: number,
  payload: SetUserRolesPayload,
): Promise<UserRoleLinkDto[]> {
  const body = (await apiClient.put(`/api/v1/rbac/users/${userId}/roles`, {
    roleIds: payload.roleIds,
    assignedBy: payload.assignedBy,
  })) as SetResponse;
  return body.data ?? [];
}
