import { create } from "zustand";

import { fetchCurrentUser } from "./authApi";
import { authTokenRef } from "./httpClient";
import { postRefresh } from "./refresh-api";

import type { AuthUser } from "./authApi";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  /** `false` until the first bootstrapping run finishes (cookie refresh + `/me`). */
  isReady: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isReady: false,

  setSession: (accessToken, user) => {
    authTokenRef.current = accessToken;
    set({ accessToken, user });
  },

  setAccessToken: (accessToken) => {
    authTokenRef.current = accessToken;
    set({ accessToken });
  },

  clearSession: () => {
    authTokenRef.current = null;
    set({ accessToken: null, user: null });
  },

  bootstrap: async () => {
    if (get().accessToken && get().user) {
      set({ isReady: true });
      return;
    }

    try {
      const refreshed = await postRefresh();
      if (refreshed.success && refreshed.data?.accessToken) {
        authTokenRef.current = refreshed.data.accessToken;
        set({ accessToken: refreshed.data.accessToken });
        const me = await fetchCurrentUser();
        if (me.success && me.data?.user) {
          set({ user: me.data.user, isReady: true });
          return;
        }
      }
    } catch {
      /* No valid refresh cookie — stay logged out unless login finished in parallel. */
    }

    if (get().accessToken && get().user) {
      set({ isReady: true });
      return;
    }

    authTokenRef.current = null;
    set({ accessToken: null, user: null, isReady: true });
  },
}));
