import type {} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    sidebarBackground: string;
    sidebarForeground: string;
    sidebarMuted: string;
    sidebarItemHover: string;
  }
  interface PaletteOptions {
    sidebarBackground?: string;
    sidebarForeground?: string;
    sidebarMuted?: string;
    sidebarItemHover?: string;
  }
}
