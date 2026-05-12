import { Box, Toolbar, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import { APP_SHELL_DRAWER_WIDTH } from "./layout-constants";

/**
 * Signed-in shell: header, left drawer, and `<Outlet />` where routed pages render.
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
      <AppHeader
        open={open}
        onToggleDrawer={toggleDrawer}
        isMobile={isMobile}
      />

      <AppSidebar
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
          width:
            !isMobile && open
              ? `calc(100% - ${APP_SHELL_DRAWER_WIDTH}px)`
              : "100%",
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
