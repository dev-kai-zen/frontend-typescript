/**
 * Builds router + sidebar behaviour from **`routesConfig.tsx`** (data only).
 */

import type { RouteNavItem, RouteNavLeaf } from "./route-nav-types";
import { isRouteNavGroup } from "./route-nav-types";
import { ROUTES_NAV_TREE } from "./routesConfig";

export type { RouteNavGroup, RouteNavItem, RouteNavLeaf } from "./route-nav-types";
export { isRouteNavGroup } from "./route-nav-types";

function flattenLeaves(items: RouteNavItem[]): RouteNavLeaf[] {
  return items.flatMap((item) =>
    isRouteNavGroup(item) ? flattenLeaves(item.children) : [item],
  );
}

/** Paths registered inside `MainLayout`. */
export function getLayoutRouteLeaves(): RouteNavLeaf[] {
  return flattenLeaves(ROUTES_NAV_TREE);
}

/** Drops `hidden` leaves/groups; removes sidebar sections whose children vanished. */
export function filterSidebarNav(items: RouteNavItem[]): RouteNavItem[] {
  const out: RouteNavItem[] = [];

  for (const item of items) {
    if (isRouteNavGroup(item)) {
      if (item.hidden) continue;
      const children = filterSidebarNav(item.children);
      if (children.length === 0) continue;
      out.push({ ...item, children });
    } else if (!item.hidden) {
      out.push(item);
    }
  }

  return out;
}

/** Precomputed tree for `<AppSidebar />` (`hidden` removed; permissions filtered at runtime). */
export const ROUTES_SIDEBAR_TREE = filterSidebarNav(ROUTES_NAV_TREE);

export function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function itemMatchesPath(
  item: RouteNavItem,
  pathname: string,
): boolean {
  const p = normalizePathname(pathname);
  if (!isRouteNavGroup(item)) {
    const base = normalizePathname(item.path);
    return p === base || p.startsWith(`${base}/`);
  }
  return item.children.some((child) => itemMatchesPath(child, p));
}

/** Section keys kept open when the browser path reaches a descendant link. */
export function getSidebarOpenKeysForPath(
  items: RouteNavItem[],
  pathname: string,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};

  const walk = (list: RouteNavItem[]) => {
    for (const item of list) {
      if (!isRouteNavGroup(item)) continue;
      const hit = item.children.some((c) => itemMatchesPath(c, pathname));
      if (hit) {
        out[item.key] = true;
        walk(item.children);
      }
    }
  };

  walk(items);
  return out;
}
