import { apiClient } from "./client";
import type { QRScanResponse, ValidateKeyResponse } from "@/types/api";
import { API_CONFIG } from "@/constants/config";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isProbablyAuthKey(value: string): boolean {
  const key = value.trim();
  if (!key) return false;
  if (key.length < 8) return false;
  if (key.length > 128) return false;
  return true;
}

function isProbablyQrToken(value: string): boolean {
  const token = value.trim();
  if (!token) return false;
  if (token.length < 6) return false;
  if (token.length > 256) return false;
  return true;
}

function makeMockPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const authApi = {
  async validateKey(authKey: string): Promise<ValidateKeyResponse> {
    if (!isProbablyAuthKey(authKey)) {
      return { valid: false, error: "Invalid key format." };
    }

    if (API_CONFIG.USE_MOCK_API) {
      await sleep(API_CONFIG.MOCK_DELAY_MS);
      if (authKey.toLowerCase().includes("bad")) {
        return { valid: false, error: "USER_NOT_FOUND" };
      }
      return {
        valid: true,
        user: {
          id: 1,
          username: "demo",
          full_name: "Demo User",
          email: "demo@example.com",
        },
      };
    }

    const response = await apiClient.post<ValidateKeyResponse>(
      API_CONFIG.ENDPOINTS.VALIDATE_KEY,
      {
        auth_key: authKey,
      }
    );
    return response.data;
  },
  async scanQRCode(
    qrToken: string,
    userAuthKey: string
  ): Promise<QRScanResponse> {
    if (!isProbablyQrToken(qrToken)) {
      return { success: false, error: "Invalid QR token." };
    }
    if (!isProbablyAuthKey(userAuthKey) || !isNonEmpty(userAuthKey)) {
      return { success: false, error: "Missing account key." };
    }

    if (API_CONFIG.USE_MOCK_API) {
      await sleep(API_CONFIG.MOCK_DELAY_MS);
      const lower = qrToken.toLowerCase();
      if (lower.includes("expired")) {
        return { success: false, error: "QR_EXPIRED" };
      }
      if (lower.includes("used")) {
        return { success: false, error: "QR_ALREADY_USED" };
      }
      if (lower.includes("closed")) {
        return { success: false, error: "SYSTEM_CLOSED" };
      }
      return {
        success: true,
        pin: makeMockPin(),
        expires_in: 300,
        service_name: "Test Service",
      };
    }

    const response = await apiClient.post<QRScanResponse>(
      API_CONFIG.ENDPOINTS.QR_SCAN,
      {
        qr_token: qrToken,
        user_auth_key: userAuthKey,
      }
    );
    return response.data;
  },
};
