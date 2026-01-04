/**
 * useQRAuth Hook
 * 
 * Hook for managing the QR code authentication flow.
 * Handles QR generation, real-time scan detection (WebSocket or polling), and PIN verification.
 * 
 * @example
 * ```tsx
 * function QRLoginPage() {
 *   const { 
 *     step, 
 *     qrImage, 
 *     expiresIn,
 *     startQRAuth, 
 *     verifyPin,
 *     reset 
 *   } = useQRAuth();
 *   
 *   useEffect(() => { startQRAuth(); }, []);
 *   
 *   return (
 *     <div>
 *       {step === 'waiting' && <img src={qrImage} />}
 *       {step === 'scanned' && <PinEntry onSubmit={verifyPin} />}
 *       {step === 'success' && <p>Logged in!</p>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthContext } from '../AuthProvider';
import { WebSocketService, isWebSocketSupported } from '../services/websocketService';
import type { QRAuthState, User, Session } from '../types';

export interface UseQRAuthOptions {
    /** Use WebSocket for real-time scan detection (default: true if supported) */
    useWebSocket?: boolean;
    /** WebSocket URL (default: derives from apiUrl) */
    websocketUrl?: string;
    /** Polling interval in ms if not using WebSocket (default: 2000) */
    pollingInterval?: number;
}

export const useQRAuth = (options: UseQRAuthOptions = {}) => {
    const { authService, setUser, setSession, config } = useAuthContext();

    // Options with defaults
    const {
        useWebSocket = isWebSocketSupported(),
        websocketUrl,
        pollingInterval = 2000,
    } = options;

    const [state, setState] = useState<QRAuthState>({
        step: 'idle',
        qrToken: null,
        qrImage: null,
        pin: null,
        expiresIn: null,
        error: null,
    });

    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    // Refs for timers and WebSocket
    const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const wsServiceRef = useRef<WebSocketService | null>(null);
    const wsUnsubscribeRef = useRef<(() => void) | null>(null);

    // Derive WebSocket URL from API URL if not provided
    const getWebSocketUrl = useCallback(() => {
        if (websocketUrl) return websocketUrl;

        // Convert http(s) to ws(s)
        const apiUrl = config.apiUrl;
        const wsUrl = apiUrl.replace(/^http/, 'ws');
        return `${wsUrl}/ws/qr-status`;
    }, [websocketUrl, config.apiUrl]);

    // Initialize WebSocket service
    const initWebSocket = useCallback(async () => {
        if (!useWebSocket || wsServiceRef.current) return;

        try {
            setConnectionStatus('connecting');
            wsServiceRef.current = new WebSocketService({
                url: getWebSocketUrl(),
                maxReconnectAttempts: 3,
                reconnectDelay: 1000,
            });

            wsServiceRef.current.onStatusChange((status) => {
                setConnectionStatus(status);
            });

            await wsServiceRef.current.connect();
        } catch (error) {
            console.warn('[useQRAuth] WebSocket connection failed, falling back to polling');
            setConnectionStatus('error');
        }
    }, [useWebSocket, getWebSocketUrl]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (wsUnsubscribeRef.current) wsUnsubscribeRef.current();
            if (wsServiceRef.current) {
                wsServiceRef.current.disconnect();
                wsServiceRef.current = null;
            }
        };
    }, []);

    /**
     * Start the QR authentication flow
     * Generates a QR code and starts listening for scan (WebSocket or polling)
     */
    const startQRAuth = useCallback(async () => {
        // Clear any existing timers/subscriptions
        if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        if (wsUnsubscribeRef.current) wsUnsubscribeRef.current();

        setState(prev => ({ ...prev, step: 'generating', error: null }));

        try {
            // Generate QR code
            const result = await authService.generateQR();

            setState({
                step: 'waiting',
                qrToken: result.qrToken,
                qrImage: result.qrImage,
                pin: null,
                expiresIn: result.expiresInSeconds,
                error: null,
            });

            // Start countdown timer
            expiryTimerRef.current = setInterval(() => {
                setState(prev => {
                    if (prev.expiresIn === null || prev.expiresIn <= 1) {
                        // QR expired
                        if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
                        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                        if (wsUnsubscribeRef.current) wsUnsubscribeRef.current();
                        return { ...prev, step: 'expired', expiresIn: 0 };
                    }
                    return { ...prev, expiresIn: prev.expiresIn - 1 };
                });
            }, 1000);

            // Use WebSocket if available and connected
            if (useWebSocket && wsServiceRef.current?.isConnected()) {
                // Subscribe to scan updates via WebSocket
                wsUnsubscribeRef.current = wsServiceRef.current.subscribe(
                    result.qrToken,
                    (update) => {
                        if (update.scanned) {
                            if (wsUnsubscribeRef.current) wsUnsubscribeRef.current();
                            setState(prev => ({ ...prev, step: 'scanned' }));
                        }
                    }
                );
            } else {
                // Fall back to polling
                pollTimerRef.current = setInterval(async () => {
                    try {
                        const status = await authService.checkQRStatus(result.qrToken);
                        if (status.scanned) {
                            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                            setState(prev => ({ ...prev, step: 'scanned' }));
                        }
                    } catch {
                        // Polling error, continue polling
                    }
                }, pollingInterval);
            }

            // Try to initialize WebSocket for future use if not already connected
            if (useWebSocket && !wsServiceRef.current) {
                initWebSocket();
            }

        } catch (error) {
            setState(prev => ({
                ...prev,
                step: 'error',
                error: error instanceof Error ? error.message : 'Failed to generate QR code',
            }));
        }
    }, [authService, useWebSocket, pollingInterval, initWebSocket]);

    /**
     * Verify the PIN entered by the user
     */
    const verifyPin = useCallback(async (pin: string) => {
        if (!state.qrToken) {
            setState(prev => ({ ...prev, error: 'No QR session active' }));
            return;
        }

        setState(prev => ({ ...prev, step: 'verifying', error: null }));

        try {
            const result = await authService.verifyPin(state.qrToken, pin);

            // Create session
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + result.expiresIn);

            const session: Session = {
                accessToken: result.sessionToken,
                tokenType: 'bearer',
                expiresAt,
                expiresIn: result.expiresIn,
            };

            const user: User = {
                id: result.user.id,
                username: result.user.username,
                fullName: result.user.fullName,
                email: result.user.email,
            };

            // Update auth context
            setSession(session);
            setUser(user);

            // Clear timers
            if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);

            setState(prev => ({
                ...prev,
                step: 'success',
                pin: null,
            }));

            // Call success callback
            config.callbacks?.onLoginSuccess?.(user, session);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'PIN verification failed';
            setState(prev => ({
                ...prev,
                step: 'error',
                error: errorMessage,
            }));
            config.callbacks?.onLoginError?.(error instanceof Error ? error : new Error(errorMessage));
        }
    }, [state.qrToken, authService, setSession, setUser, config.callbacks]);

    /**
     * Reset the QR auth flow
     */
    const reset = useCallback(() => {
        if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        if (wsUnsubscribeRef.current) wsUnsubscribeRef.current();

        setState({
            step: 'idle',
            qrToken: null,
            qrImage: null,
            pin: null,
            expiresIn: null,
            error: null,
        });
    }, []);

    /**
     * Retry after error or expiry
     */
    const retry = useCallback(() => {
        reset();
        startQRAuth();
    }, [reset, startQRAuth]);

    return {
        // State
        step: state.step,
        qrToken: state.qrToken,
        qrImage: state.qrImage,
        pin: state.pin,
        expiresIn: state.expiresIn,
        error: state.error,

        // Connection status (for WebSocket)
        connectionStatus,
        isUsingWebSocket: useWebSocket && connectionStatus === 'connected',

        // Computed
        isLoading: state.step === 'generating' || state.step === 'verifying',
        isWaiting: state.step === 'waiting',
        isExpired: state.step === 'expired',
        isSuccess: state.step === 'success',
        hasError: state.step === 'error',

        // Actions
        startQRAuth,
        verifyPin,
        reset,
        retry,
    };
};
