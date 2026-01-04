# Manual Testing on a Real iPhone (Step-by-Step)

This guide shows two ways to test this app on a real iPhone:

1. **Expo Go (recommended first)**: fastest setup, no build/signing needed.
2. **Real installable build**: the app is installed like a normal app. This requires Apple signing.

If you follow the guide in order, you will be able to:

- Open the app on your iPhone
- Link an account (with mock data, no backend required)
- Test scanning (with camera or with the built-in E2E manual token input)
- Verify History/Settings flows

---

## Part 0 — Quick glossary (so nothing is confusing)

- **Expo Go**: an app from the App Store that can run your project directly from your computer while you develop.
- **Dev server**: the process you start on your computer that your iPhone connects to.
- **EAS Build**: Expo’s build service for generating installable iOS apps (.ipa).
- **TestFlight**: Apple’s official way to install test builds on a real iPhone.
- **Mock API mode**: this app can run without a backend using `EXPO_PUBLIC_USE_MOCK_API=true`.
- **E2E Mode (manual scan UI)**: the Scan screen shows a “Simulate Scan” input when `EXPO_PUBLIC_E2E_MODE=true`.

---

## Part 1 — Expo Go on a real iPhone (recommended first)

### 1.1 Requirements

- A Mac with this repository checked out
- Your iPhone
- Your iPhone and Mac connected to the same Wi‑Fi network
- Expo Go installed on your iPhone (App Store)

### 1.2 Start the app on your Mac

1. Open Terminal.
2. Go to the project folder:

   ```bash
   cd "/Volumes/Project Disk/PROJECTS/BUILDING CODEBASE/Central-Auth-API/mobile-auth-app"
   ```

3. Install dependencies (first time only):

   ```bash
   npm install
   ```

4. Start the Expo dev server (basic):

   ```bash
   npx expo start
   ```

5. Recommended for manual testing without any backend:

   ```bash
   EXPO_PUBLIC_USE_MOCK_API=true npx expo start
   ```

6. If you want manual scan testing without needing a real QR code:

   ```bash
   EXPO_PUBLIC_USE_MOCK_API=true EXPO_PUBLIC_E2E_MODE=true npx expo start
   ```

### 1.3 Open the app on your iPhone using Expo Go

1. After you run `npx expo start`, you should see a QR code in the terminal (and a web page may open).
2. On your iPhone, open **Expo Go**.
3. Use Expo Go’s “Scan QR Code” and scan the QR from your Mac.
4. The app should open on your iPhone.

### 1.4 If scanning the QR does not work

Try these in order:

1. Make sure iPhone and Mac are on the same Wi‑Fi.
2. Restart the dev server:
   - Stop it with `Ctrl + C`
   - Start it again: `npx expo start`
3. Use tunnel mode (works even if your Wi‑Fi blocks local connections):

   ```bash
   npx expo start --tunnel
   ```

4. If you are on a corporate Wi‑Fi, tunnel mode is usually required.

### 1.5 Manual testing checklist (what to click in the app)

These steps assume you started with mock mode enabled:

```bash
EXPO_PUBLIC_USE_MOCK_API=true npx expo start
```

1. **Welcome screen**
   - Tap “Get Started”
2. **Permissions screen**
   - Tap “Continue”
   - iOS may ask for camera permission. Tap “Allow”.
   - If you prefer: tap “Not now” to skip.
3. **Link Account screen**
   - Enter a membership key:
     - `good-key-1234` → should succeed (mock mode)
     - `bad-key-1234` → should fail (mock mode)
   - Tap “Continue”
4. **Home tab**
   - Confirm you see the main home UI
5. **Scan tab**
   - If you enabled E2E mode (`EXPO_PUBLIC_E2E_MODE=true`), you’ll see an “E2E Mode” card:
     - Enter `hello` then tap “Simulate Scan” (success)
     - Enter `expired` then tap “Simulate Scan” (failure alert)
   - If you did not enable E2E mode:
     - Test the camera view and try scanning a real QR code
6. **Result screen**
   - Tap “Copy” and confirm iOS shows a confirmation message
   - Tap “Back to Home”
7. **History tab**
   - Confirm you see an entry for your scan
8. **Settings tab**
   - Tap “Sign out”
   - Confirm you go back to onboarding

### 1.6 Where to see logs while testing on your phone

- On your Mac: the terminal running `npx expo start` will show logs.
- In Expo Go: open the dev menu and look for logs (depends on Expo Go version).

---

## Part 2 — Real installable iPhone build (after Expo Go works)

There are two common ways to get a real installable app onto a real iPhone:

- **Option A: EAS Build + TestFlight (recommended for ongoing testing)**
- **Option B: Local Xcode install to your iPhone (works without paid account, but expires quickly)**

### 2.1 Confirm your iOS bundle identifier

This project is configured with:

- iOS bundle identifier: `com.centralauth.mobileauth`

You can confirm it in [app.json](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Central-Auth-API/mobile-auth-app/app.json).

---

## Option A — EAS Build + TestFlight (recommended)

### A.1 Requirements

- An Expo account (free)
- An Apple Developer Program account (paid) for TestFlight distribution
- Apple ID access to App Store Connect

### A.2 Install and login to EAS CLI

1. In Terminal, in the project folder:

   ```bash
   cd "/Volumes/Project Disk/PROJECTS/BUILDING CODEBASE/Central-Auth-API/mobile-auth-app"
   ```

2. Login:

   ```bash
   npx eas-cli login
   ```

### A.3 Create the project in EAS (first time only)

Run:

```bash
npx eas-cli init
```

Follow the prompts. This links your local project to EAS.

### A.4 Build an installable iOS test build

This repo includes EAS build profiles in [eas.json](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Central-Auth-API/mobile-auth-app/eas.json):

- `ios-e2e`: internal distribution, mock API, E2E scan input enabled
- `ios-testflight`: store distribution for TestFlight (production-like)

#### A.4.1 Internal test build (quick for manual testing)

```bash
npx eas-cli build --platform ios --profile ios-e2e
```

Notes:

- EAS will guide you through iOS credentials if needed.
- “Internal” iOS builds still require Apple signing; you may need to register your test device.

#### A.4.2 TestFlight build (recommended for sharing/testing)

```bash
npx eas-cli build --platform ios --profile ios-testflight
```

Then submit to TestFlight:

```bash
npx eas-cli submit --platform ios
```

After submission:

1. Open App Store Connect (web)
2. Go to your app → TestFlight
3. Wait for processing
4. Add yourself as a tester
5. Install TestFlight on your iPhone
6. Install the build from TestFlight

### A.5 Manual test checklist (TestFlight / internal build)

Run the same checklist from Part 1.5.

If you used the `ios-e2e` profile:

- Scan tab will show “E2E Mode” and “Simulate Scan”
- Use tokens: `hello`, `expired`, `used`, `closed`

If you used the `ios-testflight` profile:

- The app will try to use the real API by default (unless you change env variables for that build profile)

---

## Option B — Local install with Xcode (no TestFlight)

This method installs the app directly to your connected iPhone from Xcode.

### B.1 Requirements

- Xcode installed on your Mac
- Your iPhone connected via USB
- You trust the computer on the iPhone when prompted

### B.2 Build and run on your device

1. In Terminal:

   ```bash
   cd "/Volumes/Project Disk/PROJECTS/BUILDING CODEBASE/Central-Auth-API/mobile-auth-app"
   npx expo run:ios --device
   ```

2. If prompted, select your iPhone.
3. If Xcode opens and asks about signing:
   - Select your Team (your Apple ID)
   - Allow Xcode to manage signing
4. The app should install and launch on your iPhone.

Notes:

- With a free Apple ID, builds can expire and need reinstalling (often within 7 days).
- This path is best for personal testing when you do not want TestFlight yet.

---

## Troubleshooting (common real-phone issues)

### Camera permission problems

If the camera screen is blank or permission was denied:

1. On iPhone: Settings → Privacy & Security → Camera
2. Find the app (Expo Go or your installed build) and enable Camera

### “Network request failed” / API issues

If you are not running your backend:

- Always start the app with mock API mode:

  ```bash
  EXPO_PUBLIC_USE_MOCK_API=true npx expo start
  ```

For installable builds, use the `ios-e2e` build profile to enable mock mode inside the build.

### Expo Go cannot connect to the dev server

1. Confirm same Wi‑Fi network.
2. Use tunnel mode:

   ```bash
   npx expo start --tunnel
   ```

---

## Useful commands (quick reference)

From the project root:

```bash
# Start dev server
npx expo start

# Start dev server with mock API
EXPO_PUBLIC_USE_MOCK_API=true npx expo start

# Start dev server with mock API + E2E scan UI
EXPO_PUBLIC_USE_MOCK_API=true EXPO_PUBLIC_E2E_MODE=true npx expo start

# Run automated tests (optional)
npm test

# Typecheck (optional)
npm run typecheck

# EAS iOS internal test build
npx eas-cli build --platform ios --profile ios-e2e

# EAS iOS TestFlight build
npx eas-cli build --platform ios --profile ios-testflight
```

