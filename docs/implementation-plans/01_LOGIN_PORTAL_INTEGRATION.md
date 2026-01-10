# 🔌 Login Portal Backend Integration Plan

> **Document ID:** PLAN-01  
> **Priority:** 🔴 Critical  
> **Phase:** 1  
> **Estimated Effort:** 3-5 days  
> **Dependencies:** Backend API must be running

---

## 📋 Overview

The MIS Login Portal (`login_portal/MIS_Login-Portal`) currently has a complete Angular UI but is **not connected** to the backend API. This plan details the steps to fully integrate the portal with the backend authentication system.

### Current State

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT: Login Portal (Disconnected)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QR Generation ──────► External API (qrserver.com) ❌           │
│                                                                  │
│  PIN Verification ───► Hardcoded "123456" ❌                    │
│                                                                  │
│  Session Management ─► Simple signal (no JWT) ❌                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Target State

```
┌─────────────────────────────────────────────────────────────────┐
│  TARGET: Login Portal (Fully Integrated)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QR Generation ──────► POST /api/auth/qr/generate ✅            │
│                                                                  │
│  PIN Verification ───► POST /api/auth/pin/verify ✅             │
│                                                                  │
│  Session Management ─► JWT token storage & validation ✅        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Objectives

1. Create Angular HTTP service for API communication
2. Replace external QR API with backend `/api/auth/qr/generate`
3. Replace hardcoded PIN logic with `/api/auth/pin/verify`
4. Implement JWT token storage and session management
5. Add proper error handling for API failures
6. Maintain existing UI/UX while adding real functionality

---

## 📁 Files to Create/Modify

### New Files to Create

| File | Purpose |
|------|---------|
| `src/services/api.service.ts` | HTTP client for backend API |
| `src/services/auth.service.ts` | Authentication logic service |
| `src/services/session.service.ts` | JWT token management |
| `src/models/auth.models.ts` | TypeScript interfaces for API |
| `src/environments/environment.ts` | Environment configuration |
| `src/environments/environment.prod.ts` | Production configuration |

### Files to Modify

| File | Changes |
|------|---------|
| `src/app.component.ts` | Replace demo logic with service calls |
| `src/app.component.html` | Update to show loading states properly |
| `angular.json` | Add environment file references |

---

## 🛠️ Implementation Steps

### Step 1: Create Environment Configuration

**File:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000',
  serviceId: 1,  // Your registered service ID
  serviceApiKey: 'your-api-key-here',  // From backend registration
  qrCodeExpirySeconds: 300,
  pinExpirySeconds: 120
};
```

**File:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com',
  serviceId: 1,
  serviceApiKey: 'production-api-key',
  qrCodeExpirySeconds: 300,
  pinExpirySeconds: 120
};
```

### Step 2: Create TypeScript Models

**File:** `src/models/auth.models.ts`

```typescript
// QR Generation
export interface QRGenerateRequest {
  service_id: number;
  service_api_key: string;
}

export interface QRGenerateResponse {
  qr_token: string;
  qr_image: string;  // Base64 encoded image
  expires_in_seconds: number;
}

// PIN Verification
export interface PINVerifyRequest {
  qr_token: string;
  pin: string;
}

export interface PINVerifyResponse {
  success: boolean;
  session_token: string;
  user_info: {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
  };
  expires_in_seconds: number;
}

// Session Validation
export interface SessionValidateResponse {
  valid: boolean;
  user_id: number;
  username: string;
  expires_at: string;
}

// API Error
export interface APIError {
  detail: string;
  status_code?: number;
}
```

### Step 3: Create API Service

**File:** `src/services/api.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;
  private timeoutMs = 30000;

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body).pipe(
      timeout(this.timeoutMs),
      catchError(this.handleError)
    );
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`).pipe(
      timeout(this.timeoutMs),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.detail || `Server error: ${error.status}`;
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

### Step 4: Create Authentication Service

**File:** `src/services/auth.service.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { environment } from '../environments/environment';
import { 
  QRGenerateRequest, 
  QRGenerateResponse, 
  PINVerifyRequest, 
  PINVerifyResponse 
} from '../models/auth.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private session = inject(SessionService);

  // State signals
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _qrData = signal<QRGenerateResponse | null>(null);
  private _qrExpiresAt = signal<Date | null>(null);

  // Public computed signals
  isLoading = this._isLoading.asReadonly();
  error = this._error.asReadonly();
  qrImage = computed(() => this._qrData()?.qr_image || null);
  qrToken = computed(() => this._qrData()?.qr_token || null);
  qrExpiresAt = this._qrExpiresAt.asReadonly();
  isLoggedIn = this.session.isLoggedIn;
  currentUser = this.session.currentUser;

  /**
   * Generate a new QR code for login
   */
  async generateQRCode(): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const request: QRGenerateRequest = {
        service_id: environment.serviceId,
        service_api_key: environment.serviceApiKey
      };

      const response = await firstValueFrom(
        this.api.post<QRGenerateResponse>('/api/auth/qr/generate', request)
      );

      this._qrData.set(response);
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.expires_in_seconds);
      this._qrExpiresAt.set(expiresAt);

      return true;
    } catch (err) {
      this._error.set((err as Error).message);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Verify PIN and complete login
   */
  async verifyPIN(pin: string): Promise<boolean> {
    const qrToken = this._qrData()?.qr_token;
    
    if (!qrToken) {
      this._error.set('No QR code generated. Please generate a new QR code.');
      return false;
    }

    this._isLoading.set(true);
    this._error.set(null);

    try {
      const request: PINVerifyRequest = {
        qr_token: qrToken,
        pin: pin
      };

      const response = await firstValueFrom(
        this.api.post<PINVerifyResponse>('/api/auth/pin/verify', request)
      );

      if (response.success) {
        // Store session
        this.session.setSession(response.session_token, response.user_info);
        
        // Clear QR data
        this._qrData.set(null);
        this._qrExpiresAt.set(null);
        
        return true;
      } else {
        this._error.set('Invalid PIN. Please try again.');
        return false;
      }
    } catch (err) {
      this._error.set((err as Error).message);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    const token = this.session.getToken();
    
    if (token) {
      try {
        await firstValueFrom(
          this.api.post('/api/auth/logout', { token })
        );
      } catch {
        // Ignore logout API errors, still clear local session
      }
    }

    this.session.clearSession();
    this._qrData.set(null);
    this._qrExpiresAt.set(null);
    this._error.set(null);
  }

  /**
   * Clear any error state
   */
  clearError(): void {
    this._error.set(null);
  }
}
```

### Step 5: Create Session Service

**File:** `src/services/session.service.ts`

```typescript
import { Injectable, signal, computed } from '@angular/core';

interface UserInfo {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
}

const TOKEN_KEY = 'mis_session_token';
const USER_KEY = 'mis_user_info';
const EXPIRES_KEY = 'mis_session_expires';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _token = signal<string | null>(this.loadToken());
  private _user = signal<UserInfo | null>(this.loadUser());
  private _expiresAt = signal<Date | null>(this.loadExpiry());

  isLoggedIn = computed(() => {
    const token = this._token();
    const expires = this._expiresAt();
    
    if (!token) return false;
    if (expires && new Date() > expires) {
      this.clearSession();
      return false;
    }
    return true;
  });

  currentUser = this._user.asReadonly();
  token = this._token.asReadonly();

  constructor() {
    // Check session validity on startup
    this.validateSession();
  }

  setSession(token: string, user: UserInfo, expiresInSeconds: number = 1800): void {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_KEY, expiresAt.toISOString());

    // Update signals
    this._token.set(token);
    this._user.set(user);
    this._expiresAt.set(expiresAt);
  }

  getToken(): string | null {
    return this._token();
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);

    this._token.set(null);
    this._user.set(null);
    this._expiresAt.set(null);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): UserInfo | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  private loadExpiry(): Date | null {
    const data = localStorage.getItem(EXPIRES_KEY);
    return data ? new Date(data) : null;
  }

  private validateSession(): void {
    const expires = this._expiresAt();
    if (expires && new Date() > expires) {
      this.clearSession();
    }
  }
}
```

### Step 6: Update AppComponent

**File:** `src/app.component.ts` (Modified sections)

```typescript
import { Component, inject, computed, effect, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // --- State from AuthService ---
  isLoggedIn = this.authService.isLoggedIn;
  isLoading = this.authService.isLoading;
  loginError = this.authService.error;
  currentUser = this.authService.currentUser;
  
  // QR Code state
  qrCodeUrl = this.authService.qrImage;
  qrExpiresAt = this.authService.qrExpiresAt;
  isQrVisible = computed(() => !!this.qrCodeUrl());
  
  // QR expiration countdown
  qrTimeRemaining = computed(() => {
    const expires = this.qrExpiresAt();
    if (!expires) return 0;
    return Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000));
  });

  // Modal state
  showKeyModal = signal(false);
  showSupportModal = signal(false);

  // Countdown interval
  private countdownInterval: any;

  // --- Forms ---
  pinForm: FormGroup = this.fb.group({
    pin: ["", [Validators.required, Validators.pattern("^[0-9]{6}$")]],
  });

  keyForm: FormGroup = this.fb.group({
    key: ["", [Validators.required, Validators.minLength(24), Validators.maxLength(24)]],
    pin: ["", [Validators.required, Validators.pattern("^[0-9]{6}$")]],
  });

  supportForm: FormGroup = this.fb.group({
    message: ["", [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    // Start countdown timer for QR expiration
    this.countdownInterval = setInterval(() => {
      // Force reactivity update for countdown
      if (this.qrExpiresAt() && this.qrTimeRemaining() <= 0) {
        // QR expired, could auto-regenerate or show message
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // --- Actions ---

  async generateQr() {
    await this.authService.generateQRCode();
  }

  async handlePinLogin() {
    if (this.pinForm.invalid) {
      return;
    }

    const pin = this.pinForm.get("pin")?.value;
    const success = await this.authService.verifyPIN(pin);
    
    if (success) {
      this.pinForm.reset();
    } else {
      // Keep the form, just clear the PIN for retry
      this.pinForm.get("pin")?.reset();
    }
  }

  async logout() {
    await this.authService.logout();
    this.pinForm.reset();
    this.keyForm.reset();
  }

  // Modal methods remain the same...
  openKeyModal() {
    this.showKeyModal.set(true);
    this.showSupportModal.set(false);
    this.authService.clearError();
    this.keyForm.reset();
  }

  openSupportModal() {
    this.showSupportModal.set(true);
    this.showKeyModal.set(false);
    this.supportForm.reset();
  }

  closeModals() {
    this.showKeyModal.set(false);
    this.showSupportModal.set(false);
    this.authService.clearError();
  }

  // ... rest of existing methods
}
```

### Step 7: Update Angular Module Configuration

**File:** `angular.json` (Add to configurations)

```json
{
  "projects": {
    "login-page": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] ApiService handles HTTP errors correctly
- [ ] AuthService.generateQRCode() calls correct endpoint
- [ ] AuthService.verifyPIN() sends correct payload
- [ ] SessionService stores/retrieves tokens correctly
- [ ] SessionService detects expired sessions

### Integration Tests

- [ ] QR code displays after generation
- [ ] PIN verification succeeds with valid PIN
- [ ] PIN verification fails with invalid PIN
- [ ] Session persists after page reload
- [ ] Logout clears session and redirects

### E2E Tests

- [ ] Complete login flow works end-to-end
- [ ] Error messages display correctly
- [ ] QR expiration is handled properly
- [ ] Multiple failed attempts are handled

---

## ⚠️ Error Handling

### Expected Errors to Handle

| Error | User Message | Action |
|-------|--------------|--------|
| Network error | "Unable to connect to server. Please check your connection." | Show retry button |
| QR expired | "QR code has expired. Please generate a new one." | Clear QR, enable generate |
| Invalid PIN | "Invalid PIN. Please check and try again." | Clear PIN input, allow retry |
| Session expired | "Your session has expired. Please login again." | Redirect to login |
| Rate limited | "Too many attempts. Please wait a moment." | Disable form, show countdown |
| Service unavailable | "Service is currently unavailable. Please try later." | Show maintenance message |

---

## 📊 Success Metrics

- [ ] QR generation completes in < 2 seconds
- [ ] PIN verification completes in < 1 second
- [ ] Zero hardcoded credentials in production
- [ ] All API calls use the backend, not external services
- [ ] Session persists correctly across page reloads
- [ ] Error messages are user-friendly

---

## 🔗 Related Documents

- [00_MASTER_IMPLEMENTATION_PLAN.md](./00_MASTER_IMPLEMENTATION_PLAN.md)
- [02_BACKEND_SECURITY_HARDENING.md](./02_BACKEND_SECURITY_HARDENING.md)
- [99_IMPLEMENTATION_CHECKLIST.md](./99_IMPLEMENTATION_CHECKLIST.md)

---

## 📝 Notes

1. **CORS Configuration**: Ensure the backend allows requests from the Login Portal origin
2. **Service Registration**: The Login Portal needs to be registered as a service in the backend
3. **API Key Security**: Never expose API keys in client-side code for production - consider using a BFF pattern
4. **Mobile Compatibility**: Ensure the QR code is scannable by the mobile authenticator app
