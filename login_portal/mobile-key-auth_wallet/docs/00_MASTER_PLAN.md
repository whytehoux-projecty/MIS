# Mobile Auth App - Comprehensive Project Plan

## Executive Summary

The **Mobile Auth App** is the final piece of the Central Auth System ecosystem. It serves as a secure mobile authenticator that enables users to complete the QR-based two-factor authentication flow. Users scan QR codes displayed on integrated services (via the Auth SDK) and receive a one-time PIN to complete login.

---

## Ecosystem Context

The Central Auth System consists of **five** interconnected components:

| Component | Purpose | Status | Technology |
|-----------|---------|--------|------------|
| **central-auth-api** | Backend API | ✅ Complete | Python, FastAPI |
| **admin_control** | Admin dashboard | ✅ Complete | React, TypeScript |
| **registration-portal** | User registration | ✅ Complete | React, TypeScript |
| **auth-sdk** | Login SDK for 3rd parties | ✅ Complete | React, TypeScript |
| **mobile-auth-app** | Mobile authenticator | 🚧 To Build | React Native, Expo |

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: Service Requests QR Code
┌───────────────────┐          ┌─────────────────────┐
│  ServiceB.com     │ ──────▶  │  Central Auth API   │
│  (Uses Auth SDK)  │   POST   │  /api/auth/qr/gen   │
│                   │   ◀──────│  Returns QR Token   │
│  Displays QR Code │          └─────────────────────┘
└───────────────────┘

STEP 2: User Scans QR with Mobile App
┌───────────────────┐          ┌─────────────────────┐
│  Mobile Auth App  │ ──────▶  │  Central Auth API   │
│  (This Project)   │   POST   │  /api/auth/qr/scan  │
│                   │   ◀──────│  Returns 6-digit    │
│  Displays PIN     │          │  PIN to user        │
└───────────────────┘          └─────────────────────┘

STEP 3: User Enters PIN on Service
┌───────────────────┐          ┌─────────────────────┐
│  ServiceB.com     │ ──────▶  │  Central Auth API   │
│  User types PIN   │   POST   │  /api/auth/pin/ver  │
│                   │   ◀──────│  Returns Session    │
│  User Logged In!  │          │  Token              │
└───────────────────┘          └─────────────────────┘
```

---

## Project Objectives

### Primary Goals

1. **Secure QR Scanning** - Camera-based QR code scanning with real-time detection
2. **API Integration** - Communicate with Central Auth API to complete authentication
3. **PIN Display** - Show generated PIN in a clear, copy-friendly format
4. **Credential Storage** - Securely store user's auth key using device encryption

### Secondary Goals

1. **Biometric Lock** - Optional Face ID/Touch ID protection
2. **Activity History** - Log of recent authentications
3. **Push Notifications** - Optional alerts for login attempts
4. **Dark Mode** - Theme matching system preferences

---

## Target Platforms

| Platform | Minimum Version | Distribution |
|----------|-----------------|--------------|
| iOS | 13.0+ | TestFlight → App Store |
| Android | Android 8.0 (API 26)+ | APK → Google Play |

---

## Technology Stack

### Framework & Language

- **React Native** - Cross-platform mobile development
- **Expo SDK 52+** - Managed workflow for faster development
- **TypeScript** - Type-safe development

### Core Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| Navigation | @react-navigation/native | Screen routing |
| State | Zustand | Global state management |
| Networking | Axios | API communication |
| Camera | expo-camera | QR code scanning |
| Storage | expo-secure-store | Encrypted credential storage |
| Haptics | expo-haptics | Touch feedback |
| Notifications | expo-notifications | Push notifications |

### Development Tools

- **ESLint + Prettier** - Code quality
- **Jest + React Native Testing Library** - Unit & integration tests
- **Detox** - E2E testing
- **EAS Build** - Cloud builds

---

## User Journey

### First-Time User (Onboarding)

```
┌──────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. WELCOME SCREEN                                           │
│     └── App introduction, benefits, branding                 │
│                     ▼                                        │
│  2. PERMISSION REQUEST                                       │
│     └── Camera permission explanation & request              │
│                     ▼                                        │
│  3. ACCOUNT LINKING                                          │
│     └── User enters their Membership Key (auth_key)          │
│     └── Option: Scan linking QR from Admin Portal            │
│                     ▼                                        │
│  4. BIOMETRIC SETUP (Optional)                               │
│     └── Enable Face ID / Touch ID / PIN lock                 │
│                     ▼                                        │
│  5. READY TO USE                                             │
│     └── Navigate to Home Screen                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Returning User (Authentication)

```
┌──────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. UNLOCK APP                                               │
│     └── Biometric / PIN verification (if enabled)            │
│                     ▼                                        │
│  2. HOME SCREEN                                              │
│     └── "Scan QR" button prominently displayed               │
│     └── Recent activity list                                 │
│                     ▼                                        │
│  3. SCANNER SCREEN                                           │
│     └── Full-screen camera with scanning overlay             │
│     └── Auto-detect QR codes                                 │
│     └── Vibration feedback on detection                      │
│                     ▼                                        │
│  4. PROCESSING                                               │
│     └── Loading indicator                                    │
│     └── API call to /api/auth/qr/scan                        │
│                     ▼                                        │
│  5. PIN DISPLAY                                              │
│     └── Large 6-digit PIN displayed                          │
│     └── Copy to clipboard button                             │
│     └── Expiration countdown timer                           │
│                     ▼                                        │
│  6. COMPLETION                                               │
│     └── Return to Home                                       │
│     └── Entry added to activity log                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## API Integration Points

The mobile app interacts with the following Central Auth API endpoints:

### Required Endpoints

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/api/auth/qr/scan` | POST | Submit scanned QR token | `{qr_token, user_auth_key}` | `{success, pin}` |
| `/api/auth/validate-key` | POST | Verify user's auth key | `{auth_key}` | `{valid, user_info}` |
| `/api/system/status` | GET | Check API availability | - | `{status, message}` |

### Optional Endpoints (Future)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/history` | GET | Get user's login history |
| `/api/notifications/register` | POST | Register device for push |

---

## Security Considerations

### Credential Storage

- **User Auth Key** stored in `expo-secure-store` (Keychain on iOS, Keystore on Android)
- Never stored in plain text or AsyncStorage
- Cleared on app uninstall

### Network Security

- HTTPS enforced for all API calls
- Certificate pinning (optional, recommended for production)
- Request timeout limits (30 seconds)

### App Security

- Optional biometric lock
- PIN fallback when biometric unavailable
- Auto-lock after background timeout
- No sensitive data in logs

---

## Success Metrics

| Metric | Target |
|--------|--------|
| App Launch to Scan | < 3 seconds |
| QR Detection Time | < 1 second |
| API Response Time | < 2 seconds |
| Crash Rate | < 0.1% |
| App Size | < 50 MB |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Camera permission denied | Medium | High | Clear explanation, settings redirect |
| API unreachable | Low | High | Offline mode with retry, cached status |
| Expired QR before scan | Medium | Medium | Clear expiration messaging |
| Lost auth key | Low | High | Recovery instructions, re-linking flow |

---

## Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1: Setup | 1-2 days | Project initialization, dependencies |
| Phase 2: Core Features | 5-7 days | UI, scanning, API integration |
| Phase 3: Polish | 2-3 days | Error handling, animations, testing |
| Phase 4: Deployment | 1-2 days | Build configuration, store submission |
| **Total** | **9-14 days** | Full development cycle |

---

## Document Index

This comprehensive plan is supported by the following supplementary documents:

1. **PROJECT_STRUCTURE.md** - Detailed file/folder organization
2. **DEVELOPMENT_GUIDE.md** - Step-by-step implementation instructions
3. **API_INTEGRATION.md** - API service implementation details
4. **UI_SPECIFICATIONS.md** - Screen designs and component specs
5. **TESTING_STRATEGY.md** - Testing approach and test cases
6. **DEPLOYMENT_GUIDE.md** - Build, release, and distribution
