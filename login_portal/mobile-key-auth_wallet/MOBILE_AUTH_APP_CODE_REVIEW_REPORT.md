# Mobile Auth App — Comprehensive Code, Flow, and Architecture Review

## Repository layout and what each folder is responsible for

### `app/` (runtime screens and navigation)
This project uses Expo Router, which means every file inside `app/` becomes a “screen” (a page the user can navigate to). Route groups like `(onboarding)` and `(auth)` help organize screens without changing the URL path semantics.

Implemented route files:
- `app/_layout.tsx`: root navigation container and global providers.
- `app/index.tsx`: startup gatekeeper screen that decides where to send the user.
- `app/(onboarding)/welcome.tsx`: welcome / entry into onboarding.
- `app/(onboarding)/permissions.tsx`: camera permission request flow.
- `app/(onboarding)/link-account.tsx`: membership key entry + validation with backend.
- `app/(auth)/home.tsx`: post-link home screen, shows system status and scan action.
- `app/(auth)/scan.tsx`: camera screen + QR scan processing.
- `app/(auth)/result.tsx`: PIN display and countdown, copy-to-clipboard.

Important detail: the documentation in `docs/` describes a `src/app/` structure, but the actual running screens are at repository-root `app/`. Expo Router supports root `app/`, so this works correctly, but it is a mismatch versus the plan and will matter if someone follows the docs literally.

### `src/` (reusable code shared by screens)
`src/` contains the reusable building blocks the screens depend on:
- `src/components/`: UI widgets (Button, SafeView, QR camera view).
- `src/constants/`: configuration values (API URLs, timeouts, theme colors).
- `src/services/`: integrations with external systems (HTTP API, secure storage).
- `src/stores/`: global app state (Zustand store for auth state).
- `src/types/`: TypeScript types describing API responses and domain objects.
- `src/utils/`: small helper functions (QR token extraction, formatting, input normalization).

### `docs/` (the planned specification and build guides)
The `docs/` folder is a full specification set. It includes detailed plans for features that are not implemented yet (history, settings, biometrics, push notifications, tests, deployment pipeline).

### `code/file.html` (an implementation guide artifact, not used by the app)
`code/file.html` is a static HTML “implementation guide” that contains sample code blocks and UI diagrams. It is not executed by the Expo app and does not affect runtime behavior. Think of it as a reference document.

### `_expo_tmp/` (template leftovers)
`_expo_tmp/` looks like a snapshot of the Expo template that was used to bootstrap. It is not referenced by the runtime code. Keeping it increases maintenance noise because it duplicates `package.json` and `README.md` in a second location.

## How navigation works (screen routing, protection, and startup behavior)

### Root navigation container
File: `app/_layout.tsx`
- Wraps the app in `SafeAreaProvider` (needed for correct safe-area insets on iOS/Android).
- Uses an Expo Router `Stack` with `headerShown: false` globally.

What this means in plain language:
- “Stack navigation” is like a browser history: you push screens and can go back.
- Hiding headers at the root means each group can decide its own header style.

### Startup decision (“where do I send this user?”)
File: `app/index.tsx`
This screen is the gatekeeper that runs when the app starts. It does three key things:
1. Calls `hydrate()` from the auth store to load previously saved login/link data from secure storage.
2. Shows a loading spinner until hydration completes.
3. Redirects based on saved state:
   - If `authKey` exists and onboarding is marked complete → sends the user to `/(auth)/home`.
   - Otherwise → sends the user to `/(onboarding)/welcome`.

This design avoids a common bug: showing the wrong screen briefly (“flash of unauthenticated screen”) before storage loads.

Code references:
- Startup redirect logic: `app/index.tsx`
- Persistent storage hydration: `src/stores/authStore.ts`

### Route protection for authenticated screens
File: `app/(auth)/_layout.tsx`
This layout runs whenever you’re inside the `(auth)` route group. It checks:
- `authKey` exists
- `onboardingComplete` is true

If either fails, it redirects back to onboarding. This is the “bouncer at the door” for protected screens.

Important behavior detail:
- This protection does not explicitly check `isHydrated`. The current app relies on `app/index.tsx` being the entry point that waits for hydration first.
- If a deep link opens directly to an authenticated route before hydration, the layout might redirect to onboarding momentarily because `authKey` starts as `null`. Whether that matters depends on how deep linking is used in production.

## Global state and persistence (what is stored, where, and why)

### Authentication store (“single source of truth”)
File: `src/stores/authStore.ts`
This project uses Zustand, a lightweight global state library. The store contains:
- `authKey`: the membership key the user links with.
- `user`: basic profile info returned by the backend after key validation.
- `onboardingComplete`: whether the app considers the user fully linked.
- `isHydrated`: whether stored values have been loaded into memory.

Core operations:
- `hydrate()`: loads three values from secure storage in parallel:
  - `USER_AUTH_KEY`
  - `ONBOARDING_COMPLETE`
  - `USER_INFO`
- `setAuthKey()`: saves key to secure storage and updates state.
- `setUser()`: updates state; if non-null, saves JSON to secure storage; if null, deletes.
- `setOnboardingComplete()`: stores `"true"`/`"false"` string.
- `clear()`: deletes all auth-related keys and resets state.

Plain-language explanation:
- Think of the store as the app’s “memory.”
- Secure storage is like a small safe on the device: it keeps the membership key between app launches.
- `hydrate()` is the moment where the app reads the safe and puts the values back into memory.

### Secure storage wrapper
File: `src/services/storage/secureStorage.ts`
This is a thin wrapper around `expo-secure-store`. It standardizes:
- `setSecureItem(key, value)`
- `getSecureItem(key)`
- `deleteSecureItem(key)`

Security note:
- `expo-secure-store` stores values encrypted in the platform’s secure system (Keychain on iOS, Keystore-backed storage on Android where available).
- This is appropriate for the membership key, because losing it could allow someone else to generate valid PINs.

## Networking and API integration (how the app talks to the backend)

### API configuration
File: `src/constants/config.ts`
Configuration includes:
- `BASE_URL`: defaults to `http://localhost:8000` unless overridden by `EXPO_PUBLIC_API_BASE_URL`.
- `TIMEOUT_MS`: defaults to 30000ms unless overridden by `EXPO_PUBLIC_API_TIMEOUT`.
- `ENDPOINTS`: concrete routes:
  - `/api/auth/qr/scan`
  - `/api/auth/validate-key`
  - `/api/system/status`

Additional behavior implemented in code:
- `USE_MOCK_API`: feature flag via `EXPO_PUBLIC_USE_MOCK_API === "true"`.
- `MOCK_DELAY_MS`: optional delay for mock responses via `EXPO_PUBLIC_MOCK_DELAY_MS`.

Why “EXPO_PUBLIC_” matters:
- Expo only exposes environment variables to the app bundle if they are prefixed with `EXPO_PUBLIC_`.

### Axios client and error handling
File: `src/services/api/client.ts`
The Axios instance is configured with:
- base URL (server address)
- timeout
- JSON headers

Response error behavior:
- If the server returns a response with an error body, the client tries to extract `detail` or `error`, otherwise it reports `"Server error"`.
- If the request was made but no response was received, it reports a user-friendly network message.
- If something else fails, it reports `"Request failed"`.

Mock mode behavior at network layer:
- When `USE_MOCK_API` is enabled, a request interceptor rejects any outbound network calls with the message “Mock API is enabled. Network requests are disabled.”
- This makes mock mode deterministic: you can’t accidentally hit a real backend while thinking you’re testing mock behavior.

Practical implication:
- All code that intends to work in mock mode must not call `apiClient` directly; it must return mock results before reaching Axios.

### Auth API service
File: `src/services/api/auth.ts`
This module exposes two operations used by screens:

1) `validateKey(authKey)`
- Used during onboarding to confirm a membership key is valid.
- In non-mock mode: POSTs `{ auth_key }` to `/api/auth/validate-key` and returns backend response.
- In mock mode: waits a small delay and returns either:
  - invalid with `USER_NOT_FOUND` if the string includes `"bad"` (case-insensitive), or
  - valid with a demo user object.

2) `scanQRCode(qrToken, userAuthKey)`
- Used after scanning a QR to request a one-time PIN.
- In non-mock mode: POSTs `{ qr_token, user_auth_key }` to `/api/auth/qr/scan`.
- In mock mode: waits a delay then returns:
  - `QR_EXPIRED` if token contains `"expired"`
  - `QR_ALREADY_USED` if token contains `"used"`
  - `SYSTEM_CLOSED` if token contains `"closed"`
  - otherwise a success response with a random 6-digit PIN.

Input validation inside the service:
- The service checks for obviously invalid inputs (very short, empty, extremely long).
- When invalid, it returns a structured failure response instead of throwing.

Why that matters:
- Returning structured failures keeps the UI logic consistent: screens can show a friendly alert without crashing.
- It also prevents unnecessary network calls for inputs that will never succeed.

### System API service
File: `src/services/api/system.ts`
`getStatus()`:
- In non-mock mode: GETs `/api/system/status`.
- In mock mode: returns a stable “open” status after a delay.

How the status is used:
- `app/(auth)/home.tsx` calls `getStatus()` on screen load and on pull-to-refresh to show whether the authentication system is open.

## End-to-end user flows (what happens from the user’s perspective, mapped to code)

### Flow A — First-time onboarding from a fresh install

1) App starts → `app/index.tsx`
- `useAuthStore().hydrate()` runs.
- Since storage is empty on first install:
  - `authKey` becomes `null`
  - `onboardingComplete` becomes `false`
- The app redirects to onboarding welcome.

2) Welcome screen → `app/(onboarding)/welcome.tsx`
- User sees branding and a “Get Started” button.
- “Get Started” navigates to `/(onboarding)/permissions`.
- There is also “Link Account” as a shortcut to linking without viewing permission explanation.

3) Permission request → `app/(onboarding)/permissions.tsx`
- Uses `useCameraPermissions()` from `expo-camera`.
- If permission is already granted, it automatically forwards to `/(onboarding)/link-account`.
- If not granted:
  - “Continue” triggers the permission request.
  - If denied, an alert explains that camera access is required to scan QR codes.
  - “Not now” skips to linking.

Important design detail:
- The app can continue without camera permission at this moment, because linking does not require scanning in the current implementation.
- Camera permission is requested again later if the user goes to scan.

4) Link account → `app/(onboarding)/link-account.tsx`
- User enters a membership key.
- The input is normalized via `normalizeAuthKey()` (currently trims and removes whitespace).
- “Continue” triggers:
  - `authApi.validateKey(normalizedKey)`
  - If valid and includes a `user` object:
    - store key in secure storage (`setAuthKey`)
    - set onboarding complete (`setOnboardingComplete(true)`)
    - store user profile (`setUser`)
    - navigate to `/(auth)/home`
  - If invalid:
    - shows an alert with `result.error` or a generic message

Code references:
- Screen logic: `app/(onboarding)/link-account.tsx`
- Normalization: `src/utils/validation.ts`
- Backend call: `src/services/api/auth.ts`
- Persistence: `src/stores/authStore.ts` + `src/services/storage/secureStorage.ts`

User-impact notes:
- The placeholder shows `xxxx-xxxx-xxxx-xxxx`, but normalization does not remove hyphens; if the real keys include hyphens, the backend must accept them or linking may fail.

### Flow B — Returning user opens the app (already linked)

1) App starts → `app/index.tsx`
- `hydrate()` loads previously stored values.
- If `authKey` and `onboardingComplete` are present:
  - app redirects to `/(auth)/home`.

2) Auth route protection → `app/(auth)/_layout.tsx`
- Confirms the user is allowed to be in authenticated routes.
- Provides a visible header style for the `(auth)` stack.

### Flow C — Scan QR and receive PIN

1) Home screen → `app/(auth)/home.tsx`
- On mount, calls `systemApi.getStatus()`:
  - Shows “Open/Closed/Unknown” based on response or error.
- User taps “Scan QR” → navigates to `/(auth)/scan`.

2) Scanner screen → `app/(auth)/scan.tsx`
- Provides the container UI, header text, and loading overlay.
- Renders `QRCameraView` and passes:
  - `onScan` handler
  - `onCancel` handler
  - `disabled` while loading

3) Camera behavior → `src/components/scanner/QRCameraView.tsx`
- If permission isn’t granted:
  - Shows a permission explanation and a “Grant Permission” button.
- If permission is granted:
  - Displays `CameraView` configured to scan only QR codes.
  - Uses “scanned” state to prevent duplicate scan events.
  - Uses haptics (vibration feedback) when a QR code is detected.
  - Offers Flash toggle and Cancel.

4) QR token extraction → `src/utils/qr.ts`
When a QR code is scanned, its `data` might be:
- a raw token string, or
- a URL that contains a query parameter like `qr_token=...` or `token=...`

The extractor:
- tries to parse data as a URL and read `qr_token`/`token` query param
- if not a URL, checks for a “looks like token” pattern of hex + dashes

If extraction fails:
- `scan.tsx` shows “Invalid QR”.

5) PIN request → `src/services/api/auth.ts`
`scan.tsx` calls `authApi.scanQRCode(qrToken, authKey)`:
- In real API mode:
  - backend returns success with PIN and metadata, or failure with an error code.
- In mock mode:
  - returns a random PIN unless token includes certain trigger words.

6) Result display → `app/(auth)/result.tsx`
- Reads route parameters:
  - `pin`
  - `expiresIn`
  - `serviceName`
- Starts a 1-second interval countdown.
- Shows “Expired” after timer hits 0.
- Copy button:
  - copies PIN to clipboard
  - triggers success haptic
  - shows “Copied” alert
- “Back to Home” replaces the route to avoid stacking multiple screens.

User-facing behavior:
- The PIN is shown as a single string; it is not visually split into 6 separate boxes as in the UI spec.

### Flow D — Sign out / unlink

From `app/(auth)/home.tsx`:
- “Sign out” calls `useAuthStore().clear()`
- This clears secure storage and resets state to unauthenticated.
- The `(auth)` layout will then redirect to onboarding because `authKey` becomes null.

## Features currently implemented (what is working end-to-end)

### Linking / membership key validation
Working path:
- user enters key → API validation → secure storage persists key and user → app routes into authenticated area.

Why it is successful:
- state is persisted securely
- startup waits for hydration before routing
- errors are handled with alerts instead of crashes

### QR scanning with camera permissions and debouncing
Working path:
- permission gating both in onboarding and inside scanner component
- QR detection uses camera barcode scanning restricted to QR type
- duplicate scans are throttled by local state
- haptic feedback gives the user immediate confirmation of detection

### PIN display with expiry countdown and copy-to-clipboard
Working path:
- screen can be opened from scan success results
- timer shows expiry
- copy action is implemented and includes haptic feedback

### System status check
Working path:
- home screen checks `/api/system/status` and displays open/closed message
- refresh control triggers re-check

### Mock API mode for local development
Working path:
- controlled via `EXPO_PUBLIC_USE_MOCK_API`
- provides predictable responses for onboarding, system status, and scanning
- network requests are blocked to avoid mixing real and mock behavior

## Planned features and structures that are not implemented yet (based on `docs/`)

The documentation describes a larger feature set than what exists in code. These gaps matter because they affect user expectations and production readiness.

### Screens not present in `app/(auth)/`
Planned in `docs/01_PROJECT_STRUCTURE.md` and UI specs:
- History screen (`history.tsx`) with recent activity list.
- Settings screen (`settings.tsx`) including toggles like biometric lock.

Current situation:
- The `(auth)` group contains only `home`, `scan`, and `result`.
- There is no bottom tab navigation (“Home / Scan / History / Settings”) shown in UI spec diagrams.

### Components not present in `src/components/`
The spec includes a large component system (Card, Header, LoadingSpinner, pin components, history list, settings rows). Only these exist today:
- `Button`
- `SafeView`
- `QRCameraView`

### Hooks layer not implemented
The spec proposes custom hooks (`useAuth`, `useQRScanner`, `useBiometric`, etc.). The current code calls store and services directly inside screens/components.

What that means:
- The app is still maintainable at this size.
- As features grow (history, settings, biometrics), the lack of hooks may lead to duplicated logic across screens unless refactored later.

### Testing framework not implemented
Docs specify Jest + React Native Testing Library + Detox with a full `__tests__/` structure.

Current situation:
- There is no `__tests__/` directory.
- `package.json` contains `typecheck` but no `test` script.

### Deployment pipeline not implemented
Docs reference:
- `eas.json` configuration for EAS builds and environment variables.
- asset files (icons, splash images) under `src/assets/`.

Current situation:
- No `eas.json`.
- No `src/assets/` directory.
- `app.json` includes only camera-related config and basic identifiers.

### Biometrics and push notifications not implemented
Docs mention:
- `expo-local-authentication` for app unlock.
- `expo-notifications` for login alerts.

Current situation:
- These modules are not present in dependencies or code.
- There are no settings toggles or flows.

## Architecture evaluation (strengths, weaknesses, and structural fit for future growth)

### Layering and separation of concerns
Current layers are clear and mostly clean:
- Screens (`app/`) focus on user interactions and navigation.
- Reusable UI (`src/components/`) is shared.
- API integration (`src/services/api/`) is isolated.
- Persistent state (`src/stores/`) is isolated.
- Helper logic (`src/utils/`) is isolated.

Why this is structurally strong:
- It keeps “what the user sees” separate from “how the app talks to the server.”
- It makes it easier to test and refactor because responsibilities are not mixed everywhere.

Where the separation is weaker:
- Business logic lives inside screens (ex: link flow and scan flow). In a larger app, this usually moves into a dedicated hook or controller layer so screens stay simple.

### Security posture
Good practices already present:
- Membership key and user info are stored using secure storage.
- Sign-out clears stored secrets.

Security and privacy gaps to be aware of:
- The API client does not enforce HTTPS; it trusts whatever `BASE_URL` is configured. In production, HTTPS should be mandatory.
- There is no certificate pinning (docs mark it optional).
- There is no mechanism to automatically lock the app after inactivity (planned in docs).
- Error handling shows raw error strings or codes (example: `QR_EXPIRED`) directly in alerts; that can confuse users and can leak internal codes.

### Reliability and user experience under failures
What works:
- Network failures become readable messages (“Network error…”).
- Loading state on scan avoids duplicate requests.

What is missing for a production-level experience:
- No retry strategy for temporary backend errors.
- No explicit “system closed” gating on the home screen (it shows closed but still allows scanning).
- No offline-aware UI state (e.g., show “you are offline” instead of “unknown”).

### Maintainability and consistency
Positive:
- TypeScript types exist for API responses (`src/types/api.ts`).
- Imports use a consistent alias scheme (`@/`).

Risks:
- The repository contains both a real `package.json` and an additional one under `_expo_tmp/`, which can confuse maintainers.
- The root `README.md` is still the Expo template and does not describe this app’s actual behavior or setup requirements.
- The docs describe a broader path-alias map than `tsconfig.json` currently provides. The code uses only `@/`, so it works, but the mismatch can confuse contributors.

## Detailed file-by-file implementation notes

### Screen files
- `app/index.tsx`
  - Strength: hydration gate prevents incorrect routing.
  - Risk: if `hydrate()` throws, the UI will remain loading; there is no error fallback screen.
- `app/(onboarding)/permissions.tsx`
  - Strength: permission explanation is clear; auto-forward if already granted.
  - Note: camera permission is also handled again inside the scanner component, which is good redundancy.
- `app/(onboarding)/link-account.tsx`
  - Strength: validates input presence and handles API success/failure.
  - Gap: normalization does not remove hyphens; real membership key formatting must match backend expectations.
  - Gap: user-facing error messages are not mapped; backend codes can appear directly.
- `app/(auth)/home.tsx`
  - Strength: system status is fetched and refreshable.
  - Gap: system status does not change app behavior (scan is always enabled).
- `app/(auth)/scan.tsx`
  - Strength: validates QR token extraction and authKey presence before calling API.
  - Strength: loading overlay prevents repeated scans.
  - Gap: error messages for failed scan show raw error string.
- `app/(auth)/result.tsx`
  - Strength: countdown and copy-to-clipboard work, includes haptics.
  - Gap: no visual “success” state and no progress bar as in UI spec.

### Component files
- `src/components/scanner/QRCameraView.tsx`
  - Strength: handles permission gating, QR-only scanning, debouncing, flash toggle.
  - Note: the flash button label logic reads `"Flash On"` when `flashOn` is true; many apps label the button by the action (“Turn Flash Off”), but current behavior is not functionally wrong.
- `src/components/common/Button.tsx`
  - Strength: clean, reusable; supports variants and disabled/loading.
- `src/components/common/SafeView.tsx`
  - Strength: consistent safe area wrapper.
  - Note: styles are always passed from screens; SafeView does not impose default padding or flex behavior.

### Services and utilities
- `src/services/api/client.ts`
  - Strength: centralized error normalization into readable errors.
  - Note: no request logging (docs include optional logging).
- `src/services/api/auth.ts`
  - Strength: typed responses and mock mode support.
  - Note: validation is intentionally “lightweight” (length checks); real key/token validation rules should be aligned with backend specs.
- `src/utils/qr.ts`
  - Strength: supports both URL-based QR content and raw tokens.
  - Note: the raw token regex requires 20+ hex/dash characters; if backend tokens differ, this may reject valid values.
- `src/utils/formatting.ts`
  - Current behavior: strips non-digits and returns digits as-is.
  - UI spec behavior: shows each digit separately; not implemented here.

## Planned behavior vs current behavior (direct comparisons)

### Onboarding
Planned:
- optional “scan linking QR from admin portal”
- biometric setup screen

Current:
- key entry only; no linking QR scan path
- no biometric setup

### Home and navigation
Planned:
- bottom navigation with tabs for Home, Scan, History, Settings
- recent activity list on home

Current:
- single home page with system status card and scan button
- no history list and no tab navigation

### Scanner and result
Planned:
- dedicated overlay component, flash button styling, richer success screen, progress bar timer

Current:
- functional overlay frame implemented directly in component
- success screen is minimal (title + PIN + timer + copy)

### Error messaging
Planned:
- mapping error codes like `QR_EXPIRED` to user-friendly text

Current:
- raw codes are shown in alerts in some cases

## Build configuration and development ergonomics

### Dependencies and scripts
File: `package.json`
- `web`, `ios`, `android`, `start` scripts exist.
- `typecheck` exists and passes.
- No `lint` script and no `test` script.

### TypeScript and module aliasing
Files: `tsconfig.json`, `babel.config.js`
- Alias `@/* → src/*` is configured for both TypeScript and Babel.
- Current code uses `@/` imports consistently.

### Expo configuration
File: `app.json`
- Contains camera usage descriptions for iOS and camera permissions for Android.
- Contains `expo-router` plugin and `expo-secure-store` plugin.

Missing compared to docs:
- asset configuration (icons/splash)
- biometrics permissions
- deployment (`eas.json`) and environment wiring

## Items that are “successful” but still fragile (where edge cases can break)

### Hydration + auth guarding interactions
Current approach is fine when startup always begins at `app/index.tsx`.
Fragility appears if:
- deep links open directly into authenticated routes before hydration
- future code introduces an alternative entry path that doesn’t wait for hydration

### Membership key normalization
If real membership keys include separators (hyphens) or mixed casing rules, the current normalization might reject or mis-format keys, causing false “invalid key” errors.

### Error code display to user
Showing `QR_EXPIRED` is useful for developers but confusing for end users. This will feel “broken” even when the system is behaving correctly.

## Environment variables used by this project (current implementation)

Supported variables:
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_TIMEOUT`
- `EXPO_PUBLIC_USE_MOCK_API`
- `EXPO_PUBLIC_MOCK_DELAY_MS`

Where they are read:
- `src/constants/config.ts`

## Concrete improvement opportunities (what to change to match the project plan)

The codebase is currently at a “core demo + functional MVP flow” level. These changes would align it with the provided documentation:
- Implement History and Settings screens and introduce tab navigation consistent with UI specs.
- Add a user-friendly error message mapping layer (turn codes into plain English).
- Add scan history persistence and display it on home/history screens.
- Add biometric lock and app unlock flow (including a setting toggle).
- Add tests and CI-friendly scripts (`test`, `lint`) consistent with the testing strategy doc.
- Add deployment configuration (`eas.json`) and environment templates if production deployment is required.

