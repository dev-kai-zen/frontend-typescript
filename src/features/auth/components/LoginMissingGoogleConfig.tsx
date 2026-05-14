import { Alert, Box } from "@mui/material";

/** Shown when `VITE_GOOGLE_CLIENT_ID` is not configured. */
export function LoginMissingGoogleConfig() {
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">
        Set <code>VITE_GOOGLE_CLIENT_ID</code> in your environment (see{" "}
        <code>env.example</code>).
      </Alert>
    </Box>
  );
}
