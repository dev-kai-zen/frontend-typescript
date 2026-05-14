import type { Theme } from "@mui/material/styles";

/** Solid blend so sticky cells mask horizontally scrolled content (alpha tints bleed through). */
export function opaqueStickyCategoryBg(theme: Theme): string {
  const paper = theme.palette.background.paper;
  const prim = theme.palette.primary.main;
  const pct = theme.palette.mode === "dark" ? "14%" : "10%";
  return `color-mix(in srgb, ${prim} ${pct}, ${paper})`;
}

export function stickyColShadow(theme: Theme): string {
  return theme.palette.mode === "dark"
    ? "4px 0 14px rgba(0, 0, 0, 0.45)"
    : "4px 0 14px rgba(37, 52, 63, 0.12)";
}
