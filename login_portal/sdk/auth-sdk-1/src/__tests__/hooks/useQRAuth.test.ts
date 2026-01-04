/**
 * useQRAuth Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useQRAuth } from '../../hooks/useQRAuth';
import { AuthProvider } from '../../AuthProvider';
import type { AuthConfig } from '../../types';

describe('useQRAuth Hook', () => {
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
    });

    describe('initial state', () => {
        it('should start with idle step', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(result.current.step).toBe('idle');
            expect(result.current.qrToken).toBeNull();
            expect(result.current.qrImage).toBeNull();
            expect(result.current.expiresIn).toBeNull();
            expect(result.current.error).toBeNull();
        });

        it('should have correct computed properties initially', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isWaiting).toBe(false);
            expect(result.current.isExpired).toBe(false);
            expect(result.current.isSuccess).toBe(false);
            expect(result.current.hasError).toBe(false);
        });

        it('should have connectionStatus', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(result.current.connectionStatus).toBeDefined();
        });

        it('should have isUsingWebSocket property', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.isUsingWebSocket).toBe('boolean');
        });
    });

    describe('actions', () => {
        it('should have startQRAuth function', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.startQRAuth).toBe('function');
        });

        it('should have verifyPin function', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.verifyPin).toBe('function');
        });

        it('should have reset function', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.reset).toBe('function');
        });

        it('should have retry function', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            expect(typeof result.current.retry).toBe('function');
        });
    });

    describe('reset', () => {
        it('should reset state to initial values', () => {
            const { result } = renderHook(() => useQRAuth(), { wrapper: createWrapper() });

            // Call reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.step).toBe('idle');
            expect(result.current.qrToken).toBeNull();
            expect(result.current.qrImage).toBeNull();
            expect(result.current.expiresIn).toBeNull();
            expect(result.current.error).toBeNull();
        });
    });

    describe('options', () => {
        it('should accept custom polling interval', () => {
            const { result } = renderHook(
                () => useQRAuth({ pollingInterval: 5000 }),
                { wrapper: createWrapper() }
            );

            expect(result.current.step).toBe('idle');
        });

        it('should accept useWebSocket option', () => {
            const { result } = renderHook(
                () => useQRAuth({ useWebSocket: false }),
                { wrapper: createWrapper() }
            );

            expect(result.current.step).toBe('idle');
        });

        it('should accept custom websocketUrl', () => {
            const { result } = renderHook(
                () => useQRAuth({ websocketUrl: 'wss://custom.com/ws' }),
                { wrapper: createWrapper() }
            );

            expect(result.current.step).toBe('idle');
        });
    });
});
