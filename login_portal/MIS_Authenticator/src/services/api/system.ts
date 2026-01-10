import { apiClient } from "./client";
import type { SystemStatusResponse } from "@/types/api";
import { API_CONFIG } from "@/constants/config";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const systemApi = {
  async getStatus(): Promise<SystemStatusResponse> {
    if (API_CONFIG.USE_MOCK_API) {
      await sleep(API_CONFIG.MOCK_DELAY_MS);
      return {
        status: "open",
        warning: false,
        message: "Mock mode: system is operating normally",
        closes_at: "5:00 PM",
      };
    }

    const response = await apiClient.get<SystemStatusResponse>(
      API_CONFIG.ENDPOINTS.SYSTEM_STATUS
    );
    return response.data;
  },
};
