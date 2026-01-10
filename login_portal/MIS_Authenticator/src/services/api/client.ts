import axios, { AxiosError, AxiosInstance } from "axios";
import { API_CONFIG } from "@/constants/config";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (API_CONFIG.USE_MOCK_API) {
    return Promise.reject(
      new Error("Mock API is enabled. Network requests are disabled.")
    );
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const message =
        (error.response.data as any)?.detail ||
        (error.response.data as any)?.error ||
        "Server error";
      return Promise.reject(new Error(String(message)));
    }
    if (error.request) {
      return Promise.reject(
        new Error("Network error - please check your connection")
      );
    }
    return Promise.reject(new Error("Request failed"));
  }
);
