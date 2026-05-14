import { Box, Typography } from "@mui/material";

export function UserLogsPageIntro() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        User logs
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Request and activity records (newest first). Filters map to{" "}
        <code>userId</code>, <code>action</code>, and <code>module</code> query
        parameters. KPIs below summarize the <strong>current page</strong> only.
      </Typography>
    </Box>
  );
}
