import { create } from "zustand";
import { STORAGE_KEYS } from "@/constants/config";
import type { UserInfo } from "@/types/api";
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from "@/services/storage/secureStorage";

type AuthState = {
  isHydrated: boolean;
  onboardingComplete: boolean;
  authKey: string | null;
  user: UserInfo | null;
  hydrate: () => Promise<void>;
  setAuthKey: (authKey: string) => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  setOnboardingComplete: (value: boolean) => Promise<void>;
  clear: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isHydrated: false,
  onboardingComplete: false,
  authKey: null,
  user: null,
  hydrate: async () => {
    if (get().isHydrated) return;
    const [authKey, onboardingComplete, userJson] = await Promise.all([
      getSecureItem(STORAGE_KEYS.USER_AUTH_KEY),
      getSecureItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      getSecureItem(STORAGE_KEYS.USER_INFO),
    ]);

    let user: UserInfo | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson) as UserInfo;
      } catch {
        user = null;
      }
    }

    set({
      authKey: authKey ?? null,
      onboardingComplete: onboardingComplete === "true",
      user,
      isHydrated: true,
    });
  },
  setAuthKey: async (authKey: string) => {
    await setSecureItem(STORAGE_KEYS.USER_AUTH_KEY, authKey);
    set({ authKey });
  },
  setUser: (user: UserInfo | null) => {
    set({ user });
    if (user) {
      void setSecureItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    } else {
      void deleteSecureItem(STORAGE_KEYS.USER_INFO);
    }
  },
  setOnboardingComplete: async (value: boolean) => {
    await setSecureItem(
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      value ? "true" : "false"
    );
    set({ onboardingComplete: value });
  },
  clear: async () => {
    await Promise.all([
      deleteSecureItem(STORAGE_KEYS.USER_AUTH_KEY),
      deleteSecureItem(STORAGE_KEYS.USER_INFO),
      deleteSecureItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
    ]);
    set({ authKey: null, user: null, onboardingComplete: false });
  },
}));
