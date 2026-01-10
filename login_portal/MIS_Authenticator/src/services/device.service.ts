import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface DeviceInfo {
    model: string | null;
    os: string;
    osVersion: string | number;
    name: string | null;
    manufacturer: string | null;
    fingerprint: string;
}

export const DeviceService = {
    /**
     * Get device information for fingerprinting and audit
     */
    getDeviceInfo: (): DeviceInfo => {
        // Generate a pseudo-fingerprint based on hardware traits
        // In production, might want something more robust or persistent (e.g. secure store UUID)
        const fingerprint = `${Device.manufacturer || 'unknown'}:${Device.modelName || 'unknown'}:${Platform.OS}`;

        return {
            model: Device.modelName,
            os: Platform.OS,
            osVersion: Platform.Version,
            name: Device.deviceName,
            manufacturer: Device.manufacturer,
            fingerprint: fingerprint
        };
    }
};
