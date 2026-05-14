import { Box, Typography } from "@mui/material";

export function AuditLogsPageIntro() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Audit logs
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Immutable-style trail of changes (newest first). Filter by action or entity
        type; pagination uses limit and offset on the server. KPIs summarize the{" "}
        <strong>current page</strong> only.
      </Typography>
    </Box>
  );
}
