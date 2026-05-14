import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function RoleAssignmentsHistoryAboutPanel() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <InfoOutlinedIcon color="primary" sx={{ mt: 0.25 }} />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>
          About this view
        </Typography>
        <Typography variant="body2" color="text.secondary">
          To change assignments, use{" "}
          <Link
            component={RouterLink}
            to="/user-management"
            color="primary"
            sx={{ fontWeight: 600, textUnderlineOffset: 3 }}
          >
            User management
          </Link>{" "}
          (Set roles). Revoked links disappear from this list; persistent audit history
          would require logging changes on the server.
        </Typography>
      </Box>
    </Stack>
  );
}
