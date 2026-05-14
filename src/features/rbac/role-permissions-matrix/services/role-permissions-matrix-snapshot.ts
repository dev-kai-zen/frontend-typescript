import { fetchRbacCategories } from "../../categories/services/rbac-categories-api";
import { fetchRbacPermissions } from "../../permissions/services/rbac-permissions-api";
import { fetchRbacRoles } from "../../roles/services/rbac-roles-api";
import type { RolePermissionsMatrixSnapshot } from "../types/role-permissions-matrix.types";
import { sortIds } from "../utils/role-permissions-matrix.helpers";
import { fetchRolePermissions } from "./rbac-role-permissions-api";

/** Roles, catalog, categories, and permission-id matrix (latest server state). */
export async function fetchRolePermissionsMatrixSnapshot(): Promise<RolePermissionsMatrixSnapshot> {
  const [roleList, permList, catList] = await Promise.all([
    fetchRbacRoles(),
    fetchRbacPermissions(),
    fetchRbacCategories(),
  ]);

  const categories = [...catList].sort((a, b) => a.id - b.id);

  const linksLists = await Promise.all(
    roleList.map((r) => fetchRolePermissions(r.id)),
  );

  const matrix: Record<number, number[]> = {};
  roleList.forEach((r, i) => {
    matrix[r.id] = sortIds(linksLists[i].map((l) => l.permission_id));
  });

  return {
    roles: roleList,
    catalog: permList,
    categories,
    matrix,
  };
}
