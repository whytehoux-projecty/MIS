# Central Auth SDK

A React SDK for integrating QR-based authentication into your applications. Allow your users to log in securely using the Central Auth system.

## Installation

```bash
npm install @yourcompany/central-auth-sdk
# or
yarn add @yourcompany/central-auth-sdk
```

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from '@yourcompany/central-auth-sdk';

function App() {
  return (
    <AuthProvider
      config={{
        apiUrl: 'https://your-central-auth-api.com',
        serviceId: 'your-service-id',
        serviceApiKey: 'your-api-key',
      }}
    >
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. Use the built-in LoginPage (easiest)

```tsx
import { LoginPage } from '@yourcompany/central-auth-sdk';

function Login() {
  return (
    <LoginPage 
      onSuccess={(user) => {
        console.log('Logged in:', user);
        navigate('/dashboard');
      }}
      title="Welcome to My App"
    />
  );
}
```

### 3. Or build your own with hooks

```tsx
import { useAuth, useQRAuth, QRDisplay, PinEntry } from '@yourcompany/central-auth-sdk';

function CustomLogin() {
  const { isAuthenticated, user } = useAuth();
  const { step, qrImage, expiresIn, startQRAuth, verifyPin } = useQRAuth();

  useEffect(() => {
    startQRAuth();
  }, []);

  if (isAuthenticated) {
    return <div>Welcome, {user.fullName}!</div>;
  }

  return (
    <div>
      {step === 'waiting' && <QRDisplay qrImage={qrImage} expiresIn={expiresIn} />}
      {step === 'scanned' && <PinEntry onSubmit={verifyPin} />}
    </div>
  );
}
```

## Configuration Options

### AuthProvider Config

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | string | Yes | URL of the Central Auth API |
| `serviceId` | string | Yes | Your registered service ID |
| `serviceApiKey` | string | Yes | Your service API key |
| `theme` | 'light' \| 'dark' \| 'auto' | No | Color theme (default: 'auto') |
| `branding` | object | No | Custom branding options |
| `callbacks` | object | No | Callback functions |
| `session` | object | No | Session configuration |

### Branding Options

```tsx
<AuthProvider
  config={{
    // ...required options
    branding: {
      name: 'My Company',
      logo: '/logo.png',
      primaryColor: '#8b5cf6',
    },
  }}
>
```

### Callbacks

```tsx
<AuthProvider
  config={{
    // ...required options
    callbacks: {
      onLoginSuccess: (user, session) => {
        console.log('User logged in:', user);
      },
      onLoginError: (error) => {
        console.error('Login failed:', error);
      },
      onLogout: () => {
        console.log('User logged out');
      },
      onSessionExpired: () => {
        console.log('Session expired');
      },
    },
  }}
>
```

## Components

### LoginPage

A complete, drop-in login page.

```tsx
<LoginPage
  onSuccess={(user) => navigate('/dashboard')}
  onError={(error) => console.error(error)}
  title="Sign In"
  subtitle="Scan the QR code with your mobile app"
  showManualEntry={true}
/>
```

### QRDisplay

Displays a QR code with countdown timer.

```tsx
<QRDisplay
  qrImage={qrImage}
  expiresIn={120}
  onExpired={() => regenerateQR()}
/>
```

### PinEntry

PIN input component for verification.

```tsx
<PinEntry
  onSubmit={(pin) => verifyPin(pin)}
  length={6}
  loading={isVerifying}
/>
```

### QRScanner

Camera-based QR scanner (for mobile apps).

```tsx
<QRScanner
  onScan={(decodedText) => handleScan(decodedText)}
  onError={(error) => console.error(error)}
/>
```

### AuthStatus

Shows current authentication status.

```tsx
<AuthStatus showLogout={true} />
```

## Hooks

### useAuth

Primary hook for authentication state.

```tsx
const {
  isAuthenticated,  // boolean
  user,             // User | null
  session,          // Session | null
  loading,          // boolean
  error,            // string | null
  login,            // (membershipKey: string) => Promise<void>
  logout,           // () => Promise<void>
  clearError,       // () => void
} = useAuth();
```

### useQRAuth

Hook for QR authentication flow.

```tsx
const {
  step,           // 'idle' | 'generating' | 'waiting' | 'scanned' | 'verifying' | 'success' | 'error' | 'expired'
  qrImage,        // string | null (base64 image)
  expiresIn,      // number | null (seconds)
  error,          // string | null
  startQRAuth,    // () => Promise<void>
  verifyPin,      // (pin: string) => Promise<void>
  reset,          // () => void
  retry,          // () => void
} = useQRAuth();
```

### useSession

Hook for session management.

```tsx
const {
  session,              // Session | null
  expiresIn,            // number | null (seconds)
  expiresInFormatted,   // string | null (e.g., "5m 30s")
  isActive,             // boolean
  isExpiringSoon,       // boolean (< 5 minutes)
  isExpired,            // boolean
  refresh,              // () => Promise<void>
  logout,               // () => Promise<void>
} = useSession();
```

## Theming

### Using built-in themes

```tsx
import { defaultTheme, darkTheme } from '@yourcompany/central-auth-sdk';
```

### Creating a custom theme

```tsx
import { createTheme } from '@yourcompany/central-auth-sdk';

const myTheme = createTheme({
  colors: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
  },
});
```

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import type {
  AuthConfig,
  AuthState,
  User,
  Session,
  QRAuthState,
  Theme,
} from '@yourcompany/central-auth-sdk';
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               AuthProvider                           │   │
│  │  (Wraps your app, manages auth state)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────┼───────────────────────────┐     │
│  │                       │                           │     │
│  ▼                       ▼                           ▼     │
│ LoginPage            useAuth()              useQRAuth()    │
│ (drop-in)           (custom UI)            (QR flow)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Central Auth API      │
              │                         │
              │  QR Generation          │
              │  PIN Verification       │
              │  Session Management     │
              └─────────────────────────┘
```

## Getting Your Credentials

1. Register your service with the Central Auth admin
2. You'll receive:
   - **Service ID** - Your unique service identifier
   - **API Key** - Your secret key for QR generation
3. Add these to your AuthProvider config

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT
