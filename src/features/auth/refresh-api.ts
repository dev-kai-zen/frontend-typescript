import axios from "axios";

import { getEnv } from "../../shared/config/env";
import type { ApiResult } from "../../shared/types/api-result.types";

/**
 * Uses plain Axios (not `apiClient`) so a 401 does not trigger an infinite
 * refresh loop.
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
