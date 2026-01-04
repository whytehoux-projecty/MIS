/**
 * useAuth Hook Tests
 * 
 * Tests for the core authentication hook that provides
 * authentication state and methods to components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthProvider } from '../../AuthProvider';
import type { AuthConfig } from '../../types';

// Mock authService
vi.mock('../../services/authService', () => ({
    AuthService: vi.fn().mockImplementation(() => ({
        generateQR: vi.fn(),
        scanQR: vi.fn(),
        verifyPin: vi.fn(),
        validateSession: vi.fn().mockResolvedValue(false),
        logout: vi.fn().mockResolvedValue(undefined),
        getSystemStatus: vi.fn(),
        checkQRStatus: vi.fn(),
    })),
}));

describe('useAuth Hook', () => {
    const mockConfig: AuthConfig = {
        apiUrl: 'https://api.example.com',
        serviceId: '1',
        serviceApiKey: 'test-key',
    };

    /**
     * Creates a wrapper component that provides AuthProvider context
     * to the hook under test.
     */
    const createWrapper = () => {
        return function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(AuthProvider, { config: mockConfig, children });
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Cleanup after each test
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should return initial unauthenticated state', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            // Wait for initial loading to complete using proper Testing Library approach
            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(false);
            });

            expect(result.current.user).toBeNull();
            expect(result.current.session).toBeNull();
            expect(result.current.error).toBeNull();
        });

        it('should provide login function', () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.login).toBe('function');
        });

        it('should provide logout function', () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.logout).toBe('function');
        });

        it('should provide refreshSession function', () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.refreshSession).toBe('function');
        });

        it('should provide clearError function', () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.clearError).toBe('function');
        });
    });

    describe('logout', () => {
        it('should call logout and clear state', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            // Wait for initialization
            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(false);
            });

            await act(async () => {
                await result.current.logout();
            });

            // Verify state is cleared after logout
            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBeNull();
            expect(result.current.session).toBeNull();
        });

        it('should handle logout when not authenticated', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            // Wait for initialization
            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(false);
            });

            // Logout should not throw when already logged out
            await act(async () => {
                await expect(result.current.logout()).resolves.not.toThrow();
            });
        });
    });

    describe('error handling', () => {
        it('should clear error when clearError is called', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.clearError();
            });

            expect(result.current.error).toBeNull();
        });
    });
});

describe('useAuth Hook without AuthProvider', () => {
    it('should throw error when used outside AuthProvider', () => {
        // Suppress console.error for this test since React will log the error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Expect the hook to throw when rendered without provider
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuthContext must be used within an AuthProvider');

        // Verify console.error was called (React logs errors for thrown errors)
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
