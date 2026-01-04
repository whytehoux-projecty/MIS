# Mobile Auth App - Deployment Guide

## Overview

This guide covers the complete process of building, testing, and releasing the mobile-auth-app to both iOS App Store and Google Play Store.

---

## Prerequisites

### Required Accounts

| Account | Purpose | URL |
|---------|---------|-----|
| Expo Account | EAS Build service | <https://expo.dev> |
| Apple Developer | iOS publishing | <https://developer.apple.com> |
| Google Play Console | Android publishing | <https://play.google.com/console> |

### Required Tools

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Verify login
eas whoami
```

---

## Phase 1: Build Configuration

### app.json Final Configuration

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
      "backgroundColor": "#0f172a"
    },
    "assetBundlePatterns": ["**/*"],
    
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.centralauth.mobile",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Central Auth uses the camera to scan QR codes for secure authentication.",
        "NSFaceIDUsageDescription": "Use Face ID to quickly and securely unlock the app.",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      },
      "package": "com.centralauth.mobile",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "VIBRATE"
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
    
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    },
    
    "owner": "your-expo-username",
    "scheme": "centralauth"
  }
}
```

### eas.json Configuration

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://192.168.1.100:8000"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://staging-api.yourcompany.com"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://api.yourcompany.com"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Phase 2: Asset Preparation

### Required Assets

| Asset | Dimensions | Format | Location |
|-------|------------|--------|----------|
| App Icon | 1024×1024 | PNG | `./src/assets/images/icon.png` |
| Splash Screen | 1284×2778 | PNG | `./src/assets/images/splash.png` |
| Adaptive Icon FG | 1024×1024 | PNG | `./src/assets/images/adaptive-icon.png` |
| iOS Screenshots | Various | PNG | For App Store |
| Android Screenshots | Various | PNG | For Play Store |

### Screenshot Requirements

**iOS (iPhone 15 Pro Max):**

- 1290 × 2796 pixels
- Minimum 3, maximum 10 screenshots

**Android:**

- 16:9 aspect ratio
- Minimum: 320×320, Maximum: 3840×3840
- Minimum 2 screenshots

---

## Phase 3: Build Process

### Development Build

For testing with development client:

```bash
# Build for iOS simulator
eas build --profile development --platform ios

# Build for Android (APK)
eas build --profile development --platform android
```

### Preview Build

For internal testing (TestFlight/Internal Testing):

```bash
# Build both platforms
eas build --profile preview --platform all

# Or individually
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Production Build

For store release:

```bash
# Build both platforms
eas build --profile production --platform all
```

---

## Phase 4: iOS Deployment

### Step 1: App Store Connect Setup

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new App:
   - Select your Bundle ID
   - Name: "Central Auth"
   - Primary Language: English (U.S.)
   - SKU: `centralauth-mobile-001`

### Step 2: App Information

**App Privacy:**

- Data Collection: Camera (for QR scanning)
- Data Usage: Authentication
- Data Linked to User: User ID, Authentication credentials

**App Category:**

- Primary: Utilities
- Secondary: Business

### Step 3: Submit Build

Option A: Automatic submission via EAS:

```bash
eas submit --platform ios
```

Option B: Manual upload:

1. Download `.ipa` from EAS dashboard
2. Open Transporter app on Mac
3. Upload the `.ipa` file
4. Select build in App Store Connect

### Step 4: TestFlight Testing

1. Navigate to TestFlight tab in App Store Connect
2. Add internal testers (up to 100)
3. Add external testers (up to 10,000)
4. Submit for Beta App Review (external only)

### Step 5: App Store Submission

1. Go to App Store tab
2. Select the build
3. Fill in:
   - Version information
   - Screenshots (required)
   - App description
   - Keywords
   - Support URL
   - Marketing URL (optional)
4. Answer export compliance questions
5. Answer content rights questions
6. Submit for Review

### Expected Review Time

- Initial review: 24-48 hours
- Updates: 24 hours typically

---

## Phase 5: Android Deployment

### Step 1: Google Play Console Setup

1. Log in to [Google Play Console](https://play.google.com/console)
2. Create new Application:
   - App name: "Central Auth"
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free

### Step 2: Store Listing

Complete all sections:

- Short description (80 characters)
- Full description (4000 characters)
- Screenshots (phone, tablet)
- Feature graphic (1024×500)
- App icon (512×512)

### Step 3: Content Rating

Complete questionnaire for IARC rating:

- Violence: None
- Sexuality: None
- Language: None
- Controlled substance: None
- ESRB: Everyone

### Step 4: App Content

Set up:

- Target audience: 18+
- Ads: Contains no ads
- App category: Communication

### Step 5: Submit Build

Option A: Automatic submission via EAS:

```bash
eas submit --platform android
```

Option B: Manual upload:

1. Download `.aab` from EAS dashboard
2. Create new release in Google Play Console
3. Upload the `.aab` file
4. Add release notes
5. Submit for review

### Testing Tracks

| Track | Purpose | Max Testers |
|-------|---------|-------------|
| Internal testing | Team testing | 100 |
| Closed testing | Beta users | 5,000 |
| Open testing | Public beta | Unlimited |
| Production | Public release | Unlimited |

### Expected Review Time

- Initial review: 1-3 days (up to 7 for new accounts)
- Updates: Same day to 3 days

---

## Phase 6: Post-Release

### Monitoring

Set up crash reporting and analytics:

```typescript
// src/services/analytics.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  // Analytics implementation
};

export const logError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};
```

### Version Updates

When releasing updates:

1. Update `version` in `app.json`:

```json
{
  "version": "1.1.0"
}
```

1. Update platform-specific versions:

```json
{
  "ios": {
    "buildNumber": "2"
  },
  "android": {
    "versionCode": 2
  }
}
```

1. Build and submit:

```bash
eas build --profile production --platform all
eas submit --platform all
```

### Release Notes Template

```markdown
# Version 1.1.0

## What's New
- Improved QR scanning speed
- Added dark mode support
- Bug fixes and performance improvements

## Bug Fixes
- Fixed crash when camera permission denied
- Resolved PIN display alignment issue
```

---

## Checklist Summary

### Pre-Release Checklist

- [ ] All tests passing
- [ ] API production URL configured
- [ ] App icons and splash screens ready
- [ ] Screenshots captured for all device sizes
- [ ] App Store/Play Store listings complete
- [ ] Privacy policy URL live
- [ ] Support email configured
- [ ] Version numbers correct

### iOS Checklist

- [ ] Bundle ID registered
- [ ] App Store Connect app created
- [ ] Certificates and provisioning configured
- [ ] TestFlight testing complete
- [ ] Export compliance answered
- [ ] Content rights confirmed

### Android Checklist

- [ ] Package name registered
- [ ] Play Console app created
- [ ] Keystore configured and backed up
- [ ] Internal testing complete
- [ ] Content rating completed
- [ ] Target API level compliant

---

## Troubleshooting

### Common Issues

**Build fails with code signing error (iOS):**

```bash
# Reset credentials
eas credentials --platform ios
```

**Build fails with Gradle error (Android):**

```bash
# Clean and rebuild
cd android && ./gradlew clean
eas build --profile production --platform android --clear-cache
```

**App rejected for missing privacy policy:**

- Add privacy policy URL to app.json:

```json
{
  "ios": {
    "privacyManifests": {
      "NSPrivacyTrackingUsed": false
    }
  }
}
```

---

## Support Resources

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
