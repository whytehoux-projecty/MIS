# 📱 Mobile App Enhancements Plan

> **Document ID:** PLAN-05  
> **Priority:** 🟢 Medium  
> **Phase:** 4  
> **Estimated Effort:** 2-3 days  
> **Dependencies:** Phase 1-3 complete

---

## 📋 Overview

The Mobile Authenticator app (`MIS_Authenticator`) is largely complete but has several enhancement opportunities from the documentation.

### Current State: ✅ 95% Complete

| Feature | Status |
| :--- | :--- |
| QR Scanning | ✅ Implemented |
| API Integration | ✅ Working |
| PIN Display | ✅ With countdown |
| Scan History | ✅ Tracked |
| Error Handling | ✅ User-friendly |

### Enhancements Needed

| Enhancement | Priority | Effort |
| :--- | :--- | :--- |
| Biometric confirmation | Low | 1 day |
| Device fingerprinting | Low | 0.5 day |
| Enhanced error messages | Low | 0.5 day |
| Offline mode handling | Low | 0.5 day |

---

## 🎯 Objectives

1. Add optional biometric confirmation before showing PIN
2. Implement device fingerprinting for security
3. Improve error messages with recovery suggestions
4. Handle offline/network issues gracefully

---

## 🛠️ Implementation Steps

### Step 1: Biometric Confirmation (Optional)

**File:** `src/components/BiometricPrompt.tsx`

```tsx
import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export async function requestBiometric(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return true; // Skip if no biometric hardware
  
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return true; // Skip if not enrolled
  
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirm your identity',
    fallbackLabel: 'Use PIN',
  });
  
  return result.success;
}
```

**Usage in scan.tsx:**

```tsx
const handleScan = async (data: string) => {
  // Add biometric check before API call
  const biometricPassed = await requestBiometric();
  if (!biometricPassed) {
    Alert.alert('Authentication Required', 'Please verify your identity.');
    return;
  }
  
  // Continue with existing scan logic...
};
```

### Step 2: Device Fingerprinting

**File:** `src/utils/deviceFingerprint.ts`

```typescript
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';

export async function getDeviceFingerprint(): Promise<string> {
  const components = [
    Device.brand || 'unknown',
    Device.modelName || 'unknown',
    Device.osName || 'unknown',
    Device.osVersion || 'unknown',
    await Application.getInstallationTimeAsync().then(d => d?.toISOString() || ''),
    Application.nativeApplicationVersion || '',
  ];
  
  const combined = components.join('|');
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  
  return hash;
}
```

**Usage in API calls:**

```typescript
// src/services/api/auth.ts
const fingerprint = await getDeviceFingerprint();
const response = await apiClient.post('/api/auth/qr/scan', {
  qr_token: qrToken,
  user_auth_key: userAuthKey,
  device_fingerprint: fingerprint, // Include in request
});
```

### Step 3: Enhanced Error Messages

**File:** `src/utils/errors.ts` (enhanced)

```typescript
interface ErrorRecovery {
  message: string;
  suggestion: string;
  action?: string;
}

const ERROR_RECOVERY: Record<string, ErrorRecovery> = {
  'QR_EXPIRED': {
    message: 'This QR code has expired',
    suggestion: 'Ask the website to generate a new QR code',
    action: 'refresh',
  },
  'QR_ALREADY_USED': {
    message: 'This QR code was already scanned',
    suggestion: 'Each QR code can only be used once',
    action: 'refresh',
  },
  'SYSTEM_CLOSED': {
    message: 'The service is currently closed',
    suggestion: 'Please try again during operating hours',
  },
  'USER_NOT_FOUND': {
    message: 'Your account was not found',
    suggestion: 'Please check your authentication key',
    action: 'relink',
  },
  'NETWORK_ERROR': {
    message: 'Unable to connect to the server',
    suggestion: 'Check your internet connection and try again',
    action: 'retry',
  },
  'TIMEOUT': {
    message: 'The request timed out',
    suggestion: 'The server may be busy, please try again',
    action: 'retry',
  },
};

export function getErrorRecovery(errorCode: string): ErrorRecovery {
  return ERROR_RECOVERY[errorCode] || {
    message: 'An unexpected error occurred',
    suggestion: 'Please try again or contact support',
  };
}
```

### Step 4: Offline Mode Handling

**File:** `src/hooks/useNetworkStatus.ts`

```typescript
import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    return NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
  }, []);
  
  return isConnected;
}
```

**Usage in scan screen:**

```tsx
const isConnected = useNetworkStatus();

if (!isConnected) {
  return (
    <View style={styles.offlineContainer}>
      <Text>No Internet Connection</Text>
      <Text>Please connect to scan QR codes</Text>
    </View>
  );
}
```

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "expo-local-authentication": "~13.0.0",
    "expo-device": "~5.0.0",
    "expo-application": "~5.0.0",
    "@react-native-community/netinfo": "^9.0.0"
  }
}
```

```bash
npx expo install expo-local-authentication expo-device expo-application @react-native-community/netinfo
```

---

## 🧪 Testing Checklist

- [ ] Biometric prompt appears on supported devices
- [ ] Biometric is skipped on unsupported devices
- [ ] Device fingerprint is consistent across app sessions
- [ ] Enhanced error messages display correctly
- [ ] Offline state is detected and shown

---

## 🔗 Related Documents

- [00_MASTER_IMPLEMENTATION_PLAN.md](./00_MASTER_IMPLEMENTATION_PLAN.md)
- [02_BACKEND_SECURITY_HARDENING.md](./02_BACKEND_SECURITY_HARDENING.md)
