import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";

import { APP_SIDEBAR_ITEMS } from "../navigation/app-sidebar";

import { APP_SHELL_DRAWER_WIDTH } from "./layout-constants";

export type AppSidebarProps = {
  open: boolean;
  variant: "permanent" | "persistent" | "temporary";
  onClose: () => void;
  onNavigate: () => void;
};

export default function AppSidebar({
  open,
  variant,
  onClose,
  onNavigate,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: variant === "persistent" ? APP_SHELL_DRAWER_WIDTH : 0,
        flexShrink: 0,
        transition: (t) =>
          t.transitions.create(["width", "transform"], {
            easing: t.transitions.easing.sharp,
            duration: open
              ? t.transitions.duration.enteringScreen
              : t.transitions.duration.leavingScreen,
          }),
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          width: APP_SHELL_DRAWER_WIDTH,
          backgroundColor: theme.palette.sidebarBackground,
          color: theme.palette.sidebarForeground,
          boxShadow:
            "4px 0 20px 0 rgba(0,0,0,0.08), 12px 0 16px -12px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          pt: 2,
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "inherit" }}>
          App
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.sidebarMuted }}
        >
          Boilerplate
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", color: "inherit" }}>
        <List
          component="nav"
          aria-label="Main navigation"
          sx={{ color: "inherit", bgcolor: "transparent" }}
        >
          {APP_SIDEBAR_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.Icon;
            return (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  selected={active}
                  onClick={() => {
                    navigate(item.path);
                    onNavigate();
                  }}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.25,
                    color: "inherit",
                    "& .MuiListItemIcon-root": {
                      color: "inherit",
                      minWidth: 40,
                    },
                    "&:hover:not(.Mui-selected)": {
                      backgroundColor: (t) => t.palette.sidebarItemHover,
                      boxShadow: "inset 2px 0 0 rgba(255, 255, 255, 0.55)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "inherit",
                      boxShadow: (t) =>
                        `inset 3px 0 0 ${t.palette.primary.main}`,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.12)",
                      },
                      "& .MuiListItemIcon-root": { color: "inherit" },
                    },
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  <ListItemIcon>
                    <Icon sx={{ color: "inherit" }} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
