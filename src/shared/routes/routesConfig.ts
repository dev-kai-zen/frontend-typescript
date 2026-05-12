import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

import HiddenRoutePage from "../../modules/hidden-route/HiddenRoutePage";
import HomePage from "../../modules/home/HomePage";
import SettingsPage from "../../modules/settings/SettingsPage";
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
        key: "hidden-route",
        path: "/hidden-route",
        Page: HiddenRoutePage,
        hidden: true,
      },
    ],
  },
];
