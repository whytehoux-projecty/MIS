import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "../services/apiService";

interface User {
    id: number;
    email: string;
    username: string;
    full_name: string;
    role: string;
    is_active?: boolean;
    created_at?: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    tokens: AuthTokens | null;
    loading: boolean;
    error: string | null;
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    setTokens: (tokens: AuthTokens | null) => void;
    clearError: () => void;
    loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            tokens: null,
            loading: false,
            error: null,

            login: async (credentials) => {
                set({ loading: true, error: null });
                try {
                    const result = await apiService.auth.login(credentials);
                    set({
                        isAuthenticated: true,
                        user: result.user,
                        tokens: result.tokens,
                        loading: false,
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        isAuthenticated: false,
                        user: null,
                        tokens: null,
                        loading: false,
                        error: error.response?.data?.detail || 'Login failed',
                    });
                    throw error;
                }
            },

            logout: async () => {
                await apiService.auth.logout();
                set({
                    isAuthenticated: false,
                    user: null,
                    tokens: null,
                    loading: false,
                    error: null,
                });
            },

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            setTokens: (tokens) => {
                set({ tokens, isAuthenticated: !!tokens });
                // Also sync to apiService
                if (tokens) {
                    apiService.setTokens(tokens);
                }
            },

            clearError: () => {
                set({ error: null });
            },

            loadStoredAuth: async () => {
                try {
                    const result = await apiService.auth.loadStoredAuth();
                    if (result.tokens && result.user) {
                        set({
                            isAuthenticated: true,
                            user: result.user,
                            tokens: result.tokens,
                            loading: false,
                        });
                    } else {
                        set({
                            isAuthenticated: false,
                            user: null,
                            tokens: null,
                            loading: false,
                        });
                    }
                } catch (error) {
                    console.error('Error loading stored auth:', error);
                    set({
                        isAuthenticated: false,
                        user: null,
                        tokens: null,
                        loading: false,
                    });
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                tokens: state.tokens,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
