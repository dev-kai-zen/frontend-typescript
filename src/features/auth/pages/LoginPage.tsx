import { LoginPageView } from "../components/LoginPageView";
import { useLoginPage } from "../hooks/useLoginPage";

/**
 * Google sign-in screen. On success, the backend returns a JWT and user profile;
 * `setSession` stores the access token in memory; the refresh token stays in an
 * httpOnly cookie set by the backend.
 *
 * **Structure**
 * - `types/auth.types.ts` — `AuthUser`
 * - `services/google-auth-api.ts` — login, `/me`, logout
 * - `services/google-auth-refresh-api.ts` — cookie refresh (plain Axios)
 * - `stores/auth-store.ts` — session + bootstrap
 * - `hooks/useLoginPage.ts` — login flow state
 * - `components/LoginPageView.tsx` — layout only
 */
export default function LoginPage() {
  const vm = useLoginPage();
  return <LoginPageView vm={vm} />;
}
