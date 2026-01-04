/**
 * Type definitions for Central Auth SDK
 */

/**
 * Configuration for the AuthProvider
 */
export interface AuthConfig {
    /** Base URL of the Central Auth API */
    apiUrl: string;

    /** Your registered service ID */
    serviceId: string;

    /** Your service API key (for QR generation) */
    serviceApiKey: string;

    /** Color theme: 'light', 'dark', or 'auto' (follows system) */
    theme?: 'light' | 'dark' | 'auto';

    /** Custom branding options */
    branding?: {
        /** Company/App name to display */
        name?: string;
        /** Logo URL */
        logo?: string;
        /** Primary accent color (hex) */
        primaryColor?: string;
        /** Background color (hex) */
        backgroundColor?: string;
    };

    /** Callback functions */
    callbacks?: {
        /** Called when login succeeds */
        onLoginSuccess?: (user: User, session: Session) => void;
        /** Called when login fails */
        onLoginError?: (error: Error) => void;
        /** Called when user logs out */
        onLogout?: () => void;
        /** Called when session expires */
        onSessionExpired?: () => void;
    };

    /** Session configuration */
    session?: {
        /** Auto-refresh session before expiry (default: true) */
        autoRefresh?: boolean;
        /** Storage type for session (default: 'localStorage') */
        storage?: 'localStorage' | 'sessionStorage' | 'memory';
        /** Custom storage key (default: 'central_auth_session') */
        storageKey?: string;
    };
}

/**
 * Authenticated user information
 */
export interface User {
    /** User's unique ID */
    id: number;
    /** Username */
    username: string;
    /** User's full name */
    fullName: string;
    /** Email address */
    email: string;
    /** User's auth key (for QR scanning) */
    authKey?: string;
}

/**
 * Active session information
 */
export interface Session {
    /** JWT access token */
    accessToken: string;
    /** Token type (usually 'bearer') */
    tokenType: string;
    /** When the session expires */
    expiresAt: Date;
    /** Seconds until expiration */
    expiresIn: number;
}

/**
 * Overall authentication state
 */
export interface AuthState {
    /** Whether the user is currently authenticated */
    isAuthenticated: boolean;
    /** Current user (null if not authenticated) */
    user: User | null;
    /** Current session (null if not authenticated) */
    session: Session | null;
    /** Whether auth state is being loaded */
    loading: boolean;
    /** Last error that occurred */
    error: string | null;
}

/**
 * State for QR authentication flow
 */
export interface QRAuthState {
    /** Current step in the QR auth flow */
    step: 'idle' | 'generating' | 'waiting' | 'scanned' | 'verifying' | 'success' | 'error' | 'expired';
    /** QR code token */
    qrToken: string | null;
    /** QR code image (base64) */
    qrImage: string | null;
    /** PIN to verify (shown to user after scan) */
    pin: string | null;
    /** Seconds until QR expires */
    expiresIn: number | null;
    /** Error message if any */
    error: string | null;
}

/**
 * Manual login credentials (alternative to QR)
 */
export interface LoginCredentials {
    /** Membership key or auth key */
    membershipKey: string;
}

/**
 * API Response types
 */
export interface QRGenerateResponse {
    qr_token: string;
    qr_image: string;
    expires_in_seconds: number;
}

export interface QRScanResponse {
    success: boolean;
    pin: string;
    message: string;
}

export interface PinVerifyResponse {
    success: boolean;
    session_token: string;
    user_info: {
        user_id: number;
        username: string;
        full_name: string;
        email: string;
    };
    expires_in_seconds: number;
}

export interface ValidateSessionResponse {
    valid: boolean;
    user_id?: number;
    username?: string;
    expires_at?: string;
}
