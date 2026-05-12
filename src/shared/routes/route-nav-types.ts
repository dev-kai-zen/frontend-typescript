import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType, ReactElement } from "react";

/** Permission fields on a nav node (same strings as `AuthUser.permissions`). Use one style per item: `permissionAll`, `permissionAny`, or `permission`. */
type RouteNavPermissions = {
  /** User must have at least one of these. */
  permissionAny?: string[];
  /** User must have every one of these. */
  permissionAll?: string[];
};

/** One URL + page the shell can render. */
export type RouteNavLeaf = RouteNavPermissions & {
  key: string;
  path: string;
  element: ReactElement;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  /** If true: still registered on the router, but not shown in the sidebar. */
  hidden?: boolean;
};

/** Sidebar section that groups links (no URL of its own). */
export type RouteNavGroup = RouteNavPermissions & {
  key: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  hidden?: boolean;
  children: RouteNavItem[];
};

export type RouteNavItem = RouteNavLeaf | RouteNavGroup;

export function isRouteNavGroup(item: RouteNavItem): item is RouteNavGroup {
  return "children" in item;
}
