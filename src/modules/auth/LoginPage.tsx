import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginWithGoogle } from "./authApi";
import { useAuthStore } from "./auth-store";
import { getEnv } from "../../shared/config/env";

/**
 * Google sign-in screen. On success, the backend returns a JWT and user profile;
 * `setSession` stores the access token in memory; the refresh token stays in an
 * httpOnly cookie set by the backend.
 */
export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const { googleClientId } = getEnv();

  useEffect(() => {
    if (accessToken && user) {
      navigate("/home", { replace: true });
    }
  }, [accessToken, user, navigate]);

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const googleToken = credentialResponse.credential;
    if (!googleToken) {
      setSnack({
        message: "Login failed. Please try again.",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await loginWithGoogle(googleToken);
      if (
        response.success &&
        response.data?.accessToken &&
        response.data.user
      ) {
        setSession(response.data.accessToken, response.data.user);
        setSnack({ message: "Logged in successfully", severity: "success" });
      } else {
        setSnack({
          message: response.message || "Login failed. Please try again.",
          severity: "error",
        });
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      const message =
        ax.response?.data?.message || "Login failed. Please try again.";
      setSnack({ message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onGoogleError = () => {
    setSnack({
      message: "Google sign-in was cancelled or failed. Please try again.",
      severity: "error",
    });
  };

  if (!googleClientId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Set <code>VITE_GOOGLE_CLIENT_ID</code> in your environment (see{" "}
          <code>env.example</code>).
        </Alert>
      </Box>
    );
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
          {loading && (
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
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
              />
            </Box>
          </Box>
        </Card>
      </Box>
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {snack ? (
          <Alert
            severity={snack.severity}
            onClose={() => setSnack(null)}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
