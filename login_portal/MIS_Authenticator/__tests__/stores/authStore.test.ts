import { STORAGE_KEYS } from "@/constants/config";
import { useAuthStore } from "@/stores/authStore";
import type { UserInfo } from "@/types/api";

jest.mock("@/services/storage/secureStorage", () => ({
  setSecureItem: jest.fn(),
  getSecureItem: jest.fn(),
  deleteSecureItem: jest.fn(),
}));

const secureStorage = jest.requireMock("@/services/storage/secureStorage") as {
  setSecureItem: jest.Mock;
  getSecureItem: jest.Mock;
  deleteSecureItem: jest.Mock;
};

describe("useAuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isHydrated: false,
      onboardingComplete: false,
      authKey: null,
      user: null,
    });
  });

  it("hydrates from secure storage", async () => {
    const user: UserInfo = {
      id: 1,
      username: "demo",
      full_name: "Demo User",
      email: "demo@example.com",
    };

    secureStorage.getSecureItem.mockImplementation(async (key: string) => {
      if (key === STORAGE_KEYS.USER_AUTH_KEY) return "key123";
      if (key === STORAGE_KEYS.ONBOARDING_COMPLETE) return "true";
      if (key === STORAGE_KEYS.USER_INFO) return JSON.stringify(user);
      return null;
    });

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().isHydrated).toBe(true);
    expect(useAuthStore.getState().authKey).toBe("key123");
    expect(useAuthStore.getState().onboardingComplete).toBe(true);
    expect(useAuthStore.getState().user?.username).toBe("demo");
  });

  it("sets auth key and persists", async () => {
    await useAuthStore.getState().setAuthKey("abc");
    expect(secureStorage.setSecureItem).toHaveBeenCalledWith(
      STORAGE_KEYS.USER_AUTH_KEY,
      "abc"
    );
    expect(useAuthStore.getState().authKey).toBe("abc");
  });

  it("sets onboarding complete and persists", async () => {
    await useAuthStore.getState().setOnboardingComplete(true);
    expect(secureStorage.setSecureItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      "true"
    );
    expect(useAuthStore.getState().onboardingComplete).toBe(true);
  });

  it("clears all auth data", async () => {
    useAuthStore.setState({
      isHydrated: true,
      onboardingComplete: true,
      authKey: "k",
      user: { id: 1, username: "u", full_name: "U", email: "e" },
    });

    await useAuthStore.getState().clear();

    expect(secureStorage.deleteSecureItem).toHaveBeenCalledWith(
      STORAGE_KEYS.USER_AUTH_KEY
    );
    expect(secureStorage.deleteSecureItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_INFO);
    expect(secureStorage.deleteSecureItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETE
    );
    expect(useAuthStore.getState().authKey).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().onboardingComplete).toBe(false);
  });
});

