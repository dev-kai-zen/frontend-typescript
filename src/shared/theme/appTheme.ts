import { createTheme } from "@mui/material/styles";

/**
 * Single place for app colors. Each key is `{ light, dark }` for the two modes.
 * `createAppMuiTheme` maps these into MUI; use `useTheme().palette.*` in components.
 */
export const appPalette = {
  primary: {
    light: "rgb(255, 155, 81)",
    dark: "rgb(255, 155, 81)",
  },
  primaryContrast: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(255, 255, 255)",
  },
  secondary: {
    light: "rgb(37, 52, 63)",
    dark: "rgb(176, 186, 194)",
  },
  onSecondary: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(18, 18, 18)",
  },
  backgroundDefault: {
    light: "rgb(234, 239, 239)",
    dark: "rgb(18, 18, 18)",
  },
  backgroundPaper: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(30, 30, 30)",
  },
  textPrimary: {
    light: "rgb(37, 52, 63)",
    dark: "rgb(245, 245, 245)",
  },
  textSecondary: {
    light: "rgb(102, 115, 124)",
    dark: "rgb(165, 175, 184)",
  },
  sidebarBackground: {
    light: "rgb(37, 52, 63)",
    dark: "rgb(37, 52, 63)",
  },
  sidebarForeground: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(255, 255, 255)",
  },
  sidebarMuted: {
    light: "rgba(255, 255, 255, 0.8)",
    dark: "rgba(255, 255, 255, 0.8)",
  },
  sidebarItemHover: {
    light: "rgb(237, 227, 217)",
    dark: "rgba(255, 255, 255, 0.08)",
  },
  actionHover: {
    light: "rgb(237, 227, 217)",
    dark: "rgba(255, 255, 255, 0.08)",
  },
} as const;

type Mode = "light" | "dark";

function pick<T extends Record<Mode, string>>(token: T, mode: Mode) {
  return mode === "dark" ? token.dark : token.light;
}

const fontFamily =
  '"Roboto", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';

export function createAppMuiTheme(mode: Mode) {
  const p = appPalette;
  return createTheme({
    palette: {
      mode,
      primary: {
        main: pick(p.primary, mode),
        contrastText: pick(p.primaryContrast, mode),
      },
      secondary: {
        main: pick(p.secondary, mode),
        contrastText: pick(p.onSecondary, mode),
      },
      background: {
        default: pick(p.backgroundDefault, mode),
        paper: pick(p.backgroundPaper, mode),
      },
      text: {
        primary: pick(p.textPrimary, mode),
        secondary: pick(p.textSecondary, mode),
      },
      action: {
        hover: pick(p.actionHover, mode),
      },
      sidebarBackground: pick(p.sidebarBackground, mode),
      sidebarForeground: pick(p.sidebarForeground, mode),
      sidebarMuted: pick(p.sidebarMuted, mode),
      sidebarItemHover: pick(p.sidebarItemHover, mode),
    },
    typography: {
      fontFamily,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
          },
        },
      },
    },
  });
}
