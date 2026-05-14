import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../features/auth/stores/auth-store";
import { filterNavTreeByPermissions } from "../routes/route-permission";
import {
  ROUTES_SIDEBAR_TREE,
  getSidebarOpenKeysForPath,
  isRouteNavGroup,
  itemMatchesPath,
  type RouteNavGroup,
  type RouteNavItem,
} from "../routes/route-nav";

export type AppSidebarProps = {
  open: boolean;
  /** Drawer paper width in px (must match shell layout). */
  drawerWidth: number;
  variant: "permanent" | "persistent" | "temporary";
  onClose: () => void;
  onNavigate: () => void;
};

const SIDEBAR_ITEM_SX: SxProps<Theme> = {
  borderRadius: 2,
  mx: 1,
  my: 0.25,
  color: "inherit",
  boxShadow: "inset 2px 0 0 transparent",
  transition: (theme: Theme) =>
    theme.transitions.create(["box-shadow", "background-color"], {
      duration: theme.transitions.duration.shortest,
    }),
  "& .MuiListItemIcon-root": {
    color: "inherit",
    minWidth: 40,
  },
  "&:hover:not(.Mui-selected)": {
    backgroundColor: (t: Theme) => t.palette.sidebarItemHover,
    boxShadow: "inset 2px 0 0 rgba(255, 255, 255, 0.55)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: "inherit",
    boxShadow: (paletteTheme: Theme) =>
      `inset 3px 0 0 ${paletteTheme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      boxShadow: (paletteTheme: Theme) =>
        `inset 3px 0 0 ${paletteTheme.palette.primary.main}`,
    },
    "& .MuiListItemIcon-root": {
      color: "inherit",
    },
  },
};

export default function AppSidebar({
  open,
  drawerWidth,
  variant,
  onClose,
  onNavigate,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const user = useAuthStore((s) => s.user);

  const sidebarTree = useMemo(() => {
    const permissionCodes = user?.permissions ?? [];
    const roleName = user?.role?.role_name ?? null;
    return filterNavTreeByPermissions(
      ROUTES_SIDEBAR_TREE,
      permissionCodes,
      roleName,
    );
  }, [user]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useLayoutEffect(() => {
    const next = getSidebarOpenKeysForPath(sidebarTree, location.pathname);
    /* Parent sections must expand before paint when deep-linked; matching wellness SidebarMenu behaviour. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pathname-driven collapsible defaults
    setOpenMenus((prev) => ({ ...prev, ...next }));
  }, [location.pathname, sidebarTree]);

  const handleToggle = useCallback((key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const renderItem = (item: RouteNavItem, depth: number) => {
    if (!isRouteNavGroup(item)) {
      const leafActive = itemMatchesPath(item, location.pathname);
      const IconComponent = item.Icon;
      return (
        <ListItem key={item.key} disablePadding>
          <ListItemButton
            selected={leafActive}
            onClick={() => {
              navigate(item.path);
              onNavigate();
            }}
            sx={SIDEBAR_ITEM_SX}
            aria-current={leafActive ? "page" : undefined}
          >
            <ListItemIcon>
              {IconComponent ? (
                <IconComponent sx={{ color: "inherit" }} />
              ) : null}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      );
    }

    return renderSection(item, depth);
  };

  function renderSection(item: RouteNavGroup, depth: number) {
    const isExpanded = !!openMenus[item.key];
    const subtreeActive = item.children.some((child) =>
      itemMatchesPath(child, location.pathname),
    );
    const SectionIcon = item.Icon;

    return (
      <Fragment key={item.key}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleToggle(item.key)}
            aria-expanded={isExpanded}
            selected={subtreeActive}
            sx={SIDEBAR_ITEM_SX}
          >
            <ListItemIcon>
              <SectionIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            <ListItemText primary={item.label} />
            {isExpanded ? (
              <ExpandLess color="inherit" />
            ) : (
              <ExpandMore color="inherit" />
            )}
          </ListItemButton>
        </ListItem>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List
            component="div"
            aria-label={item.label}
            disablePadding
            sx={{ pl: depth ? 3 + depth * 2 : 3 }}
          >
            {item.children.map((child) => renderItem(child, depth + 1))}
          </List>
        </Collapse>
      </Fragment>
    );
  }

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        transition: {
          easing: {
            enter: theme.transitions.easing.sharp,
            exit: theme.transitions.easing.sharp,
          },
        },
      }}
      sx={{
        width:
          variant === "persistent"
            ? open
              ? drawerWidth
              : 0
            : 0,
        flexShrink: 0,
        overflowX: variant === "persistent" ? "hidden" : undefined,
        transition: (t) =>
          t.transitions.create("width", {
            easing: t.transitions.easing.sharp,
            duration: open
              ? t.transitions.duration.enteringScreen
              : t.transitions.duration.leavingScreen,
          }),
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          width: drawerWidth,
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
          {sidebarTree.map((entry) => renderItem(entry, 0))}
        </List>
      </Box>
    </Drawer>
  );
}
