import type { RbacPermissionDto } from "../types/rbac-permissions.types";
import { fetchRbacPermissions } from "./rbac-permissions-api";

/** Match-all category filter (fetch full catalog). */
export const FILTER_ALL = "";

/** Client-only filter: backend has no `categoryId=null` query; we fetch all and filter. */
export const UNCATEGORIZED_SENTINEL = "__uncategorized__";

export async function fetchRbacPermissionsForAdminFilter(
  filterCategoryId: string,
): Promise<RbacPermissionDto[]> {
  if (filterCategoryId === UNCATEGORIZED_SENTINEL) {
    const all = await fetchRbacPermissions();
    return all.filter((r) => r.category_id == null);
  }
  if (filterCategoryId === FILTER_ALL) {
    return fetchRbacPermissions();
  }
  const n = Number.parseInt(filterCategoryId, 10);
  return fetchRbacPermissions(Number.isFinite(n) ? n : undefined);
}
