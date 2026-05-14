import { Box, Typography } from "@mui/material";

/** Title and intro copy for the admin users screen. */
export function UserManagementPageIntro() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        User management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Edit profiles, deactivate accounts, assign RBAC roles, or remove users.
        Deactivate sets <code>is_active</code>; delete calls the server remove
        endpoint.
      </Typography>
    </Box>
  );
}
