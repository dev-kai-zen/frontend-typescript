import apiClient from "../../../shared/api/api-client";
import type {
  CreateRbacPermissionPayload,
  RbacPermissionDto,
  UpdateRbacPermissionPayload,
} from "./rbac-permissions.types";

type ListResponse = { data: RbacPermissionDto[] };

function buildListUrl(groupId?: number): string {
  const base = "/api/v1/rbac/permissions";
  if (groupId === undefined || !Number.isFinite(groupId)) {
    return base;
  }
  return `${base}?groupId=${encodeURIComponent(String(groupId))}`;
}

/**
 * GET /api/v1/rbac/permissions
 * @param groupId optional filter (matches backend `listPermissionsQuerySchema`)
 */
export async function fetchRbacPermissions(
  groupId?: number,
): Promise<RbacPermissionDto[]> {
  const body = (await apiClient.get(buildListUrl(groupId))) as ListResponse;
  return body.data ?? [];
}

export async function createRbacPermission(
  payload: CreateRbacPermissionPayload,
): Promise<RbacPermissionDto> {
  return (await apiClient.post("/api/v1/rbac/permissions", {
    permissionCode: payload.permissionCode,
    permissionDescription: payload.permissionDescription ?? null,
    groupId:
      payload.groupId === undefined || payload.groupId === null
        ? null
        : payload.groupId,
  })) as RbacPermissionDto;
}

export async function updateRbacPermission(
  id: number,
  payload: UpdateRbacPermissionPayload,
): Promise<RbacPermissionDto> {
  return (await apiClient.patch(`/api/v1/rbac/permissions/${id}`, {
    ...(payload.permissionCode !== undefined && {
      permissionCode: payload.permissionCode,
    }),
    ...(payload.permissionDescription !== undefined && {
      permissionDescription: payload.permissionDescription,
    }),
    ...(payload.groupId !== undefined && { groupId: payload.groupId }),
  })) as RbacPermissionDto;
}

export async function deleteRbacPermission(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/rbac/permissions/${id}`);
}
