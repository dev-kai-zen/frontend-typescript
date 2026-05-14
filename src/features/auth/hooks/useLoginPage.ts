import type { CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEnv } from "../../../shared/config/env";
import { loginWithGoogle } from "../services/google-auth-api";
import { useAuthStore } from "../stores/auth-store";
import { useSnackbar } from "notistack";

export type LoginPageViewModel = {
  googleClientId: string | undefined;
  loading: boolean;
  onGoogleSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
  onGoogleError: () => void;
};

export function useLoginPage(): LoginPageViewModel {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const { googleClientId } = getEnv();

  useEffect(() => {
    if (accessToken && user) {
      navigate("/home", { replace: true });
    }
  }, [accessToken, user, navigate]);

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const googleToken = credentialResponse.credential;
    if (!googleToken) {
      enqueueSnackbar("Login faileds. Please try again.", {
        variant: "error",
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
        enqueueSnackbar("Logged in successfully", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(response.message || "Login failed. Please try again.", {
          variant: "error",
        });
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      const message =
        ax.response?.data?.message || "Login failed. Please try again.";
      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onGoogleError = () => {
    enqueueSnackbar("Login failed. Please try again.", {
      variant: "error",
    });
  };

  return {
    googleClientId,
    loading,
    onGoogleSuccess,
    onGoogleError,
  };
}
