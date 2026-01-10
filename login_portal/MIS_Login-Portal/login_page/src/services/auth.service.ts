import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { environment } from '../environments/environment';
import {
    QRGenerateRequest,
    QRGenerateResponse,
    PINVerifyRequest,
    PINVerifyResponse
} from '../models/auth.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private api = inject(ApiService);
    private session = inject(SessionService);

    // State signals
    private _isLoading = signal(false);
    private _error = signal<string | null>(null);
    private _qrData = signal<QRGenerateResponse | null>(null);
    private _qrExpiresAt = signal<Date | null>(null);

    // Public computed signals
    isLoading = this._isLoading.asReadonly();
    error = this._error.asReadonly();
    qrImage = computed(() => this._qrData()?.qr_image || null);
    qrToken = computed(() => this._qrData()?.qr_token || null);
    qrExpiresAt = this._qrExpiresAt.asReadonly();
    isLoggedIn = this.session.isLoggedIn;
    currentUser = this.session.currentUser;

    /**
     * Generate a new QR code for login
     */
    async generateQRCode(): Promise<boolean> {
        this._isLoading.set(true);
        this._error.set(null);

        try {
            const request: QRGenerateRequest = {
                service_id: environment.serviceId,
                service_api_key: environment.serviceApiKey
            };

            const response = await firstValueFrom(
                this.api.post<QRGenerateResponse>('/api/auth/qr/generate', request)
            );

            this._qrData.set(response);

            // Calculate expiration time
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + response.expires_in_seconds);
            this._qrExpiresAt.set(expiresAt);

            return true;
        } catch (err) {
            this._error.set((err as Error).message);
            return false;
        } finally {
            this._isLoading.set(false);
        }
    }

    /**
     * Verify PIN and complete login
     */
    async verifyPIN(pin: string): Promise<boolean> {
        const qrToken = this._qrData()?.qr_token;

        if (!qrToken) {
            this._error.set('No QR code generated. Please generate a new QR code.');
            return false;
        }

        this._isLoading.set(true);
        this._error.set(null);

        try {
            const request: PINVerifyRequest = {
                qr_token: qrToken,
                pin: pin
            };

            const response = await firstValueFrom(
                this.api.post<PINVerifyResponse>('/api/auth/pin/verify', request)
            );

            if (response.success) {
                // Store session
                this.session.setSession(response.session_token, response.user_info);

                // Clear QR data
                this._qrData.set(null);
                this._qrExpiresAt.set(null);

                return true;
            } else {
                this._error.set('Invalid PIN. Please try again.');
                return false;
            }
        } catch (err) {
            this._error.set((err as Error).message);
            return false;
        } finally {
            this._isLoading.set(false);
        }
    }

    /**
     * Logout current session
     */
    async logout(): Promise<void> {
        const token = this.session.getToken();

        if (token) {
            try {
                await firstValueFrom(
                    this.api.post('/api/auth/logout', { token })
                );
            } catch {
                // Ignore logout API errors, still clear local session
            }
        }

        this.session.clearSession();
        this._qrData.set(null);
        this._qrExpiresAt.set(null);
        this._error.set(null);
    }

    /**
     * Clear any error state
     */
    clearError(): void {
        this._error.set(null);
    }
}
