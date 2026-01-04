/**
 * useSession Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useSession } from '../../hooks/useSession';
import { AuthProvider } from '../../AuthProvider';
import type { AuthConfig } from '../../types';

// Mock authService
vi.mock('../../services/authService', () => ({
    AuthService: vi.fn().mockImplementation(() => ({
        validateSession: vi.fn().mockResolvedValue(false),
        logout: vi.fn().mockResolvedValue(undefined),
    })),
}));

describe('useSession Hook', () => {
    const mockConfig: AuthConfig = {
        apiUrl: 'https://api.example.com',
        serviceId: '1',
        serviceApiKey: 'test-key',
    };

    const createWrapper = () => {
        return function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(AuthProvider, { config: mockConfig, children });
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('should return null expiresIn when not authenticated', async () => {
            const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

            // Wait for initial load
            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(result.current.expiresIn).toBeNull();
            expect(result.current.expiresInFormatted).toBeNull();
        });

        it('should return isActive as false when not authenticated', async () => {
            const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(result.current.isActive).toBe(false);
        });

        it('should return isExpiringSoon as false when not authenticated', async () => {
            const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(result.current.isExpiringSoon).toBe(false);
        });
    });

    describe('formatting', () => {
        it('should provide refresh function', async () => {
            const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(typeof result.current.refresh).toBe('function');
        });

        it('should provide logout function', async () => {
            const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(typeof result.current.logout).toBe('function');
        });
    });
});
