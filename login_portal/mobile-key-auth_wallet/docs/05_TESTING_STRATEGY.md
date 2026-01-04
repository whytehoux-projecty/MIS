# Mobile Auth App - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the mobile-auth-app, covering unit tests, integration tests, and end-to-end tests.

---

## Testing Stack

| Tool | Purpose |
|------|---------|
| Jest | Test runner |
| React Native Testing Library | Component testing |
| MSW (Mock Service Worker) | API mocking |
| Detox | E2E testing |

---

## Test Directory Structure

```
__tests__/
├── components/           # UI component tests
│   ├── common/
│   │   ├── Button.test.tsx
│   │   ├── LoadingSpinner.test.tsx
│   │   └── SafeView.test.tsx
│   ├── scanner/
│   │   ├── ScannerOverlay.test.tsx
│   │   └── CameraView.test.tsx
│   └── pin/
│       ├── PinDisplay.test.tsx
│       └── ExpiryTimer.test.tsx
│
├── hooks/               # Custom hook tests
│   ├── useAuth.test.ts
│   ├── useQRScanner.test.ts
│   └── useBiometric.test.ts
│
├── services/            # API service tests
│   ├── api/
│   │   ├── auth.test.ts
│   │   └── system.test.ts
│   └── storage/
│       └── secureStorage.test.ts
│
├── stores/              # State store tests
│   ├── authStore.test.ts
│   └── scanStore.test.ts
│
├── utils/               # Utility function tests
│   ├── validation.test.ts
│   └── formatting.test.ts
│
└── e2e/                 # End-to-end tests
    ├── onboarding.test.ts
    ├── authentication.test.ts
    └── settings.test.ts
```

---

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
  },
};
```

### Jest Setup

```javascript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [
    { granted: true },
    jest.fn(),
  ],
  CameraView: 'CameraView',
}));
```

---

## Unit Tests

### Component Tests

```typescript
// __tests__/components/common/Button.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '@components/common/Button';

describe('Button Component', () => {
  it('renders with correct title', () => {
    render(<Button title="Test Button" onPress={() => {}} />);
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Press Me" onPress={onPress} />);
    
    fireEvent.press(screen.getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    render(<Button title="Loading" onPress={() => {}} loading />);
    expect(screen.queryByText('Loading')).toBeNull();
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    render(<Button title="Disabled" onPress={onPress} disabled />);
    
    fireEvent.press(screen.getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies correct styles for each variant', () => {
    const { rerender } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(screen.getByText('Primary')).toHaveStyle({ color: '#fff' });

    rerender(<Button title="Outline" onPress={() => {}} variant="outline" />);
    expect(screen.getByText('Outline')).toHaveStyle({ color: '#8b5cf6' });
  });
});
```

### PIN Display Tests

```typescript
// __tests__/components/pin/PinDisplay.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { PinDisplay } from '@components/pin/PinDisplay';

jest.mock('expo-clipboard');
jest.mock('expo-haptics');

describe('PinDisplay Component', () => {
  const defaultProps = {
    pin: '123456',
    serviceName: 'Test Service',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 6 digits correctly', () => {
    render(<PinDisplay {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
  });

  it('displays the service name', () => {
    render(<PinDisplay {...defaultProps} />);
    expect(screen.getByText(/Test Service/)).toBeTruthy();
  });

  it('copies PIN to clipboard when pressed', async () => {
    render(<PinDisplay {...defaultProps} />);
    
    const pinContainer = screen.getByText('1').parent?.parent;
    if (pinContainer) {
      fireEvent.press(pinContainer);
    }
    
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('123456');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });
});
```

### Hook Tests

```typescript
// __tests__/hooks/useQRScanner.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useQRScanner } from '@hooks/useQRScanner';
import { authApi } from '@services/api';

jest.mock('@services/api');
jest.mock('@stores/authStore', () => ({
  useAuthStore: () => ({
    authKey: 'test-auth-key',
  }),
}));

describe('useQRScanner Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useQRScanner());
    
    expect(result.current.step).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions to scanning state when startScanning is called', () => {
    const { result } = renderHook(() => useQRScanner());
    
    act(() => {
      result.current.startScanning();
    });
    
    expect(result.current.step).toBe('scanning');
  });

  it('handles successful scan', async () => {
    (authApi.scanQRCode as jest.Mock).mockResolvedValue({
      success: true,
      pin: '123456',
      expires_in: 300,
      service_name: 'Test Service',
    });

    const { result } = renderHook(() => useQRScanner());
    
    await act(async () => {
      await result.current.handleScan('valid-uuid-token-here');
    });
    
    expect(result.current.step).toBe('success');
    expect(result.current.result?.pin).toBe('123456');
  });

  it('handles invalid QR format', async () => {
    const { result } = renderHook(() => useQRScanner());
    
    await act(async () => {
      await result.current.handleScan('invalid-format');
    });
    
    expect(result.current.step).toBe('error');
    expect(result.current.error).toContain('Invalid QR code format');
  });

  it('handles API error', async () => {
    (authApi.scanQRCode as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useQRScanner());
    
    await act(async () => {
      await result.current.handleScan('550e8400-e29b-41d4-a716-446655440000');
    });
    
    expect(result.current.step).toBe('error');
    expect(result.current.error).toBe('Network error');
  });

  it('resets state correctly', async () => {
    const { result } = renderHook(() => useQRScanner());
    
    // First, create some state
    await act(async () => {
      result.current.startScanning();
    });
    
    // Then reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.step).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
```

### Store Tests

```typescript
// __tests__/stores/authStore.test.ts
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@stores/authStore';

jest.mock('expo-secure-store');

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      authKey: null,
      isLoading: true,
      error: null,
    });
  });

  describe('setAuthKey', () => {
    it('saves auth key to secure storage', async () => {
      const { setAuthKey } = useAuthStore.getState();
      
      await setAuthKey('test-key-123');
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'user_auth_key',
        'test-key-123'
      );
      expect(useAuthStore.getState().authKey).toBe('test-key-123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('sets error on storage failure', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage full')
      );
      
      const { setAuthKey } = useAuthStore.getState();
      
      await expect(setAuthKey('test-key')).rejects.toThrow();
      expect(useAuthStore.getState().error).toBe('Failed to save auth key');
    });
  });

  describe('loadStoredAuth', () => {
    it('loads existing auth key from storage', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-key');
      
      const { loadStoredAuth } = useAuthStore.getState();
      await loadStoredAuth();
      
      const state = useAuthStore.getState();
      expect(state.authKey).toBe('stored-key');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('handles no stored key', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      const { loadStoredAuth } = useAuthStore.getState();
      await loadStoredAuth();
      
      const state = useAuthStore.getState();
      expect(state.authKey).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears auth key and resets state', async () => {
      // Set up authenticated state
      useAuthStore.setState({
        isAuthenticated: true,
        authKey: 'existing-key',
        user: { id: 1, username: 'test', full_name: 'Test', email: 'test@test.com', auth_key: 'key' },
      });
      
      const { logout } = useAuthStore.getState();
      await logout();
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_auth_key');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.authKey).toBeNull();
      expect(state.user).toBeNull();
    });
  });
});
```

---

## Integration Tests

### API Integration Tests

```typescript
// __tests__/services/api/auth.test.ts
import { authApi } from '@services/api';
import { apiClient } from '@services/api/client';

jest.mock('@services/api/client');

describe('Auth API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scanQRCode', () => {
    it('sends correct payload to API', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { success: true, pin: '123456' },
      });

      await authApi.scanQRCode('qr-token', 'auth-key');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/qr/scan',
        {
          qr_token: 'qr-token',
          user_auth_key: 'auth-key',
        }
      );
    });

    it('returns response data on success', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          pin: '654321',
          expires_in: 300,
          service_name: 'ServiceB',
        },
      });

      const result = await authApi.scanQRCode('qr-token', 'auth-key');

      expect(result.success).toBe(true);
      expect(result.pin).toBe('654321');
      expect(result.service_name).toBe('ServiceB');
    });

    it('throws error on API failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('QR_EXPIRED')
      );

      await expect(
        authApi.scanQRCode('expired-token', 'auth-key')
      ).rejects.toThrow('QR_EXPIRED');
    });
  });

  describe('validateKey', () => {
    it('returns valid response for good key', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          valid: true,
          user: {
            id: 1,
            username: 'testuser',
            full_name: 'Test User',
            email: 'test@example.com',
          },
        },
      });

      const result = await authApi.validateKey('valid-key');

      expect(result.valid).toBe(true);
      expect(result.user?.username).toBe('testuser');
    });

    it('returns invalid for bad key', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          valid: false,
          error: 'USER_NOT_FOUND',
        },
      });

      const result = await authApi.validateKey('bad-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('USER_NOT_FOUND');
    });
  });
});
```

---

## End-to-End Tests

### Detox Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  skipLegacyWorkersInjection: true,
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/CentralAuth.app',
      build: 'xcodebuild -workspace ios/CentralAuth.xcworkspace -scheme CentralAuth -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_4_API_30' },
    },
  },
  configurations: {
    'ios.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
```

### E2E Test: Authentication Flow

```typescript
// e2e/authentication.test.ts
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete onboarding and link account', async () => {
    // Welcome screen
    await expect(element(by.text('Central Auth'))).toBeVisible();
    await element(by.text('Get Started')).tap();

    // Permissions screen
    await expect(element(by.text('Camera Access'))).toBeVisible();
    await element(by.text('Continue')).tap();

    // Link account screen
    await expect(element(by.text('Enter your Membership Key'))).toBeVisible();
    await element(by.id('auth-key-input')).typeText('test-valid-key');
    await element(by.text('Continue')).tap();

    // Should navigate to home
    await waitFor(element(by.text('Welcome back')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for invalid key', async () => {
    await element(by.text('Link Account')).tap();
    
    await element(by.id('auth-key-input')).typeText('invalid-key');
    await element(by.text('Continue')).tap();

    await waitFor(element(by.text('Invalid Key')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should successfully scan QR and display PIN', async () => {
    // Assuming already logged in
    await expect(element(by.text('Scan QR Code'))).toBeVisible();
    await element(by.text('Scan QR Code')).tap();

    // Camera view (mocked in test)
    await expect(element(by.id('camera-view'))).toBeVisible();
    
    // Simulate QR scan
    await device.sendUserNotification({
      trigger: { type: 'qrScanned', payload: 'mock-qr-token' },
    });

    // PIN display
    await waitFor(element(by.text('Success!')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.id('pin-display'))).toBeVisible();
  });
});
```

---

## Test Coverage Goals

| Category | Target Coverage |
|----------|-----------------|
| Components | 80% |
| Hooks | 90% |
| Services | 95% |
| Stores | 90% |
| Utils | 100% |
| **Overall** | **85%** |

---

## Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- Button.test.tsx

# Run E2E tests (iOS)
npx detox test --configuration ios.release

# Run E2E tests (Android)
npx detox test --configuration android.release
```
