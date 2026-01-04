# Mobile Auth App - API Integration Guide

## Overview

This document details all API integrations between the Mobile Auth App and the Central Auth API backend.

---

## API Base Configuration

### Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `EXPO_PUBLIC_API_BASE_URL` | `http://192.168.x.x:8000` | `https://api.yourcompany.com` |
| `EXPO_PUBLIC_API_TIMEOUT` | `30000` | `30000` |

### Axios Client Configuration

```typescript
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000');

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request logging
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.detail || 'Server error';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // No response received
      return Promise.reject(new Error('Network error - please check your connection'));
    } else {
      // Request setup error
      return Promise.reject(new Error('Request failed'));
    }
  }
);
```

---

## API Endpoints

### 1. QR Code Scan

**Endpoint:** `POST /api/auth/qr/scan`

**Purpose:** Submit scanned QR token with user's auth key to receive a one-time PIN.

**Request:**

```typescript
interface QRScanRequest {
  qr_token: string;      // UUID from scanned QR code
  user_auth_key: string; // User's permanent auth key
}
```

**Response (Success):**

```typescript
interface QRScanSuccessResponse {
  success: true;
  pin: string;           // 6-digit PIN to display
  expires_in: number;    // Seconds until PIN expires
  service_name: string;  // Name of service requesting auth
}
```

**Response (Error):**

```typescript
interface QRScanErrorResponse {
  success: false;
  error: string;         // Error message
}
```

**Error Codes:**

| Code | Meaning |
|------|---------|
| `QR_NOT_FOUND` | QR token doesn't exist |
| `QR_EXPIRED` | QR code has expired (2 min limit) |
| `QR_ALREADY_USED` | QR code was already scanned |
| `USER_NOT_FOUND` | Auth key doesn't match any user |
| `USER_INACTIVE` | User account is deactivated |
| `SYSTEM_CLOSED` | Authentication system is closed |

**Implementation:**

```typescript
// src/services/api/auth.ts
export async function scanQRCode(
  qrToken: string,
  userAuthKey: string
): Promise<QRScanResponse> {
  try {
    const response = await apiClient.post('/api/auth/qr/scan', {
      qr_token: qrToken,
      user_auth_key: userAuthKey,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

---

### 2. Validate Auth Key

**Endpoint:** `POST /api/auth/validate-key`

**Purpose:** Verify that a user's auth key is valid during onboarding.

**Request:**

```typescript
interface ValidateKeyRequest {
  auth_key: string;
}
```

**Response:**

```typescript
interface ValidateKeyResponse {
  valid: boolean;
  user?: {
    id: number;
    username: string;
    full_name: string;
    email: string;
  };
  error?: string;
}
```

**Implementation:**

```typescript
// src/services/api/auth.ts
export async function validateAuthKey(authKey: string): Promise<ValidateKeyResponse> {
  try {
    const response = await apiClient.post('/api/auth/validate-key', {
      auth_key: authKey,
    });
    return response.data;
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
```

---

### 3. System Status

**Endpoint:** `GET /api/system/status`

**Purpose:** Check if the authentication system is currently available.

**Response:**

```typescript
interface SystemStatusResponse {
  status: 'open' | 'closed';
  warning: boolean;
  message: string;
  closes_at?: string;  // When system is open
  opens_at?: string;   // When system is closed
}
```

**Implementation:**

```typescript
// src/services/api/system.ts
export async function getSystemStatus(): Promise<SystemStatusResponse> {
  const response = await apiClient.get('/api/system/status');
  return response.data;
}
```

---

## Complete API Service

```typescript
// src/services/api/index.ts
import { apiClient } from './client';
import type {
  QRScanRequest,
  QRScanResponse,
  ValidateKeyRequest,
  ValidateKeyResponse,
  SystemStatusResponse,
} from '@types/api';

export const authApi = {
  /**
   * Scan QR code and get PIN
   */
  scanQRCode: async (qrToken: string, userAuthKey: string): Promise<QRScanResponse> => {
    const payload: QRScanRequest = {
      qr_token: qrToken,
      user_auth_key: userAuthKey,
    };
    const response = await apiClient.post<QRScanResponse>('/api/auth/qr/scan', payload);
    return response.data;
  },

  /**
   * Validate user's auth key
   */
  validateKey: async (authKey: string): Promise<ValidateKeyResponse> => {
    const payload: ValidateKeyRequest = { auth_key: authKey };
    const response = await apiClient.post<ValidateKeyResponse>('/api/auth/validate-key', payload);
    return response.data;
  },
};

export const systemApi = {
  /**
   * Get system status
   */
  getStatus: async (): Promise<SystemStatusResponse> => {
    const response = await apiClient.get<SystemStatusResponse>('/api/system/status');
    return response.data;
  },
};

export { apiClient };
```

---

## Hook for QR Scanning

```typescript
// src/hooks/useQRScanner.ts
import { useState, useCallback } from 'react';
import { authApi } from '@services/api';
import { useAuthStore } from '@stores/authStore';
import * as Haptics from 'expo-haptics';

type ScanStep = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

interface ScanResult {
  pin: string;
  expiresIn: number;
  serviceName: string;
}

export function useQRScanner() {
  const [step, setStep] = useState<ScanStep>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const authKey = useAuthStore((state) => state.authKey);

  const handleScan = useCallback(async (qrToken: string) => {
    if (!authKey) {
      setError('No auth key found. Please link your account first.');
      setStep('error');
      return;
    }

    // Validate QR token format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(qrToken)) {
      setError('Invalid QR code format');
      setStep('error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setStep('processing');
    setError(null);

    try {
      const response = await authApi.scanQRCode(qrToken, authKey);

      if (response.success && response.pin) {
        setResult({
          pin: response.pin,
          expiresIn: response.expires_in || 300,
          serviceName: response.service_name || 'Unknown Service',
        });
        setStep('success');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(response.error || 'Scan failed');
        setStep('error');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStep('error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [authKey]);

  const reset = useCallback(() => {
    setStep('idle');
    setResult(null);
    setError(null);
  }, []);

  const startScanning = useCallback(() => {
    setStep('scanning');
    setError(null);
  }, []);

  return {
    step,
    result,
    error,
    handleScan,
    startScanning,
    reset,
  };
}
```

---

## Network Connectivity Handling

```typescript
// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOffline: isConnected === false,
  };
}
```

---

## Error Handling Best Practices

### User-Friendly Error Messages

```typescript
// src/utils/errorMessages.ts
const ERROR_MESSAGES: Record<string, string> = {
  // QR Errors
  QR_NOT_FOUND: 'This QR code is invalid or has already been used.',
  QR_EXPIRED: 'This QR code has expired. Please request a new one.',
  QR_ALREADY_USED: 'This QR code has already been scanned.',
  
  // User Errors
  USER_NOT_FOUND: 'Your account could not be found. Please re-link your account.',
  USER_INACTIVE: 'Your account is not active. Contact support.',
  
  // System Errors
  SYSTEM_CLOSED: 'Authentication is currently unavailable. Please try during operating hours.',
  
  // Network Errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Default
  UNKNOWN: 'Something went wrong. Please try again.',
};

export function getUserFriendlyError(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN;
}
```

---

## Testing API Integration

### Mock Server Setup

For local development without the backend:

```typescript
// src/services/api/mock.ts
export const mockResponses = {
  scanSuccess: {
    success: true,
    pin: '123456',
    expires_in: 300,
    service_name: 'Test Service',
  },
  scanExpired: {
    success: false,
    error: 'QR_EXPIRED',
  },
  systemOpen: {
    status: 'open',
    warning: false,
    message: 'System is operating normally',
    closes_at: '5:00 PM',
  },
};
```

### Integration Test Example

```typescript
// __tests__/services/auth.test.ts
import { authApi } from '@services/api';

describe('Auth API', () => {
  describe('scanQRCode', () => {
    it('should return PIN on successful scan', async () => {
      const result = await authApi.scanQRCode('valid-token', 'valid-key');
      expect(result.success).toBe(true);
      expect(result.pin).toHaveLength(6);
    });

    it('should return error for expired QR', async () => {
      const result = await authApi.scanQRCode('expired-token', 'valid-key');
      expect(result.success).toBe(false);
      expect(result.error).toBe('QR_EXPIRED');
    });
  });
});
```
