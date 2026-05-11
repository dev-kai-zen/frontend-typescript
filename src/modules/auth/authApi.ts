import httpClient from "./httpClient";

/** User shape returned by the backend after Google login / `me`. */
export type AuthUser = {
  id: number;
  google_id: string | null;
  name: string;
  email: string;
  picture: string;
  role_id: number | null;
  role: { role_name: string } | null;
  permissions: string[];
  provider: string;
  is_active: number;
};

export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type LoginPayload = {
  accessToken: string;
  user: AuthUser;
  permissions: string[];
};

export async function loginWithGoogle(googleToken: string) {
  const res = await httpClient.post("/api/v1/google-auth/login", {
    googleToken,
  });
  return res as unknown as ApiResult<LoginPayload>;
}

export async function fetchCurrentUser() {
  const res = await httpClient.get("/api/v1/google-auth/me");
  return res as unknown as ApiResult<{
    user: AuthUser;
    permissions: string[];
  }>;
}

export async function logoutOnServer() {
  const res = await httpClient.post("/api/v1/google-auth/logout", {});
  return res as unknown as ApiResult<Record<string, never>>;
}
