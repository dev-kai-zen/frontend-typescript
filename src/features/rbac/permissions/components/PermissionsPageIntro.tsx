import { Box, Typography } from "@mui/material";

export function PermissionsPageIntro() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Permissions
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage permission codes and optional categories. Codes flow into tokens and route
        guards.
      </Typography>
    </Box>
  );
}
