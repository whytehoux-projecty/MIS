# Manual Testing on Android Emulator (Virtual Device) — Step-by-Step

This guide shows how to test this app on an **Android Emulator (AVD)** on your Mac.

It covers two ways to run the app:

1. **Expo Go (recommended first)**: quickest “it runs” check.
2. **Installable build on emulator (APK)**: closer to a real installed app.

It also includes a full “what to tap” manual testing checklist.

---

## Part 0 — Quick glossary (so nothing is confusing)

- **Android Studio**: the official tool that includes the Android Emulator.
- **AVD (Android Virtual Device)**: the emulator device definition (Pixel 7, etc).
- **Emulator**: the simulated Android phone running on your Mac.
- **ADB (Android Debug Bridge)**: command line tool to communicate with emulator/devices.
- **Expo Go**: Android app that can run this project from the dev server.
- **Dev server**: the process you start on your Mac that the emulator connects to.
- **Mock API mode**: run without backend using `EXPO_PUBLIC_USE_MOCK_API=true`.
- **E2E Mode (manual scan UI)**: Scan screen shows a “Simulate Scan” input when `EXPO_PUBLIC_E2E_MODE=true`.

---

## Part 1 — Install Android Studio and create an emulator (AVD)

### 1.1 Install Android Studio

1. Download Android Studio: https://developer.android.com/studio
2. Install it normally.
3. Open Android Studio at least once and complete the first-time setup.

### 1.2 Install required SDK components

In Android Studio:

1. Open **Settings** (macOS: Android Studio → Settings).
2. Go to **Appearance & Behavior → System Settings → Android SDK**.
3. In the **SDK Platforms** tab:
   - Install one modern Android version (example: Android 14 / API 34).
4. In the **SDK Tools** tab, ensure these are installed:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Command-line Tools (latest)
5. Click **Apply**.

### 1.3 Create an Android Virtual Device (AVD)

1. In Android Studio, open **Device Manager**.
2. Click **Create device**.
3. Pick a device (example: Pixel 7).
4. Pick a system image (example: API 34).
   - If it asks you to download the system image, accept and install it.
5. Finish and then click the “Play” button to start the emulator.

You should now see a running Android phone on your screen.

---

## Part 2 — Confirm `adb` works (recommended)

This step helps you confirm the emulator is correctly connected.

1. Open Terminal.
2. Run:

```bash
adb devices
```

Expected output includes something like:

- `emulator-5554 device`

If `adb` is “command not found”:

- Android Studio installs it under the Android SDK folder.
- The default path is often:
  - `~/Library/Android/sdk/platform-tools/adb`
- You can run it directly like:

```bash
~/Library/Android/sdk/platform-tools/adb devices
```

If you want, you can add that folder to your PATH later.

---

## Part 3 — Run the app on the emulator using Expo Go (recommended first)

### 3.1 Start the Expo dev server

1. Open Terminal.
2. Go to the project folder:

```bash
cd "/Volumes/Project Disk/PROJECTS/BUILDING CODEBASE/Central-Auth-API/mobile-auth-app"
```

3. Install dependencies (first time only):

```bash
npm install
```

4. Start the dev server:

```bash
npx expo start
```

Recommended when you don’t want to run the backend:

```bash
EXPO_PUBLIC_USE_MOCK_API=true npx expo start
```

Recommended when you want to test scanning without a working emulator camera:

```bash
EXPO_PUBLIC_USE_MOCK_API=true EXPO_PUBLIC_E2E_MODE=true npx expo start
```

### 3.2 Install Expo Go inside the emulator

You have two common options:

**Option A (simplest): install from Google Play Store**

1. In the emulator, open the **Play Store**.
2. Search for **Expo Go**.
3. Install it.

**Option B: install Expo Go APK manually**

If the emulator doesn’t have Play Store, you can install an APK manually, but the Play Store route is easiest when available.

### 3.3 Open the app from the dev server

Once Expo Go is installed:

1. Open **Expo Go** on the emulator.
2. In Terminal, where `npx expo start` is running:
   - Press `a` (this tells Expo to open the app on Android).
3. The app should load inside the emulator.

If pressing `a` doesn’t work:

- Make sure the emulator is running before you press `a`.
- Restart the dev server:
  - Stop with `Ctrl + C`
  - Start again: `npx expo start`

---

## Part 4 — Manual testing checklist (what to tap)

This checklist assumes you started the app with mock mode:

```bash
EXPO_PUBLIC_USE_MOCK_API=true npx expo start
```

1. **Welcome screen**
   - Tap “Get Started”
2. **Permissions screen**
   - Tap “Continue”
   - Approve camera permission if prompted
   - If you prefer: tap “Not now”
3. **Link Account screen**
   - Enter:
     - `good-key-1234` → should succeed (mock mode)
     - `bad-key-1234` → should fail (mock mode)
   - Tap “Continue”
4. **Home tab**
   - Confirm you see the main home UI
5. **Scan tab**
   - If you started with `EXPO_PUBLIC_E2E_MODE=true`, you will see “E2E Mode”:
     - Enter `hello` → tap “Simulate Scan” (success)
     - Enter `expired` → tap “Simulate Scan” (failure alert)
     - Enter `used` / `closed` to test other error states
   - If you did not enable E2E mode:
     - Test the camera screen (emulator camera support varies by machine/system image)
6. **Result screen**
   - Tap “Copy”
   - Tap “Back to Home”
7. **History tab**
   - Confirm a scan entry exists
8. **Settings tab**
   - Tap “Sign out”
   - Confirm you return to onboarding

---

## Part 5 — Installable build on the emulator (APK) (after Expo Go works)

This is closer to a “real app install” experience.

### 5.1 Option A: Build locally and install to emulator (Android Gradle)

1. Ensure the emulator is running.
2. From the project folder:

```bash
cd "/Volumes/Project Disk/PROJECTS/BUILDING CODEBASE/Central-Auth-API/mobile-auth-app"
npx expo run:android
```

This will:

- Generate the native Android project (if needed)
- Build it
- Install it onto the running emulator

If the build succeeds, the app should launch on the emulator automatically.

### 5.2 Option B: Use EAS Build and install the APK to emulator

This repo has an EAS profile for internal builds in [eas.json](file:///Volumes/Project%20Disk/PROJECTS/BUILDING%20CODEBASE/Central-Auth-API/mobile-auth-app/eas.json).

Build:

```bash
npx eas-cli build --platform android --profile e2e
```

After the build finishes, download the APK.

Install the APK onto the emulator:

```bash
adb install -r /path/to/your-build.apk
```

Then open the app from the emulator app drawer.

---

## Troubleshooting (common emulator issues)

### “adb: command not found”

Use the full path:

```bash
~/Library/Android/sdk/platform-tools/adb devices
```

### “No connected devices”

- Start the emulator first (Device Manager → Play button).
- Run:

```bash
adb devices
```

### The camera doesn’t work in the emulator

This is common. Use E2E manual scan UI:

```bash
EXPO_PUBLIC_USE_MOCK_API=true EXPO_PUBLIC_E2E_MODE=true npx expo start
```

Then Scan tab → “Simulate Scan”.

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

# Open on Android from Expo CLI
# (When dev server is running, press "a" in that terminal)

# Run on Android emulator as an installable app
npx expo run:android
```

