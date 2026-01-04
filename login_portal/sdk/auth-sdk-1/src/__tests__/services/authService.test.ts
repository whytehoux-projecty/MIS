/**
 * AuthService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthService } from '../../services/authService';
import type { AuthConfig } from '../../types';

// Mock axios
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            post: vi.fn(),
            get: vi.fn(),
        })),
    },
}));

describe('AuthService', () => {
    let authService: AuthService;
    let mockAxiosInstance: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };

    const mockConfig: AuthConfig = {
        apiUrl: 'https://api.example.com',
        serviceId: '1',
        serviceApiKey: 'test-api-key',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockAxiosInstance = {
            post: vi.fn(),
            get: vi.fn(),
        };

        (axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance);

        authService = new AuthService(mockConfig);
    });

    describe('constructor', () => {
        it('should create an axios instance with correct config', () => {
            expect(axios.create).toHaveBeenCalledWith({
                baseURL: mockConfig.apiUrl,
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });
    });

    describe('generateQR', () => {
        it('should generate a QR code and return formatted response', async () => {
            const mockResponse = {
                data: {
                    qr_token: 'test-token-123',
                    qr_image: 'data:image/png;base64,test',
                    expires_in_seconds: 120,
                },
            };

            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const result = await authService.generateQR();

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/qr/generate', {
                service_id: 1,
                service_api_key: mockConfig.serviceApiKey,
            });

            expect(result).toEqual({
                qrToken: 'test-token-123',
                qrImage: 'data:image/png;base64,test',
                expiresInSeconds: 120,
            });
        });

        it('should throw error on API failure', async () => {
            mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

            await expect(authService.generateQR()).rejects.toThrow('Network error');
        });
    });

    describe('scanQR', () => {
        it('should send scan request and return formatted response', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    pin: '123456',
                    message: 'Scan successful',
                },
            };

            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const result = await authService.scanQR('qr-token', 'user-auth-key');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/qr/scan', {
                qr_token: 'qr-token',
                user_auth_key: 'user-auth-key',
            });

            expect(result).toEqual({
                success: true,
                pin: '123456',
                message: 'Scan successful',
            });
        });
    });

    describe('verifyPin', () => {
        it('should verify PIN and return session data', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    session_token: 'jwt-token-here',
                    user_info: {
                        user_id: 1,
                        username: 'testuser',
                        full_name: 'Test User',
                        email: 'test@example.com',
                    },
                    expires_in_seconds: 3600,
                },
            };

            mockAxiosInstance.post.mockResolvedValue(mockResponse);

            const result = await authService.verifyPin('qr-token', '123456');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/pin/verify', {
                qr_token: 'qr-token',
                pin: '123456',
            });

            expect(result).toEqual({
                sessionToken: 'jwt-token-here',
                user: {
                    id: 1,
                    username: 'testuser',
                    fullName: 'Test User',
                    email: 'test@example.com',
                },
                expiresIn: 3600,
            });
        });
    });

    describe('validateSession', () => {
        it('should return true for valid session', async () => {
            mockAxiosInstance.post.mockResolvedValue({
                data: { valid: true },
            });

            const result = await authService.validateSession('valid-token');

            expect(result).toBe(true);
        });

        it('should return false for invalid session', async () => {
            mockAxiosInstance.post.mockResolvedValue({
                data: { valid: false },
            });

            const result = await authService.validateSession('invalid-token');

            expect(result).toBe(false);
        });

        it('should return false on error', async () => {
            mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

            const result = await authService.validateSession('any-token');

            expect(result).toBe(false);
        });
    });

    describe('logout', () => {
        it('should call logout endpoint', async () => {
            mockAxiosInstance.post.mockResolvedValue({});

            await authService.logout('session-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/api/auth/logout',
                {},
                { params: { token: 'session-token' } }
            );
        });

        it('should not throw error on logout failure', async () => {
            mockAxiosInstance.post.mockRejectedValue(new Error('Server error'));

            // Should not throw
            await expect(authService.logout('token')).resolves.not.toThrow();
        });
    });

    describe('getSystemStatus', () => {
        it('should return system status', async () => {
            const mockResponse = {
                data: {
                    status: 'open',
                    warning: false,
                    message: 'System is operating normally',
                },
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await authService.getSystemStatus();

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/system/status');
            expect(result).toEqual({
                status: 'open',
                warning: false,
                message: 'System is operating normally',
            });
        });
    });

    describe('checkQRStatus', () => {
        it('should return QR status', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: { scanned: true, verified: false },
            });

            const result = await authService.checkQRStatus('qr-token');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/qr/status/qr-token');
            expect(result).toEqual({ scanned: true, verified: false });
        });

        it('should return default values on error', async () => {
            mockAxiosInstance.get.mockRejectedValue(new Error('Not found'));

            const result = await authService.checkQRStatus('invalid-token');

            expect(result).toEqual({ scanned: false, verified: false });
        });
    });
});
