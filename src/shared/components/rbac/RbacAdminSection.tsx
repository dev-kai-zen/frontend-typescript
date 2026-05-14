import { Paper, type PaperProps } from "@mui/material";
import type { ReactNode } from "react";

export type RbacAdminSectionProps = PaperProps & {
  children: ReactNode;
};

/** Bordered content panel — aligns RBAC-style admin pages with a Paper shell. */
export function RbacAdminSection({
  children,
  elevation = 0,
  sx,
  ...rest
}: RbacAdminSectionProps) {
  return (
    <Paper
      elevation={elevation}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
}
