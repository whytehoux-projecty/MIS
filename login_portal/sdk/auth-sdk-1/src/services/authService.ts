/**
 * Auth Service - Handles all API communication for authentication
 */

import axios, { AxiosInstance } from 'axios';
import type {
    AuthConfig,
    QRGenerateResponse,
    QRScanResponse,
    PinVerifyResponse,
    ValidateSessionResponse
} from '../types';

export class AuthService {
    private client: AxiosInstance;
    private config: AuthConfig;

    constructor(config: AuthConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Generate a QR code for login
     * Called by the service displaying the login page
     */
    async generateQR(): Promise<{
        qrToken: string;
        qrImage: string;
        expiresInSeconds: number;
    }> {
        const response = await this.client.post<QRGenerateResponse>('/api/auth/qr/generate', {
            service_id: parseInt(this.config.serviceId),
            service_api_key: this.config.serviceApiKey,
        });

        return {
            qrToken: response.data.qr_token,
            qrImage: response.data.qr_image,
            expiresInSeconds: response.data.expires_in_seconds,
        };
    }

    /**
     * Process a QR scan (called from mobile app)
     * This associates the user with the QR session
     */
    async scanQR(qrToken: string, userAuthKey: string): Promise<{
        success: boolean;
        pin: string;
        message: string;
    }> {
        const response = await this.client.post<QRScanResponse>('/api/auth/qr/scan', {
            qr_token: qrToken,
            user_auth_key: userAuthKey,
        });

        return {
            success: response.data.success,
            pin: response.data.pin,
            message: response.data.message,
        };
    }

    /**
     * Verify PIN and get session token
     * Called after user enters PIN on login page
     */
    async verifyPin(qrToken: string, pin: string): Promise<{
        sessionToken: string;
        user: {
            id: number;
            username: string;
            fullName: string;
            email: string;
        };
        expiresIn: number;
    }> {
        const response = await this.client.post<PinVerifyResponse>('/api/auth/pin/verify', {
            qr_token: qrToken,
            pin: pin,
        });

        return {
            sessionToken: response.data.session_token,
            user: {
                id: response.data.user_info.user_id,
                username: response.data.user_info.username,
                fullName: response.data.user_info.full_name,
                email: response.data.user_info.email,
            },
            expiresIn: response.data.expires_in_seconds,
        };
    }

    /**
     * Validate an existing session token
     */
    async validateSession(token: string): Promise<boolean> {
        try {
            const response = await this.client.post<ValidateSessionResponse>(
                '/api/auth/validate-session',
                {},
                { params: { token } }
            );
            return response.data.valid === true;
        } catch {
            return false;
        }
    }

    /**
     * Logout and invalidate session
     */
    async logout(token: string): Promise<void> {
        try {
            await this.client.post(
                '/api/auth/logout',
                {},
                { params: { token } }
            );
        } catch (error) {
            // Logout errors are not critical
            console.warn('Logout API call failed:', error);
        }
    }

    /**
     * Check system status (operating hours)
     */
    async getSystemStatus(): Promise<{
        status: 'open' | 'closed';
        warning: boolean;
        message: string;
    }> {
        const response = await this.client.get('/api/system/status');
        return response.data;
    }

    /**
     * Poll for QR scan status
     * Returns true when the QR has been scanned
     */
    async checkQRStatus(qrToken: string): Promise<{
        scanned: boolean;
        verified: boolean;
    }> {
        // Note: This endpoint might need to be implemented in the backend
        // For now, we'll use a polling approach with pin verification
        try {
            const response = await this.client.get(`/api/auth/qr/status/${qrToken}`);
            return {
                scanned: response.data.scanned || false,
                verified: response.data.verified || false,
            };
        } catch {
            return { scanned: false, verified: false };
        }
    }
}
