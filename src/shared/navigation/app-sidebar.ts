import HomeIcon from "@mui/icons-material/Home";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

export type AppSidebarItem = {
  key: string;
  label: string;
  path: string;
  Icon: ComponentType<SvgIconProps>;
};

/** Primary nav: keep in sync with authenticated routes in `shared/routes.tsx`. */
export const APP_SIDEBAR_ITEMS: readonly AppSidebarItem[] = [
  { key: "home", label: "Home", path: "/home", Icon: HomeIcon },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    Icon: SettingsOutlinedIcon,
  },
];
