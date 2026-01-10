# 📱 Registration Portal Updates

> **Document:** 04_REGISTRATION_PORTAL_UPDATES.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## 1. Handle Encrypted URL Entry

### New Route Handler for `/r/:token`

```tsx
// File: registration_portal/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Encrypted URL entry point */}
        <Route path="/r/:urlToken" element={<EncryptedUrlHandler />} />
        
        {/* Existing routes */}
        <Route path="/" element={<ICVP />} />
        <Route path="/register" element={<RFP />} />
        <Route path="/oath" element={<ATIPP />} />
        <Route path="/complete" element={<ARFSP />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 2. Encrypted URL Handler Component

### File: `registration_portal/src/pages/EncryptedUrlHandler.tsx`

```tsx
/**
 * Handles encrypted registration URLs
 * - Validates the URL token
 * - Starts the 5-hour session timer
 * - Redirects to invitation verification
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const EncryptedUrlHandler: React.FC = () => {
  const { urlToken } = useParams<{ urlToken: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired'>('loading');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!urlToken) {
      setStatus('invalid');
      return;
    }

    const validateAndStartSession = async () => {
      try {
        const result = await api.openRegistrationLink(urlToken);
        
        if (result.success && result.data?.valid) {
          // Store session info
          sessionStorage.setItem('url_token', urlToken);
          sessionStorage.setItem('session_started', 'true');
          sessionStorage.setItem('session_start_time', Date.now().toString());
          
          if (result.data.time_remaining) {
            setTimeRemaining(result.data.time_remaining.session_remaining_formatted);
          }
          
          setStatus('valid');
          
          // Redirect to invitation page after brief delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('expired');
        }
      } catch (error) {
        console.error('Link validation error:', error);
        setStatus('invalid');
      }
    };

    validateAndStartSession();
  }, [urlToken, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#d9d9d9] flex items-center justify-center">
        <div className="bg-white p-8 border-4 border-[#28282B] text-center">
          <div className="w-16 h-16 border-4 border-[#28282B] border-t-transparent 
                          animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold">Validating your registration link...</h2>
          <p className="text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-[#d9d9d9] flex items-center justify-center">
        <div className="bg-white p-8 border-4 border-red-500 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-700">Link Expired</h2>
          <p className="text-gray-600 mt-2">
            This registration link has expired. Please contact support or request a new invitation.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#d9d9d9] flex items-center justify-center">
        <div className="bg-white p-8 border-4 border-red-500 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-700">Invalid Link</h2>
          <p className="text-gray-600 mt-2">
            This registration link is invalid. Please check your invitation email and try again.
          </p>
        </div>
      </div>
    );
  }

  // Valid - showing success before redirect
  return (
    <div className="min-h-screen bg-[#d9d9d9] flex items-center justify-center">
      <div className="bg-white p-8 border-4 border-green-500 text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-700">Link Verified!</h2>
        <p className="text-gray-600 mt-2">
          Your registration session has started. You have <strong>5 hours</strong> to complete.
        </p>
        <p className="text-sm text-gray-500 mt-4">Redirecting to registration...</p>
      </div>
    </div>
  );
};
```

---

## 3. Updated ICVP (Invitation Verification)

### Add support for 6-digit PIN and 15-char code

```tsx
// File: registration_portal/src/pages/ICVP.tsx

// Update PIN validation
const [pin, setPin] = useState('');

// Update PIN input (6 digits instead of 4)
<input
  type="password"
  value={pin}
  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
  placeholder="6-digit PIN"
  maxLength={6}
  className="..."
/>

// Update code validation regex
const codeRegex = /^[a-z0-9]{15}$/i;  // 15 alphanumeric chars
```

---

## 4. Session Timer Hook Update

### File: `registration_portal/src/hooks/useRegistrationSession.ts`

```tsx
import { useState, useEffect } from 'react';

interface SessionData {
  urlToken: string;
  sessionStartTime: number;
  invitationCode: string;
  invitationId: number;
}

export const useRegistrationSession = () => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  const SESSION_DURATION = 5 * 60 * 60; // 5 hours in seconds

  useEffect(() => {
    // Load session from storage
    const sessionStarted = sessionStorage.getItem('session_started');
    const sessionStartTime = sessionStorage.getItem('session_start_time');
    const urlToken = sessionStorage.getItem('url_token');
    
    if (sessionStarted && sessionStartTime) {
      const startTime = parseInt(sessionStartTime);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, SESSION_DURATION - elapsed);
      
      setSession({
        urlToken: urlToken || '',
        sessionStartTime: startTime,
        invitationCode: sessionStorage.getItem('invitation_code') || '',
        invitationId: parseInt(sessionStorage.getItem('invitation_id') || '0'),
      });
      
      setTimeRemaining(remaining);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Session expired - handle appropriately
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining > 0]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeRemaining <= 0 && session !== null;

  return {
    session,
    timeRemaining,
    formatTime,
    isExpired,
  };
};
```

---

## 5. API Service Updates

### Add to `registration_portal/src/services/api.ts`

```typescript
/**
 * Open registration link and start session timer
 */
async openRegistrationLink(urlToken: string): Promise<ApiResponse<{
  valid: boolean;
  session_started: boolean;
  time_remaining: {
    link_remaining_seconds: number;
    session_remaining_seconds: number;
    link_remaining_formatted: string;
    session_remaining_formatted: string;
  };
}>> {
  try {
    const response = await apiClient.post('/invitation/open-link', { url_token: urlToken });
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 6. Updated Types

### Add to `registration_portal/src/types/index.ts`

```typescript
export interface InvitationVerifyRequest {
  invitation_code: string;  // 15 chars
  pin: string;              // 6 digits
}

export interface SessionTimeRemaining {
  link_remaining_seconds: number;
  session_remaining_seconds: number;
  link_remaining_formatted: string;
  session_remaining_formatted: string;
}
```

---

## 7. Session Expiry Handling

### File: `registration_portal/src/components/SessionExpiryGuard.tsx`

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationSession } from '../hooks';

export const SessionExpiryGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isExpired, timeRemaining, formatTime } = useRegistrationSession();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#d9d9d9] flex items-center justify-center p-4">
        <div className="bg-white p-8 border-4 border-red-500 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Session Expired</h2>
          <p className="text-gray-600 mb-6">
            Your 5-hour registration session has expired. Please request a new invitation.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate('/');
            }}
            className="px-6 py-2 bg-[#28282B] text-white rounded"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Show warning when less than 30 minutes remain
  const showWarning = timeRemaining > 0 && timeRemaining < 1800;

  return (
    <>
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
          ⚠️ Session expiring in {formatTime(timeRemaining)} - Complete your registration!
        </div>
      )}
      {children}
    </>
  );
};
```
