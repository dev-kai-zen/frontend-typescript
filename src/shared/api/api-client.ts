import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { getEnv } from "../config/env";
import { postRefresh } from "../../features/auth/services/google-auth-refresh-api";

/**
 * Kept in sync by the auth store and the refresh interceptor so each request
 * can send `Authorization: Bearer …`.
 */
export const authTokenRef = { current: null as string | null };

const { apiBaseUrl } = getEnv();

/**
 * Standard HTTP client for authenticated API calls: attaches the access token
 * and retries once after a cookie-based refresh when the server returns 401.
 */
export const apiClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = authTokenRef.current;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry === true
    ) {
      return Promise.reject(error);
    }

    const url = String(original.url ?? "");
    if (
      url.includes("/google-auth/refresh") ||
      url.includes("/google-auth/login")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const body = await postRefresh();
      if (!body.success || !body.data?.accessToken) {
        throw new Error("Refresh failed");
      }
      authTokenRef.current = body.data.accessToken;
      const { useAuthStore } = await import("../../features/auth/stores/auth-store");
      useAuthStore.getState().setAccessToken(body.data.accessToken);
      return apiClient.request(original);
    } catch {
      const { useAuthStore } = await import("../../features/auth/stores/auth-store");
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }
  },
);

export default apiClient;
