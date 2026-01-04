# Mobile Auth App - Development Guide

## Phase 1: Project Initialization

This guide provides step-by-step instructions for building the mobile-auth-app from scratch.

---

## 1.1 Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm/yarn | Latest | Package manager |
| Expo CLI | Latest | Development tools |
| EAS CLI | Latest | Build service |
| Xcode | 14+ | iOS simulator (macOS only) |
| Android Studio | Latest | Android emulator |
| Git | Latest | Version control |

### Verify Installation

```bash
node --version    # Should be 18+
npm --version     # Should be 9+
npx expo --version
```

---

## 1.2 Create Expo Project

### Step 1: Initialize Project

```bash
# Navigate to the Central-Auth-API root
cd /path/to/Central-Auth-API

# Create new Expo project with TypeScript
npx create-expo-app@latest mobile-auth-app --template expo-template-blank-typescript

# Navigate into project
cd mobile-auth-app
```

### Step 2: Install Expo Router (File-based Routing)

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

Update `package.json` to use Expo Router:

```json
{
  "main": "expo-router/entry"
}
```

### Step 3: Install Core Dependencies

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context

# Camera & QR Scanning
npx expo install expo-camera expo-barcode-scanner

# Storage
npx expo install expo-secure-store @react-native-async-storage/async-storage

# State Management
npm install zustand

# Networking
npm install axios

# UI Enhancements
npx expo install expo-haptics expo-linear-gradient expo-blur

# Biometrics
npx expo install expo-local-authentication

# Push Notifications
npx expo install expo-notifications expo-device

# Icons
npm install lucide-react-native react-native-svg
npx expo install react-native-svg
```

### Step 4: Install Development Dependencies

```bash
npm install -D @types/react @types/react-native
npm install -D eslint prettier eslint-config-expo
npm install -D @testing-library/react-native jest
```

---

## 1.3 Configure Project

### app.json Configuration

Update `app.json` with project settings:

```json
{
  "expo": {
    "name": "Central Auth",
    "slug": "central-auth-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./src/assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e293b"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.centralauth.mobile",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to scan QR codes for secure authentication.",
        "NSFaceIDUsageDescription": "Use Face ID to quickly and securely unlock the app."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/adaptive-icon.png",
        "backgroundColor": "#1e293b"
      },
      "package": "com.centralauth.mobile",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.VIBRATE",
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT"
      ]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Central Auth to access your camera for QR code scanning."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow Central Auth to use Face ID for app unlock."
        }
      ]
    ],
    "scheme": "centralauth"
  }
}
```

### TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### Environment Configuration

Create `.env.example`:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000

# App Configuration
EXPO_PUBLIC_APP_NAME=Central Auth
EXPO_PUBLIC_SESSION_TIMEOUT=1800000

# Feature Flags
EXPO_PUBLIC_ENABLE_BIOMETRICS=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
```

Create `.env.development`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_APP_NAME=Central Auth (Dev)
EXPO_PUBLIC_SESSION_TIMEOUT=1800000
EXPO_PUBLIC_ENABLE_BIOMETRICS=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
```

---

## Phase 2: Core Implementation

### 2.1 Create Directory Structure

```bash
# Create all source directories
mkdir -p src/{app,components,hooks,services,stores,types,utils,constants,assets}
mkdir -p src/app/{auth,onboarding}
mkdir -p src/components/{common,scanner,pin,history,settings}
mkdir -p src/services/{api,storage,notifications}
mkdir -p src/assets/{images,icons,animations}
mkdir -p __tests__/{components,hooks,services,e2e}
```

### 2.2 Constants Setup

Create `src/constants/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
  ENDPOINTS: {
    QR_SCAN: '/api/auth/qr/scan',
    VALIDATE_KEY: '/api/auth/validate-key',
    SYSTEM_STATUS: '/api/system/status',
  },
} as const;

export const AUTH_CONFIG = {
  PIN_LENGTH: 6,
  PIN_EXPIRY_SECONDS: 300, // 5 minutes
  QR_TOKEN_LENGTH: 36, // UUID length
  SESSION_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_SESSION_TIMEOUT || '1800000'),
} as const;

export const STORAGE_KEYS = {
  USER_AUTH_KEY: 'user_auth_key',
  USER_INFO: 'user_info',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  SCAN_HISTORY: 'scan_history',
} as const;
```

Create `src/constants/theme.ts`:

```typescript
export const COLORS = {
  // Primary
  primary: '#8b5cf6',
  primaryDark: '#7c3aed',
  primaryLight: '#a78bfa',

  // Backgrounds
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',

  // Text
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Status
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Borders
  border: '#334155',
  borderLight: '#475569',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
```

### 2.3 Type Definitions

Create `src/types/api.ts`:

```typescript
// QR Scan Request
export interface QRScanRequest {
  qr_token: string;
  user_auth_key: string;
}

// QR Scan Response
export interface QRScanResponse {
  success: boolean;
  pin?: string;
  expires_in?: number; // seconds
  error?: string;
  service_name?: string;
}

// Validate Key Request
export interface ValidateKeyRequest {
  auth_key: string;
}

// Validate Key Response
export interface ValidateKeyResponse {
  valid: boolean;
  user?: {
    id: number;
    username: string;
    full_name: string;
    email: string;
  };
  error?: string;
}

// System Status Response
export interface SystemStatusResponse {
  status: 'open' | 'closed';
  message: string;
  warning?: boolean;
  closes_at?: string;
  opens_at?: string;
}

// Generic API Error
export interface APIError {
  detail: string;
  status_code: number;
}
```

Create `src/types/auth.ts`:

```typescript
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  auth_key: string;
}

export interface ScanHistoryItem {
  id: string;
  serviceName: string;
  timestamp: number;
  success: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  authKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ScanState {
  step: 'idle' | 'scanning' | 'processing' | 'success' | 'error';
  pin: string | null;
  expiresAt: number | null;
  serviceName: string | null;
  error: string | null;
}
```

### 2.4 API Service

Create `src/services/api/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@constants/config';
import { APIError } from '@types/api';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<APIError>) => {
      const message = error.response?.data?.detail || error.message || 'Unknown error';
      console.error(`[API Error] ${message}`);
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

export const apiClient = createApiClient();
```

Create `src/services/api/auth.ts`:

```typescript
import { apiClient } from './client';
import { API_CONFIG } from '@constants/config';
import type {
  QRScanRequest,
  QRScanResponse,
  ValidateKeyRequest,
  ValidateKeyResponse,
} from '@types/api';

export const authApi = {
  /**
   * Scan a QR code and get a PIN
   */
  async scanQRCode(qrToken: string, userAuthKey: string): Promise<QRScanResponse> {
    const payload: QRScanRequest = {
      qr_token: qrToken,
      user_auth_key: userAuthKey,
    };

    const response = await apiClient.post<QRScanResponse>(
      API_CONFIG.ENDPOINTS.QR_SCAN,
      payload
    );

    return response.data;
  },

  /**
   * Validate user's auth key
   */
  async validateKey(authKey: string): Promise<ValidateKeyResponse> {
    const payload: ValidateKeyRequest = { auth_key: authKey };

    const response = await apiClient.post<ValidateKeyResponse>(
      API_CONFIG.ENDPOINTS.VALIDATE_KEY,
      payload
    );

    return response.data;
  },
};
```

### 2.5 Auth Store (Zustand)

Create `src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@constants/config';
import type { User, AuthState } from '@types/auth';

interface AuthStoreActions {
  setUser: (user: User) => void;
  setAuthKey: (key: string) => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      user: null,
      authKey: null,
      isLoading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user }),

      setAuthKey: async (key) => {
        try {
          await SecureStore.setItemAsync(STORAGE_KEYS.USER_AUTH_KEY, key);
          set({ authKey: key, isAuthenticated: true, error: null });
        } catch (error) {
          set({ error: 'Failed to save auth key' });
          throw error;
        }
      },

      loadStoredAuth: async () => {
        set({ isLoading: true });
        try {
          const key = await SecureStore.getItemAsync(STORAGE_KEYS.USER_AUTH_KEY);
          if (key) {
            set({ authKey: key, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false, error: 'Failed to load auth' });
        }
      },

      logout: async () => {
        try {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_AUTH_KEY);
          set({
            isAuthenticated: false,
            user: null,
            authKey: null,
            error: null,
          });
        } catch (error) {
          set({ error: 'Failed to logout' });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        // Note: authKey is stored in SecureStore, not here
      }),
    }
  )
);
```

---

## Phase 3: UI Implementation

See **04_UI_SPECIFICATIONS.md** for detailed screen designs and component implementations.

---

## Phase 4: Testing

See **05_TESTING_STRATEGY.md** for testing approach and test cases.

---

## Phase 5: Deployment

See **06_DEPLOYMENT_GUIDE.md** for build and release instructions.

---

## Development Commands

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run tests
npm test

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build for production (EAS)
eas build --platform all
```
