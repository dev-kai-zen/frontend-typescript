import apiClient from "../../../../shared/api/api-client";
import type {
  CreateRbacPermissionPayload,
  RbacPermissionDto,
  UpdateRbacPermissionPayload,
} from "../types/rbac-permissions.types";

type ListResponse = { data: RbacPermissionDto[] };

function buildListUrl(categoryId?: number): string {
  const base = "/api/v1/rbac/permissions";
  if (categoryId === undefined || !Number.isFinite(categoryId)) {
    return base;
  }
  return `${base}?categoryId=${encodeURIComponent(String(categoryId))}`;
}

/**
 * GET /api/v1/rbac/permissions
 * @param categoryId optional filter (matches backend `listPermissionsQuerySchema`)
 */
export async function fetchRbacPermissions(
  categoryId?: number,
): Promise<RbacPermissionDto[]> {
  const body = (await apiClient.get(buildListUrl(categoryId))) as ListResponse;
  return body.data ?? [];
}

export async function createRbacPermission(
  payload: CreateRbacPermissionPayload,
): Promise<RbacPermissionDto> {
  return (await apiClient.post("/api/v1/rbac/permissions", {
    permissionCode: payload.permissionCode,
    permissionDescription: payload.permissionDescription ?? null,
    categoryId:
      payload.categoryId === undefined || payload.categoryId === null
        ? null
        : payload.categoryId,
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
    ...(payload.categoryId !== undefined && { categoryId: payload.categoryId }),
    ...(payload.isActive !== undefined && { isActive: payload.isActive }),
  })) as RbacPermissionDto;
}

export async function deleteRbacPermission(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/rbac/permissions/${id}`);
}
