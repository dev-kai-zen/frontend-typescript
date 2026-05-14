import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { logoutOnServer } from "../../features/auth/services/google-auth-api";
import { useAuthStore } from "../../features/auth/stores/auth-store";
import { useThemeMode } from "../theme/AppThemeProvider";

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

export type AppHeaderProps = {
  open: boolean;
  onToggleDrawer: () => void;
  /** Sidebar width in px — shell transitions stay aligned with `AppSidebar`. */
  drawerWidth: number;
  isMobile: boolean;
};

export default function AppHeader({
  open,
  onToggleDrawer,
  drawerWidth,
  isMobile,
}: AppHeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({
        zIndex: isMobile ? theme.zIndex.appBar : theme.zIndex.drawer + 1,
        bgcolor: "background.paper",
        color: "primary.main",
        width:
          !isMobile && open
            ? `calc(100% - ${drawerWidth}px)`
            : "100%",
        transition: (innerTheme) =>
          innerTheme.transitions.create("width", {
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
