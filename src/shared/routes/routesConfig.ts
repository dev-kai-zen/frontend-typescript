import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CategoryIcon from "@mui/icons-material/Category";
import HistoryIcon from "@mui/icons-material/History";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import TableChartIcon from "@mui/icons-material/TableChart";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

import AuditLogsPage from "../../features/audit-logs/AuditLogsPage";
import HiddenRoutePage from "../../features/hidden-route/HiddenRoutePage";
import HomePage from "../../features/home/HomePage";
import RbacCategoriesPage from "../../features/rbac/categories/pages/RbacCategoriesPage";
import RbacPermissionsPage from "../../features/rbac/permissions/RbacPermissionsPage";
import RbacRoleAssignmentsHistoryPage from "../../features/rbac/role-assignments-history/RbacRoleAssignmentsHistoryPage";
import RbacRolePermissionsPage from "../../features/rbac/role-permissions-matrix/RbacRolePermissionsPage";
import RbacRolesPage from "../../features/rbac/roles/RbacRolesPage";
import SettingsPage from "../../features/settings/SettingsPage";
import UserLogsPage from "../../features/user-logs/UserLogsPage";
import UserManagementPage from "../../features/user-management/UserManagementPage";

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
            key: "rbac-categories",
            path: "/admin/rbac/categories",
            Page: RbacCategoriesPage,
            Icon: CategoryIcon,
            label: "Categories",
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
            Icon: TableChartIcon,
            label: "Role permission matrix",
          },
          {
            kind: "leaf",
            key: "rbac-role-assignments-history",
            path: "/admin/rbac/role-assignments-history",
            Page: RbacRoleAssignmentsHistoryPage,
            Icon: AssignmentIndIcon,
            label: "Role assignments history",
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
