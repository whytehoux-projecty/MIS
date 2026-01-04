/**
 * Theming System for Central Auth SDK
 */

export interface Theme {
    colors: {
        primary: string;
        primaryHover: string;
        secondary: string;
        background: string;
        surface: string;
        surfaceHover: string;
        text: string;
        textSecondary: string;
        textMuted: string;
        border: string;
        error: string;
        errorBackground: string;
        success: string;
        successBackground: string;
        warning: string;
        warningBackground: string;
    };
    fonts: {
        heading: string;
        body: string;
        mono: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
    };
}

/**
 * Default light theme
 */
export const defaultTheme: Theme = {
    colors: {
        primary: '#10b981',
        primaryHover: '#059669',
        secondary: '#3b82f6',
        background: '#ffffff',
        surface: '#f9fafb',
        surfaceHover: '#f3f4f6',
        text: '#1f2937',
        textSecondary: '#4b5563',
        textMuted: '#9ca3af',
        border: '#e5e7eb',
        error: '#ef4444',
        errorBackground: '#fef2f2',
        success: '#10b981',
        successBackground: '#ecfdf5',
        warning: '#f59e0b',
        warningBackground: '#fffbeb',
    },
    fonts: {
        heading: 'Inter, system-ui, -apple-system, sans-serif',
        body: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace',
    },
    borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
    },
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
};

/**
 * Dark theme
 */
export const darkTheme: Theme = {
    colors: {
        primary: '#10b981',
        primaryHover: '#34d399',
        secondary: '#60a5fa',
        background: '#111827',
        surface: '#1f2937',
        surfaceHover: '#374151',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        textMuted: '#6b7280',
        border: '#374151',
        error: '#f87171',
        errorBackground: '#450a0a',
        success: '#34d399',
        successBackground: '#064e3b',
        warning: '#fbbf24',
        warningBackground: '#451a03',
    },
    fonts: {
        heading: 'Inter, system-ui, -apple-system, sans-serif',
        body: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace',
    },
    borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
    },
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    },
};

/**
 * Create a custom theme by merging with defaults
 */
export const createTheme = (overrides: Partial<Theme>): Theme => ({
    ...defaultTheme,
    ...overrides,
    colors: { ...defaultTheme.colors, ...overrides.colors },
    fonts: { ...defaultTheme.fonts, ...overrides.fonts },
    borderRadius: { ...defaultTheme.borderRadius, ...overrides.borderRadius },
    shadows: { ...defaultTheme.shadows, ...overrides.shadows },
});
