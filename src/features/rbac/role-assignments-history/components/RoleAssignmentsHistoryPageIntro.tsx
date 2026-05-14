import { Box, Typography } from "@mui/material";

export function RoleAssignmentsHistoryPageIntro() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Role assignments history
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Active user–role links from the RBAC catalog. Sorting favors the most recent
        assignment time when the API exposes it.
      </Typography>
    </Box>
  );
}
