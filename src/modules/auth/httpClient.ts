import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { getEnv } from "../../shared/config/env";
import { postRefresh } from "./refresh-api";

/**
 * Updated by the auth store (and the refresh interceptor below) so each request
 * can send `Authorization: Bearer …`.
 */
export const authTokenRef = { current: null as string | null };

const { apiBaseUrl } = getEnv();

const httpClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = authTokenRef.current;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
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
      const { useAuthStore } = await import("./authStore");
      useAuthStore.getState().setAccessToken(body.data.accessToken);
      return httpClient.request(original);
    } catch {
      const { useAuthStore } = await import("./authStore");
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }
  },
);

export default httpClient;
