import apiClient from "../../shared/api/api-client";

export type UserListItemDto = {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  google_id?: string | null;
  picture_url?: string | null;
};

type ListUsersResponse = { data: UserListItemDto[] };

/**
 * GET /api/v1/users
 * @param roleId optional — only users assigned this RBAC role
 */
export async function fetchUsersForAdmin(options?: {
  isActive?: boolean;
  roleId?: number;
}): Promise<UserListItemDto[]> {
  const params = new URLSearchParams();
  if (options?.isActive === true) params.set("isActive", "true");
  if (options?.isActive === false) params.set("isActive", "false");
  if (
    options?.roleId !== undefined &&
    Number.isFinite(options.roleId)
  ) {
    params.set("roleId", String(options.roleId));
  }
  const q = params.toString();
  const url = q ? `/api/v1/users?${q}` : "/api/v1/users";
  const body = (await apiClient.get(url)) as ListUsersResponse;
  return body.data ?? [];
}

export type UpdateUserAdminPayload = {
  email?: string;
  fullName?: string | null;
  googleId?: string | null;
  pictureUrl?: string | null;
  isActive?: boolean;
};

/**
 * PATCH /api/v1/users/:id — partial update (camelCase body matches backend Zod schemas).
 */
export async function updateUserAdmin(
  id: number,
  payload: UpdateUserAdminPayload,
): Promise<UserListItemDto> {
  return (await apiClient.patch(`/api/v1/users/${id}`, payload)) as UserListItemDto;
}

/**
 * DELETE /api/v1/users/:id
 */
export async function deleteUserAdmin(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/users/${id}`);
}
