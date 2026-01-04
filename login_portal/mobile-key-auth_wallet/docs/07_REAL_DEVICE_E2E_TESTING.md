# Real Device E2E Testing (Maestro)

## What this gives you

- Fully automated UI flows on real Android devices (USB-connected) using Maestro.
- Deterministic scanning flow via an in-app E2E mode (no physical QR required).

## Prereqs

- Install Maestro: https://maestro.mobile.dev
- Android device with USB debugging enabled
- `adb` installed and on PATH

## Build an E2E APK (EAS)

This repo includes an `e2e` build profile in [eas.json](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Central-Auth-API/mobile-auth-app/eas.json) that turns on:

- `EXPO_PUBLIC_USE_MOCK_API=true`
- `EXPO_PUBLIC_E2E_MODE=true`

Build:

```bash
npx eas-cli build --platform android --profile e2e
```

Install the resulting APK on your device, then run:

```bash
npm run e2e:maestro
```

## Run flows locally

```bash
maestro test e2e/maestro
```

Flows:

- [smoke.yaml](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Central-Auth-API/mobile-auth-app/e2e/maestro/smoke.yaml)
- [scan-failure.yaml](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Central-Auth-API/mobile-auth-app/e2e/maestro/scan-failure.yaml)

## iOS “real phone” notes

- Maestro is straightforward on iOS simulators, but real iOS devices usually require additional tooling and signing.
- If you need real iOS device automation today, the common options are Appium + a device farm (BrowserStack, AWS Device Farm) or running XCTest-based UI tests in a native build.

