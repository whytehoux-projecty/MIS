/**
 * English (Default) Translations
 */

import type { Translations } from './types';

export const en: Translations = {
    login: {
        title: 'Sign In',
        subtitle: 'Scan the QR code with your mobile app to sign in',
        manualEntryLink: 'Enter membership key manually',
        qrCodeLink: 'Use QR Code instead',
        membershipKeyLabel: 'Membership Key',
        membershipKeyPlaceholder: 'Enter your membership key',
        signInButton: 'Sign In',
        poweredBy: 'Powered by',
    },

    qrDisplay: {
        instructions: 'Open your mobile app and scan this QR code to sign in',
        expiredMessage: 'QR Code has expired. Please generate a new one.',
        generateNewButton: 'Generate New QR Code',
    },

    pinEntry: {
        title: 'Enter PIN',
        subtitle: 'Enter the 6-digit PIN shown on your mobile device',
        verifyButton: 'Verify PIN',
        digitLabel: 'Digit {current} of {total}',
    },

    authStatus: {
        notSignedIn: 'Not signed in',
        sessionLabel: 'Session',
        signOutButton: 'Sign Out',
    },

    qrScanner: {
        permissionTitle: 'Camera Access Required',
        permissionMessage: 'Please enable camera access in your browser settings to scan QR codes.',
        tryAgainButton: 'Try Again',
        noCameraError: 'No camera found on this device.',
        initializingCamera: 'Initializing camera...',
        scanInstructions: 'Position the QR code within the frame to scan',
    },

    loginButton: {
        defaultText: 'Sign In with QR Code',
    },

    states: {
        loading: 'Loading...',
        verifying: 'Verifying PIN...',
        generatingQR: 'Generating QR Code...',
        success: 'Success!',
        error: 'Error',
        expired: 'Expired',
    },

    success: {
        signedIn: 'Successfully Signed In!',
        welcomeBack: 'Welcome back, {name}',
        qrScanned: 'QR Code scanned! Enter the PIN shown on your mobile device.',
    },

    errors: {
        generic: 'Something went wrong. Please try again.',
        invalidPin: 'Invalid PIN. Please check and try again.',
        invalidKey: 'Invalid membership key. Please check and try again.',
        qrExpired: 'QR code has expired. Please generate a new one.',
        networkError: 'Network error. Please check your connection.',
        sessionExpired: 'Your session has expired. Please sign in again.',
        cameraPermissionDenied: 'Camera permission denied. Please enable camera access.',
    },

    alerts: {
        qrScannedEnterPin: 'QR Code scanned! Enter the PIN shown on your mobile device.',
        qrExpiredGenerateNew: 'QR Code has expired. Please generate a new one.',
    },
};
