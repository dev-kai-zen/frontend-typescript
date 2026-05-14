import type { CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEnv } from "../../../shared/config/env";
import { loginWithGoogle } from "../services/google-auth-api";
import { useAuthStore } from "../stores/auth-store";

export type LoginSnackbarState = {
  message: string;
  severity: "success" | "error";
};

export type LoginPageViewModel = {
  googleClientId: string | undefined;
  loading: boolean;
  snack: LoginSnackbarState | null;
  dismissSnack: () => void;
  onGoogleSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
  onGoogleError: () => void;
};

export function useLoginPage(): LoginPageViewModel {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<LoginSnackbarState | null>(null);
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

  return {
    googleClientId,
    loading,
    snack,
    dismissSnack: () => setSnack(null),
    onGoogleSuccess,
    onGoogleError,
  };
}
