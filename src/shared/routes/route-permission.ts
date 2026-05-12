import type { RouteNavItem } from "./route-nav-types";
import { isRouteNavGroup } from "./route-nav-types";

const SUPER_ADMIN_ROLE = "super_admin";

function passesPermissionFields(
  permissionCodes: readonly string[],
  roleName: string | null | undefined,
  item: RouteNavItem,
): boolean {
  if (roleName === SUPER_ADMIN_ROLE) return true;

  const has = (p: string) => permissionCodes.includes(p);

  if (item.permissionAll?.length) {
    return item.permissionAll.every(has);
  }
  if (item.permissionAny?.length) {
    return item.permissionAny.some(has);
  }
  return true;
}

/** Whether the current user may open this route or see this nav row. */
export function viewerMayAccessNavItem(
  permissionCodes: readonly string[],
  roleName: string | null | undefined,
  item: RouteNavItem,
): boolean {
  return passesPermissionFields(permissionCodes, roleName, item);
}

/**
 * Nav tree with `hidden` items already removed — drop rows the user’s role
 * cannot access. Empty groups disappear.
 */
export function filterNavTreeByPermissions(
  items: RouteNavItem[],
  permissionCodes: readonly string[],
  roleName: string | null | undefined,
): RouteNavItem[] {
  const out: RouteNavItem[] = [];

  for (const item of items) {
    if (isRouteNavGroup(item)) {
      const children = filterNavTreeByPermissions(
        item.children,
        permissionCodes,
        roleName,
      );
      if (children.length === 0) continue;
      if (!viewerMayAccessNavItem(permissionCodes, roleName, item)) continue;
      out.push({ ...item, children });
    } else if (viewerMayAccessNavItem(permissionCodes, roleName, item)) {
      out.push(item);
    }
  }

  return out;
}
