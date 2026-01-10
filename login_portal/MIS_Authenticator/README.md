# MIS Authenticator

Mobile authentication application for the MIS System, built with React Native and Expo.

## Features

- **Biometric Security**: Protects app access using FaceID/Fingerprint (Toggle in Settings).
- **Device Fingerprinting**: Sends device metadata for security audits.
- **Secure Authentication**: Uses hardware-backed secure storage for keys.
- **QR Code Scanning**: Rapid login via QR codes.
- **Cross-Platform**: Runs on iOS, Android, and Web (PWA compatible).
- **Theming**: Supports Dark and Light modes with the "Chaco" brand palette.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

```bash
npm install
npx expo install expo-local-authentication expo-device
```

### Running the App

Start the development server:

```bash
npm start
```

Run on specific platforms:

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## Project Structure

- `app/`: Expo Router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/constants/`: Configuration and theme definitions.
- `src/context/`: React Contexts (e.g., ThemeContext).
- `src/services/`: API and Storage services.
- `src/stores/`: State management (Zustand).

## Technologies

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Styling**: Custom Theme Engine (Chaco Brand)
- **State**: Zustand
