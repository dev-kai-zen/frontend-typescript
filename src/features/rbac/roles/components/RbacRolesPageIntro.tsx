import { Box, Typography } from "@mui/material";

export function RbacRolesPageIntro() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Roles
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Roles group permissions for assignment to users. Use the{" "}
        <strong>Role permission matrix</strong> to attach permission codes.
      </Typography>
    </Box>
  );
}
