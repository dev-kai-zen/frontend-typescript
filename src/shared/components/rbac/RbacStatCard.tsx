import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

export type RbacStatTone = "primary" | "secondary" | "success" | "info" | "warning";

export type RbacStatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: RbacStatTone;
};

/** Compact KPI tile used across RBAC-style admin screens. */
export function RbacStatCard({
  label,
  value,
  icon,
  tone = "primary",
}: RbacStatCardProps) {
  const theme = useTheme();
  const main =
    tone === "warning"
      ? theme.palette.warning.main
      : theme.palette[tone].main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: alpha(main, 0.14),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: main,
              "& .MuiSvgIcon-root": { fontSize: 28 },
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
