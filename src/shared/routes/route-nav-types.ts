import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

/** Permission fields on a nav node (same strings as `AuthUser.permissions`). Use one style per item: `permissionAll`, `permissionAny`, or `permission`. */
type RouteNavPermissions = {
  /** Single required permission code. */
  permission?: string;
  /** User must have at least one of these. */
  permissionAny?: string[];
  /** User must have every one of these. */
  permissionAll?: string[];
};

/** One URL + page the shell can render. `Page` is mounted by `AppRoutes` after permission checks. */
export type RouteNavLeaf = RouteNavPermissions & {
  /** Marks this row as one URL + page — not an expandable sidebar folder. */
  kind: "leaf";
  key: string;
  path: string;
  Page: ComponentType;
  label?: string | null;
  Icon?: ComponentType<SvgIconProps> | null;
  /** If true: still registered on the router, but not shown in the sidebar. */
  hidden?: boolean;
};

/** Sidebar section that groups links (no URL of its own). */
export type RouteNavGroup = RouteNavPermissions & {
  /** Marks this row as an expandable sidebar section (`children`). */
  kind: "group";
  key: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  hidden?: boolean;
  children: RouteNavItem[];
};

export type RouteNavItem = RouteNavLeaf | RouteNavGroup;

/**
 * Type guard for `RouteNavGroup`. In `if (isRouteNavGroup(item))`, `item` is a
 * group with `children`; in `else`, `item` is a `RouteNavLeaf` with `path` and `Page`.
 */
export function isRouteNavGroup(item: RouteNavItem): item is RouteNavGroup {
  return item.kind === "group";
}

/** Narrows to a single route row (has `path` / `Page`, no `children`). */
export function isRouteNavLeaf(item: RouteNavItem): item is RouteNavLeaf {
  return item.kind === "leaf";
}
