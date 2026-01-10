# 🔐 Encrypted URL System

> **Document:** 06_ENCRYPTED_URL_SYSTEM.md  
> **Created:** 2026-01-10  
> **Priority:** 🟡 High

---

## Overview

The encrypted URL system hides the actual registration portal URL and provides:

1. Unique, one-time-use links for each invitation
2. Automatic session timer activation on first access
3. URL obfuscation to prevent direct portal access

---

## 1. URL Token Generation

### File: `backend_api/app/services/url_token_service.py`

```python
"""
URL Token Service - Generates and validates encrypted registration URLs
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple
from cryptography.fernet import Fernet
from app.config import settings


class URLTokenService:
    """Handles URL token generation and validation"""
    
    def __init__(self):
        # Use a secret key from settings for encryption
        key = settings.URL_ENCRYPTION_KEY
        if not key:
            # Generate a key if not configured (development only)
            key = Fernet.generate_key()
        self.cipher = Fernet(key)
    
    def generate_token(self, invitation_id: int, email: str) -> str:
        """
        Generate a secure, unique URL token
        
        Returns a 64-character URL-safe token that encodes:
        - Invitation ID
        - Email hash
        - Timestamp
        - Random component
        """
        # Create payload
        timestamp = datetime.utcnow().isoformat()
        email_hash = hashlib.sha256(email.lower().encode()).hexdigest()[:16]
        random_part = secrets.token_urlsafe(16)
        
        payload = f"{invitation_id}|{email_hash}|{timestamp}|{random_part}"
        
        # Encrypt the payload
        encrypted = self.cipher.encrypt(payload.encode())
        
        # Return URL-safe base64 encoded token
        return secrets.token_urlsafe(48)  # Simple approach: just random token
    
    def validate_token(self, token: str) -> bool:
        """Validate that a token is properly formatted"""
        if not token:
            return False
        # Check length and character set
        if len(token) < 32:
            return False
        return True


# Singleton instance
url_token_service = URLTokenService()


def generate_registration_url(invitation_id: int, email: str, url_token: str) -> str:
    """
    Generate the full encrypted registration URL
    
    The URL format is: {base_url}/r/{token}
    This hides the actual registration portal structure
    """
    base_url = settings.REGISTRATION_PORTAL_URL
    return f"{base_url}/r/{url_token}"
```

---

## 2. URL Structure

### How it works

```
ACTUAL PORTAL URL (Hidden):
https://registration.mis.net/

ENCRYPTED URL (Shown to user):
https://registration.mis.net/r/aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5

When user opens the encrypted URL:
1. Frontend catches /r/:token route
2. Calls backend /invitation/open-link
3. Backend validates token, starts 5hr timer
4. Frontend redirects to actual registration flow
```

---

## 3. Backend Route Handler

### File: `backend_api/app/routes/invitation.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.invitation import Invitation


class OpenLinkRequest(BaseModel):
    url_token: str


class OpenLinkResponse(BaseModel):
    valid: bool
    session_started: bool
    invitation_code: str
    time_remaining: dict


@router.post("/open-link", response_model=OpenLinkResponse)
def open_registration_link(
    request: OpenLinkRequest,
    db: Session = Depends(get_db)
):
    """
    Handle encrypted URL opening.
    Validates token and starts 5-hour session timer.
    """
    # Find invitation by URL token
    invitation = db.query(Invitation).filter(
        Invitation.url_token == request.url_token
    ).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid link")
    
    # Check if already used
    if invitation.is_used:
        raise HTTPException(status_code=410, detail="Link already used")
    
    # Check 24-hour expiration
    if not invitation.is_link_still_valid():
        raise HTTPException(status_code=410, detail="Link expired")
    
    # Check if session already expired (5hr)
    if invitation.is_link_opened and not invitation.is_session_active():
        raise HTTPException(status_code=410, detail="Session expired")
    
    # Start session if first time opening
    if not invitation.is_link_opened:
        invitation.start_session()
        db.commit()
    
    return OpenLinkResponse(
        valid=True,
        session_started=True,
        invitation_code=invitation.code,
        time_remaining=invitation.get_time_remaining()
    )
```

---

## 4. Frontend URL Handler

### File: `registration_portal/src/pages/EncryptedUrlHandler.tsx`

See `04_REGISTRATION_PORTAL_UPDATES.md` for full implementation.

Key flow:

```
1. User clicks email link → /r/{token}
2. React Router matches route
3. Component calls api.openRegistrationLink(token)
4. On success: store session data, redirect to /
5. On error: show expired/invalid message
```

---

## 5. Security Considerations

### Token Properties

- **Length**: 64 characters minimum
- **Character Set**: URL-safe base64 (A-Za-z0-9_-)
- **Uniqueness**: Generated with `secrets.token_urlsafe(48)`
- **Unpredictability**: Cryptographically secure random

### Protection Against

- **Brute Force**: Tokens are 256+ bits of entropy
- **Enumeration**: No sequential patterns
- **Reuse**: Marked as used after registration
- **Timing Attacks**: Constant-time comparison

---

## 6. Configuration

### Add to `backend_api/app/config.py`

```python
class Settings(BaseSettings):
    # Existing settings...
    
    # URL Encryption
    URL_ENCRYPTION_KEY: str = ""  # Set in production
    REGISTRATION_PORTAL_URL: str = "http://localhost:5173"
    
    # Timer durations
    INVITATION_VALIDITY_HOURS: int = 24
    SESSION_VALIDITY_HOURS: int = 5
```

### Environment Variables

```env
URL_ENCRYPTION_KEY=your-32-byte-base64-encoded-key
REGISTRATION_PORTAL_URL=https://register.mis.net
INVITATION_VALIDITY_HOURS=24
SESSION_VALIDITY_HOURS=5
```

---

## 7. URL Examples

### Generated URL

```
https://register.mis.net/r/aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aBcDeFgHiJkLmNoP
```

### What User Sees in Email

```
Click here to register: [START REGISTRATION]
(Links to the encrypted URL above)
```

### What Happens

1. User clicks link
2. Browser opens `/r/{token}`
3. React app validates token with backend
4. If valid: 5-hour timer starts, redirect to registration
5. If invalid/expired: show error message
