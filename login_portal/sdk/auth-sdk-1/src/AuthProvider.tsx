/**
 * AuthProvider - Core context provider for the Auth SDK
 * 
 * Wrap your application with this provider to enable authentication.
 * 
 * @example
 * ```tsx
 * <AuthProvider config={{
 *   apiUrl: 'https://api.example.com',
 *   serviceId: '1',
 *   serviceApiKey: 'your-api-key',
 * }}>
 *   <App />
 * </AuthProvider>
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthConfig, AuthState, User, Session } from './types';
import { AuthService } from './services/authService';

interface AuthContextValue extends AuthState {
    /** Configuration passed to AuthProvider */
    config: AuthConfig;
    /** Auth service instance for API calls */
    authService: AuthService;
    /** Login with membership key */
    login: (membershipKey: string) => Promise<void>;
    /** Logout and clear session */
    logout: () => Promise<void>;
    /** Refresh current session */
    refreshSession: () => Promise<void>;
    /** Set user after successful auth */
    setUser: (user: User) => void;
    /** Set session after successful auth */
    setSession: (session: Session) => void;
    /** Clear any errors */
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    config: AuthConfig;
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ config, children }) => {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUserState] = useState<User | null>(null);
    const [session, setSessionState] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create auth service instance
    const authService = useMemo(() => new AuthService(config), [config]);

    // Storage key for session
    const storageKey = config.session?.storageKey || 'central_auth_session';

    // Get storage based on config
    const getStorage = useCallback(() => {
        const storageType = config.session?.storage || 'localStorage';
        if (storageType === 'sessionStorage') return sessionStorage;
        if (storageType === 'memory') return null; // No persistence
        return localStorage;
    }, [config.session?.storage]);

    // Load stored session on mount
    useEffect(() => {
        const loadStoredSession = async () => {
            try {
                const storage = getStorage();
                if (!storage) {
                    setLoading(false);
                    return;
                }

                const storedData = storage.getItem(storageKey);
                if (!storedData) {
                    setLoading(false);
                    return;
                }

                const { session: storedSession, user: storedUser } = JSON.parse(storedData);

                // Check if session is expired
                const expiresAt = new Date(storedSession.expiresAt);
                if (expiresAt <= new Date()) {
                    // Session expired
                    storage.removeItem(storageKey);
                    config.callbacks?.onSessionExpired?.();
                    setLoading(false);
                    return;
                }

                // Validate session with server
                const isValid = await authService.validateSession(storedSession.accessToken);

                if (isValid) {
                    setUserState(storedUser);
                    setSessionState({
                        ...storedSession,
                        expiresAt: new Date(storedSession.expiresAt),
                    });
                    setIsAuthenticated(true);
                } else {
                    // Session invalid, clear storage
                    storage.removeItem(storageKey);
                }
            } catch (err) {
                console.error('Error loading stored session:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStoredSession();
    }, [authService, getStorage, storageKey, config.callbacks]);

    // Save session to storage when it changes
    useEffect(() => {
        const storage = getStorage();
        if (!storage) return;

        if (session && user) {
            storage.setItem(storageKey, JSON.stringify({
                session: {
                    ...session,
                    expiresAt: session.expiresAt.toISOString(),
                },
                user,
            }));
        }
    }, [session, user, getStorage, storageKey]);

    // Login function
    const login = useCallback(async (membershipKey: string) => {
        setLoading(true);
        setError(null);

        try {
            const isValid = await authService.validateSession(membershipKey);

            if (!isValid) {
                throw new Error('Invalid membership key');
            }

            // For membership key login, we don't get full user info
            // The service should provide a way to get user details
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);

            const newSession: Session = {
                accessToken: membershipKey,
                tokenType: 'bearer',
                expiresAt,
                expiresIn: 30 * 60,
            };

            setSessionState(newSession);
            setIsAuthenticated(true);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            config.callbacks?.onLoginError?.(err instanceof Error ? err : new Error(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [authService, config.callbacks]);

    // Logout function
    const logout = useCallback(async () => {
        try {
            if (session?.accessToken) {
                await authService.logout(session.accessToken);
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear state regardless of API result
            setUserState(null);
            setSessionState(null);
            setIsAuthenticated(false);

            // Clear storage
            const storage = getStorage();
            if (storage) {
                storage.removeItem(storageKey);
            }

            config.callbacks?.onLogout?.();
        }
    }, [session, authService, getStorage, storageKey, config.callbacks]);

    // Refresh session
    const refreshSession = useCallback(async () => {
        if (!session?.accessToken) return;

        try {
            const isValid = await authService.validateSession(session.accessToken);
            if (!isValid) {
                await logout();
                config.callbacks?.onSessionExpired?.();
            }
        } catch (err) {
            console.error('Session refresh error:', err);
        }
    }, [session, authService, logout, config.callbacks]);

    // Set user (called from QR auth flow)
    const setUser = useCallback((newUser: User) => {
        setUserState(newUser);
        if (session) {
            config.callbacks?.onLoginSuccess?.(newUser, session);
        }
    }, [session, config.callbacks]);

    // Set session (called from QR auth flow)
    const setSession = useCallback((newSession: Session) => {
        setSessionState(newSession);
        setIsAuthenticated(true);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Context value
    const value: AuthContextValue = {
        isAuthenticated,
        user,
        session,
        loading,
        error,
        config,
        authService,
        login,
        logout,
        refreshSession,
        setUser,
        setSession,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access the AuthContext
 * Must be used within an AuthProvider
 */
export const useAuthContext = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }

    return context;
};
