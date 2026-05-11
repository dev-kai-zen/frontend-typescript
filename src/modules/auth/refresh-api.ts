import axios from "axios";

import { getEnv } from "../../shared/config/env";

/** Same envelope as other backend JSON responses. */
export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

/**
 * Uses a plain Axios instance (not `httpClient`) so a 401 on `/me` does not
 * trigger an infinite refresh loop.
 */
export async function postRefresh(): Promise<
  ApiResult<{ accessToken: string }>
> {
  const { apiBaseUrl } = getEnv();
  const prefix = apiBaseUrl.replace(/\/$/, "");
  const url = `${prefix}/api/v1/google-auth/refresh`;
  const { data } = await axios.post<ApiResult<{ accessToken: string }>>(
    url,
    {},
    { withCredentials: true },
  );
  return data;
}
