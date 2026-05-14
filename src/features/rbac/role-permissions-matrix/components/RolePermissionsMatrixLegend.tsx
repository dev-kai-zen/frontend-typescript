import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Paper, Stack, Typography } from "@mui/material";

export function RolePermissionsMatrixLegend() {
  return (
    <Paper
      elevation={0}
      square
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(255,255,255,0.04)"
            : "rgba(37, 52, 63, 0.05)",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, display: "block", mb: 1 }}
      >
        Legend
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CheckCircleIcon sx={{ fontSize: 22, color: "success.main" }} />
          <Typography variant="caption">Granted</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              border: 2,
              borderColor: "divider",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption">Not granted</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
