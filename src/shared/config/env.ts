/** Values from `.env` (Vite exposes only vars prefixed with `VITE_`). */
export function getEnv() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
  return { apiBaseUrl, googleClientId };
}
