import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import HistoryIcon from "@mui/icons-material/History";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

import AuditLogsPage from "../../modules/audit-logs/AuditLogsPage";
import HiddenRoutePage from "../../modules/hidden-route/HiddenRoutePage";
import HomePage from "../../modules/home/HomePage";
import RbacGroupsPage from "../../modules/rbac/groups/RbacGroupsPage";
import RbacPermissionsPage from "../../modules/rbac/permissions/RbacPermissionsPage";
import RbacRolePermissionsPage from "../../modules/rbac/role-permissions/RbacRolePermissionsPage";
import RbacRolesPage from "../../modules/rbac/roles/RbacRolesPage";
import SettingsPage from "../../modules/settings/SettingsPage";
import UserLogsPage from "../../modules/user-logs/UserLogsPage";
import UserManagementPage from "../../modules/user-management/UserManagementPage";

import type { RouteNavItem } from "./route-nav-types";

/**
 * Declarative nav + URL tree only: paths, labels, icons, grouping, flags.
 * `<AppRoutes />` is responsible for turning leaves into `<Route />` elements
 * and mounting each `Page` after auth/permission checks.
 */
export const ROUTES_NAV_TREE: RouteNavItem[] = [
  {
    kind: "leaf",
    key: "home",
    path: "/home",
    Page: HomePage,
    label: "Home",
    Icon: HomeIcon,
  },
  {
    kind: "leaf",
    key: "settings",
    path: "/settings",
    Page: SettingsPage,
    label: "Settings",
    Icon: SettingsIcon,
  },
  {
    kind: "group",
    key: "administration",
    label: "Administration",
    Icon: AdminPanelSettingsIcon,
    children: [
      {
        kind: "leaf",
        key: "user-management",
        path: "/user-management",
        Page: UserManagementPage,
        label: "User management",
        Icon: PersonIcon,
      },
      {
        kind: "leaf",
        key: "audit-logs",
        path: "/admin/audit-logs",
        Page: AuditLogsPage,
        label: "Audit logs",
        Icon: HistoryIcon,
      },
      {
        kind: "leaf",
        key: "user-logs",
        path: "/admin/user-logs",
        Page: UserLogsPage,
        label: "User logs",
        Icon: ListAltIcon,
      },
      {
        kind: "group",
        key: "rbac",
        label: "Role Based Access Control",
        Icon: AdminPanelSettingsIcon,
        children: [
          {
            kind: "leaf",
            key: "rbac-groups",
            path: "/admin/rbac/groups",
            Page: RbacGroupsPage,
            Icon: FolderSpecialIcon,
            label: "Groups",
          },
          {
            kind: "leaf",
            key: "rbac-permissions",
            path: "/admin/rbac/permissions",
            Page: RbacPermissionsPage,
            Icon: VpnKeyIcon,
            label: "Permissions",
          },
          {
            kind: "leaf",
            key: "rbac-roles",
            path: "/admin/rbac/roles",
            Page: RbacRolesPage,
            Icon: ManageAccountsIcon,
            label: "Roles",
          },
          {
            kind: "leaf",
            key: "rbac-role-permissions",
            path: "/admin/rbac/role-permissions",
            Page: RbacRolePermissionsPage,
            Icon: AccountTreeIcon,
            label: "Role permissions",
          },
        ],
      },
      {
        kind: "leaf",
        key: "hidden-route",
        path: "/hidden-route",
        Page: HiddenRoutePage,
        hidden: true,
      },
    ],
  },
];
