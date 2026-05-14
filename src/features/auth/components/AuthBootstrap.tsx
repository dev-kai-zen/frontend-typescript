import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "../stores/auth-store";

/** Runs once on app load: try refresh cookie → access token + `/me` (see `bootstrap`). */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAuthStore.getState().bootstrap();
  }, []);

  return children;
}
