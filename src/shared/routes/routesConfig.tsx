import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";

import HiddenRoutePage from "../../modules/hidden-route/HiddenRoutePage";
import HomePage from "../../modules/home/HomePage";
import SettingsPage from "../../modules/settings/SettingsPage";
import UserManagementPage from "../../modules/user-management/UserManagementPage";

import type { RouteNavItem } from "./route-nav-types";

export const ROUTES_NAV_TREE: RouteNavItem[] = [
  {
    key: "home",
    path: "/home",
    element: <HomePage />,
    label: "Home",
    Icon: HomeIcon,
  },
  {
    key: "settings",
    path: "/settings",
    element: <SettingsPage />,
    label: "Settings",
    Icon: SettingsIcon,
  },
  {
    key: "administration",
    label: "Administration",
    Icon: AdminPanelSettingsIcon,
    children: [
      {
        key: "user-management",
        path: "/user-management",
        element: <UserManagementPage />,
        label: "User management",
        Icon: PersonIcon,
      },
      {
        key: "hidden-route",
        path: "/hidden-route",
        element: <HiddenRoutePage />,
        label: "Hidden route",
        Icon: VisibilityOffOutlined,
        hidden: true,
      },
    ],
  },
];
