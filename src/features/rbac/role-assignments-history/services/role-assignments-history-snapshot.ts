import { fetchUsersForAdmin } from "../../../user-management/users-api";
import { fetchUserRoles } from "../../../user-management/user-roles-api";
import type { UserRoleLinkDto } from "../../../user-management/user-roles.types";
import { fetchRbacRoles } from "../../roles/services/rbac-roles-api";
import type { RoleAssignmentRow } from "../types/role-assignments-history.types";
import { formatAssignmentWhen } from "../utils/role-assignments-history-format";

function sortRowsByAssignedAtDesc(rows: RoleAssignmentRow[]): RoleAssignmentRow[] {
  return [...rows].sort((a, b) => {
    const ta =
      a.assignedAtLabel === "—" ? 0 : new Date(a.assignedAtLabel).getTime();
    const tb =
      b.assignedAtLabel === "—" ? 0 : new Date(b.assignedAtLabel).getTime();
    return tb - ta;
  });
}

/** Loads users, roles catalog, and expands live user–role links into table rows. */
export async function fetchRoleAssignmentsSnapshot(): Promise<RoleAssignmentRow[]> {
  const [users, roleCatalog] = await Promise.all([
    fetchUsersForAdmin(),
    fetchRbacRoles(),
  ]);

  const roleNameById = new Map<number, string>(
    roleCatalog.map((r) => [r.id, r.role_name]),
  );
  const emailById = new Map<number, string>(
    users.map((u) => [u.id, u.email]),
  );

  const linkLists = await Promise.all(users.map((u) => fetchUserRoles(u.id)));

  const built: RoleAssignmentRow[] = [];
  users.forEach((u, i) => {
    const links = linkLists[i] as UserRoleLinkDto[];
    for (const link of links) {
      const roleName =
        roleNameById.get(link.role_id) ?? `Role #${link.role_id}`;
      const assignerEmail = emailById.get(link.assigned_by);
      built.push({
        linkId: link.id,
        userId: u.id,
        userEmail: u.email,
        userName: u.full_name,
        roleId: link.role_id,
        roleName,
        assignedById: link.assigned_by,
        assignedByLabel: assignerEmail ?? `User #${link.assigned_by}`,
        assignedAtLabel: formatAssignmentWhen(link.created_at),
      });
    }
  });

  return sortRowsByAssignedAtDesc(built);
}
