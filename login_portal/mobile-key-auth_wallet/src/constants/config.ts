export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000",
  TIMEOUT_MS: Number.parseInt(
    process.env.EXPO_PUBLIC_API_TIMEOUT || "30000",
    10
  ),
  USE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API === "true",
  MOCK_DELAY_MS: Number.parseInt(
    process.env.EXPO_PUBLIC_MOCK_DELAY_MS || "350",
    10
  ),
  ENDPOINTS: {
    QR_SCAN: "/api/auth/qr/scan",
    VALIDATE_KEY: "/api/auth/validate-key",
    SYSTEM_STATUS: "/api/system/status",
  },
} as const;

export const APP_CONFIG = {
  E2E_MODE: process.env.EXPO_PUBLIC_E2E_MODE === "true",
} as const;

export const AUTH_CONFIG = {
  PIN_LENGTH: 6,
  PIN_EXPIRY_SECONDS: 300,
} as const;

export const STORAGE_KEYS = {
  USER_AUTH_KEY: "user_auth_key",
  USER_INFO: "user_info",
  ONBOARDING_COMPLETE: "onboarding_complete",
  SCAN_HISTORY: "scan_history",
} as const;
