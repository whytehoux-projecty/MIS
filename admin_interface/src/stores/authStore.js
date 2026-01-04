import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "../services/apiService";
export const useAuthStore = create()(persist((set, get) => ({
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
        }
        catch (error) {
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
            }
            else {
                set({
                    isAuthenticated: false,
                    user: null,
                    tokens: null,
                    loading: false,
                });
            }
        }
        catch (error) {
            console.error('Error loading stored auth:', error);
            set({
                isAuthenticated: false,
                user: null,
                tokens: null,
                loading: false,
            });
        }
    },
}), {
    name: "auth-storage",
    partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
    }),
}));
