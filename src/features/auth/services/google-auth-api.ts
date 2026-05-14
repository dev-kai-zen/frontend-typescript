import apiClient from "../../../shared/api/api-client";
import type { ApiResult } from "../../../shared/types/api-result.types";

import type { AuthUser } from "../types/auth.types";

type LoginPayload = {
  accessToken: string;
  user: AuthUser;
  permissions: string[];
};

export async function loginWithGoogle(googleToken: string) {
  const res = await apiClient.post("/api/v1/google-auth/login", {
    googleToken,
  });
  return res as unknown as ApiResult<LoginPayload>;
}

export async function fetchCurrentUser() {
  const res = await apiClient.get("/api/v1/google-auth/me");
  return res as unknown as ApiResult<{
    user: AuthUser;
    permissions: string[];
  }>;
}

export async function logoutOnServer() {
  const res = await apiClient.post("/api/v1/google-auth/logout", {});
  return res as unknown as ApiResult<Record<string, never>>;
}
