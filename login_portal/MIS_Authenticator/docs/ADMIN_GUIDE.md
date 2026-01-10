# MIS Authenticator - Administrator Guide

## System Overview

The **MIS Authenticator** is a cross-platform mobile application built with **React Native (Expo)**. It provides secure, out-of-band authentication using cryptographic keys stored in the device's secure hardware enclave.

### Key Technologies
- **Framework**: Expo SDK 54 (React Native 0.76+)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Storage**: `expo-secure-store` (Native) / `localStorage` (Web Fallback)
- **Camera**: `expo-camera`

## Deployment

### Prerequisites
- Node.js LTS
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Building for Production

#### 1. Android (APK/AAB)
```bash
eas build --platform android --profile production
```

#### 2. iOS (IPA)
*Requires Apple Developer Account*
```bash
eas build --platform ios --profile production
```

#### 3. Web (PWA)
The app is fully compatible as a Progressive Web App.
```bash
npm run deploy
# Or manual build:
npx expo export -p web
```
The output in `dist/` can be hosted on any static site provider (Vercel, Netlify, AWS S3).

## Configuration

### Environment Variables
The app uses a configuration file strategy (likely `src/constants/config.ts` or `.env` files in future iterations). Currently, API endpoints are defined in the source.

**Important**: Ensure `API_CONFIG.BASE_URL` points to your production MIS Identity Provider.

### Branding & Theming
The app uses a centralized theme engine located in `src/constants/theme.ts`.
- **Palette**: "Chaco" brand colors are defined here.
- **Fonts**: The app uses `Bebas Neue` for headings.
- **Icons**: Ensure `assets/icon.png` and `assets/adaptive-icon.png` are updated with the official MIS Logo before build.

## Security Architecture

### Key Storage
- **iOS**: Keys are stored in the **Keychain**.
- **Android**: Keys are stored in **SharedPreferences** encrypted with Keystore.
- **Web**: Keys are stored in **LocalStorage**. *Note: For high-security web deployments, consider wrapping the PWA in a secure container or using Web Crypto API.*

### Authentication Flow
1.  **Device Linking**: User scans a setup QR containing a specialized token.
2.  **Key Generation**: App generates a public/private key pair. Public key is sent to server; Private key is stored securely.
3.  **Login**:
    - App scans Login QR (containing `challenge`).
    - App signs `challenge` with Private Key.
    - App sends signature to server.
    - Server verifies signature with stored Public Key.

## Troubleshooting & Support

- **Build Failures**: Check `eas.json` for build profile configurations.
- **Runtime Errors**: Use `npx expo start` to debug locally. Check console logs for API connectivity issues.
