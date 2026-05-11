import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { logoutOnServer } from "../../modules/auth/authApi";
import { useAuthStore } from "../../modules/auth/authStore";
import { useThemeMode } from "../theme/AppThemeProvider";

const DRAWER_WIDTH = 240;

/**
 * Sidebar links: add one object per screen you want in the menu.
 * `path` must match a `<Route path="...">` in `src/shared/routes.tsx`.
 */
const SIDEBAR_LINKS = [
  { key: "home", label: "Home", path: "/home", Icon: HomeIcon },
] as const;

function ThemeToggleButton() {
  const { mode, toggleColorMode } = useThemeMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      aria-label="toggle light or dark mode"
    >
      {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}

function UserAccountMenu({ isMobile }: { isMobile: boolean }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const roleLabel = user?.role?.role_name ?? "User";

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logoutOnServer();
    } catch {
      /* still sign out locally */
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <IconButton
        aria-label="account menu"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        edge="end"
        sx={{ borderRadius: 9999, px: 1, py: 0.5 }}
      >
        {user?.picture ? (
          <Avatar src={user.picture} sx={{ width: 32, height: 32, mr: 1 }} />
        ) : (
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
        )}
        {!isMobile && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="body2">{user?.name || "Account"}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {roleLabel} • {user?.email}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ ml: 0.5, opacity: 0.85 }} />
          </>
        )}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

type TopBarProps = {
  open: boolean;
  onToggleDrawer: () => void;
  isMobile: boolean;
};

function TopBar({ open, onToggleDrawer, isMobile }: TopBarProps) {
  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({
        zIndex: isMobile ? theme.zIndex.appBar : theme.zIndex.drawer + 1,
        bgcolor: "background.paper",
        color: "primary.main",
        width: !isMobile && open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
        transition: (innerTheme) =>
          innerTheme.transitions.create(["width", "transform"], {
            easing: innerTheme.transitions.easing.sharp,
            duration:
              !isMobile && open
                ? innerTheme.transitions.duration.enteringScreen
                : innerTheme.transitions.duration.leavingScreen,
          }),
      })}
    >
      <Toolbar>
        <IconButton
          aria-label={open ? "close drawer" : "open drawer"}
          onClick={onToggleDrawer}
          edge="start"
          sx={{ mr: 2 }}
        >
          {open ? (
            <ChevronLeftIcon color="inherit" />
          ) : (
            <MenuIcon color="inherit" />
          )}
        </IconButton>
        {!isMobile && (
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Boilerplate
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <ThemeToggleButton />
        <Box sx={{ mr: 1 }} />
        <UserAccountMenu isMobile={isMobile} />
      </Toolbar>
    </AppBar>
  );
}

type SideDrawerProps = {
  open: boolean;
  variant: "permanent" | "persistent" | "temporary";
  onClose: () => void;
  onNavigate: () => void;
};

function SideDrawer({ open, variant, onClose, onNavigate }: SideDrawerProps) {
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
        width: variant === "persistent" ? DRAWER_WIDTH : 0,
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
          width: DRAWER_WIDTH,
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
          {SIDEBAR_LINKS.map((item) => {
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
                      backgroundColor: (theme) => theme.palette.sidebarItemHover,
                      boxShadow: "inset 2px 0 0 rgba(255, 255, 255, 0.55)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "inherit",
                      boxShadow: (theme) =>
                        `inset 3px 0 0 ${theme.palette.primary.main}`,
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

/**
 * Signed-in shell: top bar, left drawer, and `<Outlet />` where routed pages render.
 */
export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const open = isMobile ? mobileOpen : desktopOpen;
  const drawerVariant = isMobile
    ? "temporary"
    : open
      ? "persistent"
      : "temporary";

  const toggleDrawer = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
      return;
    }
    setDesktopOpen((prev) => !prev);
  }, [isMobile]);

  const closeMobileDrawer = useCallback(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TopBar open={open} onToggleDrawer={toggleDrawer} isMobile={isMobile} />

      <SideDrawer
        open={open}
        variant={drawerVariant}
        onClose={closeMobileDrawer}
        onNavigate={closeMobileDrawer}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          transition: (innerTheme) =>
            innerTheme.transitions.create("width", {
              easing: innerTheme.transitions.easing.sharp,
              duration:
                !isMobile && open
                  ? innerTheme.transitions.duration.enteringScreen
                  : innerTheme.transitions.duration.leavingScreen,
            }),
          width: !isMobile && open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          minWidth: 0,
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, minHeight: 0, p: 2, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
