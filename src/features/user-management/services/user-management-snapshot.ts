import { fetchRbacRoles } from "../../rbac/roles/services/rbac-roles-api";
import type { UserListItemDto } from "../types/users.types";
import { fetchUserRoles } from "./user-roles-api";
import { fetchUsersForAdmin } from "./users-api";

export type UserManagementSnapshot = {
  users: UserListItemDto[];
  rolesByUserId: Record<number, string[]>;
};

/** Loads users, RBAC role catalog, and resolves role names per user for the admin table. */
export async function fetchUserManagementSnapshot(): Promise<UserManagementSnapshot> {
  const [list, catalog] = await Promise.all([
    fetchUsersForAdmin(),
    fetchRbacRoles(),
  ]);

  const roleNameById = new Map(
    catalog.map((r) => [r.id, r.role_name] as const),
  );
  const linkLists = await Promise.all(list.map((u) => fetchUserRoles(u.id)));

  const rolesByUserId: Record<number, string[]> = {};
  list.forEach((u, i) => {
    rolesByUserId[u.id] = linkLists[i]
      .map((l) => roleNameById.get(l.role_id) ?? `#${l.role_id}`)
      .sort((a, b) => a.localeCompare(b));
  });

  return { users: list, rolesByUserId };
}
