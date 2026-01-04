# Mobile Auth App - Documentation

## 📚 Documentation Index

This folder contains comprehensive documentation for the **mobile-auth-app** project - the mobile authenticator component of the Central Auth System.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [00_MASTER_PLAN.md](./00_MASTER_PLAN.md) | High-level project overview, objectives, and ecosystem context |
| [01_PROJECT_STRUCTURE.md](./01_PROJECT_STRUCTURE.md) | Complete file/folder organization and naming conventions |
| [02_DEVELOPMENT_GUIDE.md](./02_DEVELOPMENT_GUIDE.md) | Step-by-step implementation instructions |
| [03_API_INTEGRATION.md](./03_API_INTEGRATION.md) | API endpoints, request/response formats, and service code |
| [04_UI_SPECIFICATIONS.md](./04_UI_SPECIFICATIONS.md) | Screen designs, components, and design system |
| [05_TESTING_STRATEGY.md](./05_TESTING_STRATEGY.md) | Testing approach, examples, and coverage goals |
| [06_DEPLOYMENT_GUIDE.md](./06_DEPLOYMENT_GUIDE.md) | Build configuration and App Store/Play Store submission |

---

## 🎯 Project Summary

**Purpose:** Cross-platform mobile app for QR-based two-factor authentication

**Technology Stack:**

- React Native (Expo)
- TypeScript
- Zustand (state management)
- Expo Camera (QR scanning)
- Expo Secure Store (credential storage)

**Target Platforms:**

- iOS 13.0+
- Android 8.0+ (API 26)

---

## 🔄 Authentication Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ServiceB   │────▶│ Central Auth    │◀────│ Mobile Auth App │
│  (Web)      │     │ API             │     │ (This Project)  │
└─────────────┘     └─────────────────┘     └─────────────────┘
       │                    │                        │
       │ 1. Request QR      │                        │
       │───────────────────▶│                        │
       │                    │                        │
       │ 2. Display QR      │                        │
       │◀───────────────────│                        │
       │                    │                        │
       │                    │  3. Scan QR + Auth Key │
       │                    │◀───────────────────────│
       │                    │                        │
       │                    │  4. Return PIN         │
       │                    │───────────────────────▶│
       │                    │                        │
       │ 5. User enters PIN │                        │
       │───────────────────▶│                        │
       │                    │                        │
       │ 6. Session Token   │                        │
       │◀───────────────────│                        │
       │                    │                        │
       │  ✅ Logged In!     │                        │
       └────────────────────┴────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Clone and navigate
cd Central-Auth-API/mobile-auth-app

# 2. Install dependencies
npm install

# 3. Start development server
npx expo start

# 4. Run on device/simulator
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR with Expo Go app for physical device
```

---

## 📊 Ecosystem Components

| Component | Status | Purpose |
|-----------|--------|---------|
| central-auth-api | ✅ Complete | Backend API |
| admin_control | ✅ Complete | Admin dashboard |
| registration-portal | ✅ Complete | User registration |
| auth-sdk | ✅ Complete | Login SDK for services |
| **mobile-auth-app** | 🚧 To Build | **Mobile authenticator** |

---

## 📅 Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Setup | 1-2 days | Project initialization |
| Core Features | 5-7 days | UI, scanning, API |
| Polish | 2-3 days | Testing, animations |
| Deployment | 1-2 days | Store submission |
| **Total** | **9-14 days** | |

---

## 📖 Reading Order

For new developers joining the project:

1. Start with **00_MASTER_PLAN.md** - understand the big picture
2. Read **01_PROJECT_STRUCTURE.md** - learn the codebase layout
3. Follow **02_DEVELOPMENT_GUIDE.md** - set up your environment
4. Reference **03_API_INTEGRATION.md** - when implementing API calls
5. Use **04_UI_SPECIFICATIONS.md** - when building screens
6. Consult **05_TESTING_STRATEGY.md** - when writing tests
7. Follow **06_DEPLOYMENT_GUIDE.md** - when releasing

---

## 🔗 Related Resources

- [Central Auth API Docs](../central-auth-api/docs/)
- [Auth SDK README](../auth-sdk/README.md)
- [Architecture Overview](../ARCHITECTURE_OVERVIEW.md)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
