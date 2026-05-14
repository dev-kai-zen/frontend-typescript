import { GoogleLogin } from "@react-oauth/google";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLoginPage } from "../hooks/useLoginPage";

import { LoginMissingGoogleConfig } from "../components/LoginMissingGoogleConfig";

export default function LoginPage() {
  const vm = useLoginPage();
  const theme = useTheme();

  if (!vm.googleClientId) {
    return <LoginMissingGoogleConfig />;
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
          px: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 15% 20%, #eaf2ff 0%, rgba(234, 242, 255, 0) 45%)," +
              "radial-gradient(circle at 85% 80%, #ffe8cc 0%, rgba(255, 232, 204, 0) 40%)",
            zIndex: 0,
          }}
        />

        <Card
          elevation={0}
          sx={{
            zIndex: 1,
            width: "min(440px, 92vw)",
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            boxShadow: 6,
            textAlign: "center",
            bgcolor: "background.paper",
            position: "relative",
          }}
        >
          {vm.loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                bgcolor: "rgba(255, 255, 255, 0.85)",
                zIndex: 2,
              }}
            >
              <CircularProgress size={48} />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: "1.75rem",
                fontWeight: 500,
                color: theme.palette.primary.main,
              }}
            >
              Boilerplate
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in with your Google account
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
              <GoogleLogin
                onSuccess={(c) => void vm.onGoogleSuccess(c)}
                onError={vm.onGoogleError}
              />
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  );
}
