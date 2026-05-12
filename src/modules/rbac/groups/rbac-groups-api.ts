import apiClient from "../../../shared/api/api-client";
import type {
  CreateRbacGroupPayload,
  RbacGroupDto,
  UpdateRbacGroupPayload,
} from "./rbac-groups.types";

type ListGroupsResponse = { data: RbacGroupDto[] };

/**
 * GET /api/v1/rbac/groups
 */
export async function fetchRbacGroups(): Promise<RbacGroupDto[]> {
  const body = (await apiClient.get(
    "/api/v1/rbac/groups",
  )) as ListGroupsResponse;
  return body.data ?? [];
}

export async function createRbacGroup(
  payload: CreateRbacGroupPayload,
): Promise<RbacGroupDto> {
  return (await apiClient.post("/api/v1/rbac/groups", {
    groupName: payload.groupName.trim(),
  })) as RbacGroupDto;
}

export async function updateRbacGroup(
  id: number,
  payload: UpdateRbacGroupPayload,
): Promise<RbacGroupDto> {
  return (await apiClient.patch(`/api/v1/rbac/groups/${id}`, {
    groupName: payload.groupName.trim(),
  })) as RbacGroupDto;
}

export async function deleteRbacGroup(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/rbac/groups/${id}`);
}
