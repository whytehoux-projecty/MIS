# Mobile Auth App - Project Structure

## Overview

This document defines the complete file and folder structure for the mobile-auth-app project. The architecture follows React Native best practices with a clear separation of concerns.

---

## Complete Directory Structure

```
mobile-auth-app/
│
├── docs/                              # Project documentation
│   ├── 00_MASTER_PLAN.md              # High-level project overview
│   ├── 01_PROJECT_STRUCTURE.md        # This file
│   ├── 02_DEVELOPMENT_GUIDE.md        # Implementation instructions
│   ├── 03_API_INTEGRATION.md          # API service details
│   ├── 04_UI_SPECIFICATIONS.md        # Screen designs
│   ├── 05_TESTING_STRATEGY.md         # Testing approach
│   └── 06_DEPLOYMENT_GUIDE.md         # Build & release
│
├── src/                               # Source code root
│   │
│   ├── app/                           # Expo Router app directory
│   │   ├── _layout.tsx                # Root layout with providers
│   │   ├── index.tsx                  # Entry/splash screen
│   │   │
│   │   ├── (auth)/                    # Protected routes (authenticated)
│   │   │   ├── _layout.tsx            # Auth layout wrapper
│   │   │   ├── home.tsx               # Home screen
│   │   │   ├── scan.tsx               # QR scanner screen
│   │   │   ├── result.tsx             # PIN display screen
│   │   │   ├── history.tsx            # Activity history
│   │   │   └── settings.tsx           # App settings
│   │   │
│   │   └── (onboarding)/              # Unauthenticated routes
│   │       ├── _layout.tsx            # Onboarding layout
│   │       ├── welcome.tsx            # Welcome screen
│   │       ├── permissions.tsx        # Permission requests
│   │       └── link-account.tsx       # Account linking
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── common/                    # Generic components
│   │   │   ├── Button.tsx             # Primary button
│   │   │   ├── Card.tsx               # Card container
│   │   │   ├── Header.tsx             # Screen header
│   │   │   ├── LoadingSpinner.tsx     # Loading indicator
│   │   │   ├── SafeView.tsx           # Safe area wrapper
│   │   │   └── index.ts               # Exports
│   │   │
│   │   ├── scanner/                   # QR scanning components
│   │   │   ├── CameraView.tsx         # Camera with permissions
│   │   │   ├── ScannerOverlay.tsx     # Scan frame overlay
│   │   │   ├── ScanResult.tsx         # Scanned data display
│   │   │   └── index.ts               # Exports
│   │   │
│   │   ├── pin/                       # PIN display components
│   │   │   ├── PinDigit.tsx           # Single digit display
│   │   │   ├── PinDisplay.tsx         # Full PIN display
│   │   │   ├── ExpiryTimer.tsx        # Countdown timer
│   │   │   └── index.ts               # Exports
│   │   │
│   │   ├── history/                   # History components
│   │   │   ├── HistoryItem.tsx        # Single history entry
│   │   │   ├── HistoryList.tsx        # List of entries
│   │   │   └── index.ts               # Exports
│   │   │
│   │   └── settings/                  # Settings components
│   │       ├── SettingsRow.tsx        # Settings list item
│   │       ├── BiometricToggle.tsx    # Biometric switch
│   │       └── index.ts               # Exports
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts                 # Authentication hook
│   │   ├── useCamera.ts               # Camera management
│   │   ├── useQRScanner.ts            # QR scanning logic
│   │   ├── useBiometric.ts            # Biometric auth
│   │   ├── useNetworkStatus.ts        # Connectivity check
│   │   └── index.ts                   # Exports
│   │
│   ├── services/                      # API & external services
│   │   ├── api/                       # API layer
│   │   │   ├── client.ts              # Axios instance config
│   │   │   ├── auth.ts                # Auth API endpoints
│   │   │   ├── system.ts              # System status endpoints
│   │   │   └── index.ts               # Exports
│   │   │
│   │   ├── storage/                   # Local storage
│   │   │   ├── secureStorage.ts       # expo-secure-store wrapper
│   │   │   ├── asyncStorage.ts        # Non-sensitive storage
│   │   │   └── index.ts               # Exports
│   │   │
│   │   └── notifications/             # Push notifications
│   │       ├── pushService.ts         # Notification handling
│   │       └── index.ts               # Exports
│   │
│   ├── stores/                        # Zustand state stores
│   │   ├── authStore.ts               # Auth state (user, key)
│   │   ├── scanStore.ts               # Scanning state
│   │   ├── settingsStore.ts           # App settings
│   │   └── index.ts                   # Exports
│   │
│   ├── types/                         # TypeScript definitions
│   │   ├── api.ts                     # API request/response types
│   │   ├── auth.ts                    # Auth-related types
│   │   ├── navigation.ts              # Navigation param types
│   │   ├── storage.ts                 # Storage types
│   │   └── index.ts                   # Exports
│   │
│   ├── utils/                         # Utility functions
│   │   ├── validation.ts              # Input validation
│   │   ├── formatting.ts              # Data formatting
│   │   ├── haptics.ts                 # Haptic feedback
│   │   ├── permissions.ts             # Permission helpers
│   │   └── index.ts                   # Exports
│   │
│   ├── constants/                     # App constants
│   │   ├── config.ts                  # API URLs, timeouts
│   │   ├── theme.ts                   # Colors, spacing
│   │   ├── strings.ts                 # UI text strings
│   │   └── index.ts                   # Exports
│   │
│   └── assets/                        # Static assets
│       ├── images/                    # PNG/JPG images
│       │   ├── logo.png
│       │   ├── onboarding-1.png
│       │   └── ...
│       ├── icons/                     # SVG icons
│       │   ├── scan.svg
│       │   ├── history.svg
│       │   └── ...
│       └── animations/                # Lottie animations
│           ├── scanning.json
│           ├── success.json
│           └── error.json
│
├── __tests__/                         # Test files
│   ├── components/                    # Component tests
│   │   ├── Button.test.tsx
│   │   └── PinDisplay.test.tsx
│   ├── hooks/                         # Hook tests
│   │   └── useAuth.test.ts
│   ├── services/                      # Service tests
│   │   └── auth.test.ts
│   └── e2e/                           # End-to-end tests
│       └── authentication.test.ts
│
├── app.json                           # Expo configuration
├── eas.json                           # EAS Build configuration
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── babel.config.js                    # Babel config
├── metro.config.js                    # Metro bundler config
├── .env.example                       # Environment template
├── .env.development                   # Dev environment
├── .env.production                    # Prod environment
├── .gitignore                         # Git ignore rules
├── .eslintrc.js                       # ESLint config
├── .prettierrc                        # Prettier config
└── README.md                          # Project readme
```

---

## Directory Explanations

### `/docs`

Project documentation including this file. All plans, specifications, and guides are stored here.

### `/src/app`

Uses Expo Router for file-based routing. Routes are organized into route groups:

- **(auth)** - Protected screens requiring authentication
- **(onboarding)** - Public screens for first-time setup

### `/src/components`

Reusable UI components organized by feature domain:

- **common/** - Generic UI elements used across the app
- **scanner/** - Components specific to QR scanning
- **pin/** - PIN display and countdown components
- **history/** - Activity log components
- **settings/** - Settings-related UI

### `/src/hooks`

Custom React hooks that encapsulate reusable logic:

- **useAuth** - Authentication state and methods
- **useCamera** - Camera access and permissions
- **useQRScanner** - QR detection logic
- **useBiometric** - Touch/Face ID handling

### `/src/services`

External service integrations:

- **api/** - Central Auth API communication
- **storage/** - Secure local storage
- **notifications/** - Push notification handling

### `/src/stores`

Zustand state management stores:

- **authStore** - User authentication state
- **scanStore** - Active scanning session state
- **settingsStore** - User preferences

### `/src/types`

TypeScript type definitions matching API DTOs and internal types.

### `/src/utils`

Pure utility functions for validation, formatting, and helpers.

### `/src/constants`

Static configuration values, theme definitions, and string constants.

### `/src/assets`

Static files including images, icons, and Lottie animations.

### `/__tests__`

Test files organized to mirror the source structure.

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PinDisplay.tsx` |
| Hooks | camelCase with "use" prefix | `useAuth.ts` |
| Services | camelCase | `secureStorage.ts` |
| Types | PascalCase interfaces | `interface AuthState` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| Files | camelCase (except components) | `validation.ts` |
| Folders | kebab-case | `push-notifications/` |

---

## Import Aliasing

Configure path aliases in `tsconfig.json` for cleaner imports:

```json
{
  "compilerOptions": {
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
  }
}
```

**Usage:**

```typescript
// Instead of
import { Button } from '../../../components/common/Button';

// Use
import { Button } from '@components/common';
```
