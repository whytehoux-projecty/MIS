/**
 * API Service for Registration Portal
 * Handles all HTTP communication with Central Auth API backend
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import type {
    ApiResponse,
    UserRegister,
    PendingUserResponse,
    InvitationVerifyRequest,
    InvitationVerifyResponse,
    SystemStatus,
    UploadResponse,
    WaitlistSubmitRequest,
    WaitlistSubmitResponse,
    OpenLinkResponse,
} from '../types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Axios Instance
// ============================================================================

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add registration session token if available
        const sessionData = sessionStorage.getItem('registration_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.token && config.headers) {
                config.headers['X-Registration-Token'] = session.token;
            }
        }

        // Dev logging
        const isDev = (import.meta as unknown as { env: Record<string, string> }).env?.DEV;
        if (isDev) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as { detail?: string };

            // Handle specific error codes
            if (status === 503) {
                console.error('[API] Service unavailable - Registration may be closed');
            } else if (status === 401) {
                console.error('[API] Unauthorized - Invalid credentials');
            } else if (status === 400) {
                console.error('[API] Bad request:', data?.detail);
            }
        } else if (error.request) {
            console.error('[API] Network error - No response received');
        }

        return Promise.reject(error);
    }
);

// ============================================================================
// Helper Functions
// ============================================================================

function handleApiError(error: unknown): ApiResponse<never> {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;

        if (axiosError.response) {
            return {
                success: false,
                error: axiosError.response.data?.detail ||
                    axiosError.response.data?.message ||
                    'Server error occurred',
                detail: axiosError.response.data?.detail,
            };
        } else if (axiosError.request) {
            return {
                success: false,
                error: 'Network error. Please check your connection.',
            };
        }
    }

    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
}

// ============================================================================
// API Methods
// ============================================================================

export const api = {
    // ========================================================================
    // System
    // ========================================================================

    /**
     * Check if the registration system is currently open
     */
    async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
        try {
            const response = await apiClient.get<SystemStatus>('/system/status');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Health check
     */
    async healthCheck(): Promise<ApiResponse<{ status: string }>> {
        try {
            const response = await apiClient.get<{ status: string }>('/health');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    // ========================================================================
    // Waitlist / Interest
    // ========================================================================

    /**
     * Submit an interest/waitlist request
     * Called from the InterestPage form
     */
    async submitInterest(
        data: WaitlistSubmitRequest
    ): Promise<ApiResponse<WaitlistSubmitResponse>> {
        try {
            const response = await apiClient.post<WaitlistSubmitResponse>(
                '/waitlist/submit',
                {
                    full_name: data.full_name.trim(),
                    email: data.email.toLowerCase().trim(),
                    phone: data.phone?.trim() || null,
                    company: data.company?.trim() || null,
                    role: data.role?.trim() || null,
                }
            );

            return {
                success: true,
                data: response.data,
                message: response.data.message,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Check waitlist request status by email
     */
    async checkWaitlistStatus(
        email: string
    ): Promise<ApiResponse<{ found: boolean; status?: string; message: string }>> {
        try {
            const response = await apiClient.get<{ found: boolean; status?: string; message: string }>(
                '/waitlist/status',
                { params: { email: email.toLowerCase().trim() } }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    // ========================================================================
    // Invitation
    // ========================================================================

    /**
     * Verify an invitation code and PIN
     * Calls the backend /api/invitation/verify endpoint
     */
    async verifyInvitation(
        data: InvitationVerifyRequest
    ): Promise<ApiResponse<InvitationVerifyResponse>> {
        try {
            // Call the backend invitation verification endpoint
            const response = await apiClient.post<InvitationVerifyResponse>(
                '/invitation/verify',
                {
                    invitation_code: data.invitation_code.trim(),
                    pin: data.pin.trim(),
                }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Open encrypted registration link
     */
    async openLink(url_token: string): Promise<ApiResponse<OpenLinkResponse>> {
        try {
            const response = await apiClient.post<OpenLinkResponse>('/invitation/open-link', { url_token });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    // ========================================================================
    // Registration
    // ========================================================================

    /**
     * Register a new user
     */
    async registerUser(userData: UserRegister): Promise<ApiResponse<PendingUserResponse>> {
        try {
            const response = await apiClient.post<PendingUserResponse>('/register/', userData);
            return {
                success: true,
                data: response.data,
                message: 'Registration submitted successfully',
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Check if email is already registered
     */
    async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
        try {
            // This endpoint may need to be added to the backend
            // For now, we'll make a registration attempt and catch the error
            const response = await apiClient.get<{ available: boolean }>(`/api/register/check-email`, {
                params: { email },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            // If endpoint doesn't exist, assume email is available
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    success: true,
                    data: { available: true },
                };
            }
            return handleApiError(error);
        }
    },

    /**
     * Check if username is already taken
     */
    async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
        try {
            const response = await apiClient.get<{ available: boolean }>(`/api/register/check-username`, {
                params: { username },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    success: true,
                    data: { available: true },
                };
            }
            return handleApiError(error);
        }
    },

    // ========================================================================
    // File Upload
    // ========================================================================

    /**
     * Upload a photo for registration
     */
    async uploadPhoto(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<UploadResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'registration_photo');

            const uploadConfig: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(progress);
                    }
                },
            };

            const response = await apiClient.post<UploadResponse>('/upload/photo', formData, uploadConfig);

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Upload oath audio recording
     */
    async uploadOathRecording(
        audioBlob: Blob,
        userId?: number
    ): Promise<ApiResponse<UploadResponse>> {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'oath_recording.webm');
            formData.append('type', 'oath_audio');
            if (userId) {
                formData.append('user_id', userId.toString());
            }

            const response = await apiClient.post<UploadResponse>('/upload/audio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    // ========================================================================
    // Submission
    // ========================================================================

    /**
     * Submit complete registration with all data
     */
    async submitRegistration(
        formData: UserRegister,
        photoIds: string[],
        oathRecordingId: string,
        policiesAccepted: Record<string, boolean>
    ): Promise<ApiResponse<PendingUserResponse>> {
        try {
            // Prepare the full registration payload
            const payload = {
                ...formData,
                photo_ids: photoIds,
                oath_recording_id: oathRecordingId,
                policies_accepted: policiesAccepted,
                submitted_at: new Date().toISOString(),
            };

            // Submit to registration endpoint
            const response = await apiClient.post<PendingUserResponse>('/register/', payload);

            return {
                success: true,
                data: response.data,
                message: 'Registration submitted successfully. Please wait for admin approval.',
            };
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get registration status by reference number
     */
    async getRegistrationStatus(_referenceNumber: string): Promise<ApiResponse<{
        status: 'pending' | 'approved' | 'rejected';
        message: string;
    }>> {
        try {
            // TODO: Implement status check endpoint
            // const response = await apiClient.get(`/api/register/status/${referenceNumber}`);

            return {
                success: true,
                data: {
                    status: 'pending',
                    message: 'Your registration is being reviewed',
                },
            };
        } catch (error) {
            return handleApiError(error);
        }
    },
};

// Export the API client for direct use if needed
export { apiClient };

// Export default
export default api;
