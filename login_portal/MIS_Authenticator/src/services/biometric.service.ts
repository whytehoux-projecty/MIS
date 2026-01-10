import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricService = {
    /**
     * Check if device has biometric hardware
     */
    checkHardware: async (): Promise<boolean> => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        return hasHardware;
    },

    /**
     * Check if user has enrolled biometrics
     */
    isEnrolled: async (): Promise<boolean> => {
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return isEnrolled;
    },

    /**
     * Get supported authentication types (Fingerprint, Facial, Iris)
     */
    getSupportedTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
        return await LocalAuthentication.supportedAuthenticationTypesAsync();
    },

    /**
     * Prompt user for biometric authentication
     */
    authenticate: async (reason: string = 'Authenticate to access secure keys'): Promise<boolean> => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            // Logic for Fallback or Error
            console.warn("Biometrics not available or enrolled");
            return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: reason,
            fallbackLabel: 'Enter PIN',
            disableDeviceFallback: false,
        });

        return result.success;
    }
};
