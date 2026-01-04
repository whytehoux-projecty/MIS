/**
 * Internationalization Types for Central Auth SDK
 */

/**
 * All translatable strings in the SDK
 */
export interface Translations {
    // Login Page
    login: {
        title: string;
        subtitle: string;
        manualEntryLink: string;
        qrCodeLink: string;
        membershipKeyLabel: string;
        membershipKeyPlaceholder: string;
        signInButton: string;
        poweredBy: string;
    };

    // QR Display
    qrDisplay: {
        instructions: string;
        expiredMessage: string;
        generateNewButton: string;
    };

    // PIN Entry
    pinEntry: {
        title: string;
        subtitle: string;
        verifyButton: string;
        digitLabel: string; // "{current} of {total}"
    };

    // Auth Status
    authStatus: {
        notSignedIn: string;
        sessionLabel: string;
        signOutButton: string;
    };

    // QR Scanner
    qrScanner: {
        permissionTitle: string;
        permissionMessage: string;
        tryAgainButton: string;
        noCameraError: string;
        initializingCamera: string;
        scanInstructions: string;
    };

    // Login Button
    loginButton: {
        defaultText: string;
    };

    // States & Messages
    states: {
        loading: string;
        verifying: string;
        generatingQR: string;
        success: string;
        error: string;
        expired: string;
    };

    // Success Messages
    success: {
        signedIn: string;
        welcomeBack: string; // "Welcome back, {name}"
        qrScanned: string;
    };

    // Error Messages
    errors: {
        generic: string;
        invalidPin: string;
        invalidKey: string;
        qrExpired: string;
        networkError: string;
        sessionExpired: string;
        cameraPermissionDenied: string;
    };

    // Alerts
    alerts: {
        qrScannedEnterPin: string;
        qrExpiredGenerateNew: string;
    };
}

/**
 * Supported locale codes
 */
export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | string;

/**
 * Locale configuration
 */
export interface LocaleConfig {
    /** Current locale code */
    locale: LocaleCode;
    /** Custom translations (partial override) */
    translations?: Partial<Translations>;
    /** Fallback locale when translation is missing */
    fallbackLocale?: LocaleCode;
}
