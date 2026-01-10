# 🔒 Backend Security Hardening Plan

> **Document ID:** PLAN-02  
> **Priority:** 🔴 Critical  
> **Phase:** 1-3  
> **Estimated Effort:** 2-4 days  
> **Dependencies:** None (can start immediately)

---

## 📋 Overview

This document outlines the security improvements required to align the backend API with the security specifications in `login_logic_flow.md` and industry best practices.

### Current Security Gaps

| Gap | Severity | Risk |
|-----|----------|------|
| Simple string PIN comparison | 🔴 Critical | Timing attack vulnerability |
| No failed attempts tracking | 🔴 Critical | Brute force vulnerability |
| No session lockout | 🔴 Critical | Unlimited attack attempts |
| No PIN expiration enforcement | 🟡 High | Extended attack window |
| Missing IP logging | 🟡 High | No audit trail |
| No constant-time comparison | 🔴 Critical | Side-channel attack risk |

---

## 🎯 Security Objectives

1. **Eliminate timing attacks** with constant-time comparisons
2. **Prevent brute force** with attempt limits and lockouts
3. **Reduce attack window** with strict PIN expiration
4. **Enable forensics** with comprehensive logging
5. **Defense in depth** with multiple security layers

---

## 🛠️ Implementation Steps

### Step 1: Constant-Time PIN Comparison (Critical)

**Current Code (Vulnerable):**

```python
# pin_service.py - Line 34
if qr_session.pin != pin:
    raise ValueError("Invalid PIN")
```

**Fixed Code:**

```python
# pin_service.py
import secrets

def verify_pin_securely(stored_pin: str, provided_pin: str) -> bool:
    """
    Constant-time comparison to prevent timing attacks.
    Always compares full length regardless of match position.
    """
    if stored_pin is None or provided_pin is None:
        return False
    
    # Normalize to same length and type
    stored = stored_pin.encode('utf-8')
    provided = provided_pin.encode('utf-8')
    
    return secrets.compare_digest(stored, provided)

def verify_pin_and_create_session(qr_token: str, pin: str, db: Session) -> dict:
    # ... existing code ...
    
    # FIXED: Use constant-time comparison
    if not verify_pin_securely(qr_session.pin, pin):
        # Track failed attempt
        track_failed_attempt(qr_session, db)
        raise ValueError("Invalid PIN")
    
    # ... rest of function ...
```

---

### Step 2: Failed Attempts Tracking

**2.1 Add Database Column**

**File:** `alembic/versions/xxx_add_failed_attempts.py`

```python
"""Add failed attempts tracking

Revision ID: add_failed_attempts
Revises: previous_revision
Create Date: 2026-01-10
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add failed_attempts column to qr_sessions
    op.add_column('qr_sessions', 
        sa.Column('failed_attempts', sa.Integer(), nullable=False, server_default='0')
    )
    
    # Add locked_at column for lockout tracking
    op.add_column('qr_sessions',
        sa.Column('locked_at', sa.DateTime(), nullable=True)
    )
    
    # Add lockout_until column
    op.add_column('qr_sessions',
        sa.Column('lockout_until', sa.DateTime(), nullable=True)
    )

def downgrade():
    op.drop_column('qr_sessions', 'failed_attempts')
    op.drop_column('qr_sessions', 'locked_at')
    op.drop_column('qr_sessions', 'lockout_until')
```

**2.2 Update QRSession Model**

**File:** `app/models/qr_session.py`

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from app.models.base import BaseModel

class QRSession(BaseModel):
    __tablename__ = "qr_sessions"
    
    token = Column(String, unique=True, index=True, nullable=False)
    service_id = Column(Integer, ForeignKey("registered_services.id"), nullable=False)
    
    # When mobile app scans, these get filled
    user_auth_key = Column(String, nullable=True)
    pin = Column(String, nullable=True)
    
    # Status tracking
    is_used = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    scanned_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # NEW: Security tracking
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_at = Column(DateTime, nullable=True)
    lockout_until = Column(DateTime, nullable=True)
    
    # NEW: PIN expiration (separate from QR expiration)
    pin_expires_at = Column(DateTime, nullable=True)
    
    # Constants
    MAX_ATTEMPTS = 3
    LOCKOUT_DURATION_MINUTES = 15
```

**2.3 Update PIN Service**

**File:** `app/services/pin_service.py`

```python
import secrets
from datetime import datetime, timedelta
from app.models.login_history import LoginHistory
from app.models.qr_session import QRSession
from app.models.active_user import ActiveUser
from sqlalchemy.orm import Session
from app.config import settings
from app.core.security import create_access_token
import logging

logger = logging.getLogger(__name__)

# Configuration
MAX_PIN_ATTEMPTS = 3
PIN_EXPIRY_MINUTES = 2
LOCKOUT_DURATION_MINUTES = 15

def verify_pin_securely(stored_pin: str, provided_pin: str) -> bool:
    """Constant-time PIN comparison to prevent timing attacks."""
    if stored_pin is None or provided_pin is None:
        return False
    return secrets.compare_digest(
        stored_pin.encode('utf-8'), 
        provided_pin.encode('utf-8')
    )

def check_session_lockout(qr_session: QRSession) -> None:
    """Check if session is locked out due to failed attempts."""
    if qr_session.lockout_until:
        if datetime.utcnow() < qr_session.lockout_until:
            remaining = (qr_session.lockout_until - datetime.utcnow()).seconds
            raise ValueError(f"Session locked. Try again in {remaining} seconds.")
        else:
            # Lockout expired, reset
            qr_session.lockout_until = None
            qr_session.failed_attempts = 0

def check_pin_expiration(qr_session: QRSession) -> None:
    """Check if PIN has expired (2 minute window)."""
    if qr_session.pin_expires_at:
        if datetime.utcnow() > qr_session.pin_expires_at:
            raise ValueError("PIN has expired. Please scan QR code again.")

def track_failed_attempt(qr_session: QRSession, db: Session) -> None:
    """Track failed PIN attempt and implement lockout if needed."""
    qr_session.failed_attempts += 1
    
    logger.warning(
        f"Failed PIN attempt {qr_session.failed_attempts}/{MAX_PIN_ATTEMPTS} "
        f"for session {qr_session.token[:8]}..."
    )
    
    if qr_session.failed_attempts >= MAX_PIN_ATTEMPTS:
        qr_session.locked_at = datetime.utcnow()
        qr_session.lockout_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        
        logger.warning(
            f"Session {qr_session.token[:8]}... locked until {qr_session.lockout_until}"
        )
    
    db.commit()

def verify_pin_and_create_session(qr_token: str, pin: str, db: Session) -> dict:
    """
    Verify the PIN user entered and create login session.
    ServiceB.com calls this after user types the PIN.
    
    Security measures:
    - Constant-time PIN comparison
    - Failed attempt tracking
    - Session lockout after 3 failures
    - PIN expiration (2 minutes)
    """
    # Find the QR session
    qr_session = db.query(QRSession).filter(
        QRSession.token == qr_token
    ).first()
    
    if not qr_session:
        raise ValueError("Invalid QR code")
    
    # Check if already verified
    if qr_session.is_verified:
        raise ValueError("This QR code was already used")
    
    # Check for lockout
    check_session_lockout(qr_session)
    
    # Check if QR was scanned (has a PIN)
    if not qr_session.pin:
        raise ValueError("QR code not scanned yet. Please scan with mobile app first.")
    
    # Check PIN expiration
    check_pin_expiration(qr_session)
    
    # SECURE: Constant-time PIN verification
    if not verify_pin_securely(qr_session.pin, pin):
        track_failed_attempt(qr_session, db)
        
        remaining_attempts = MAX_PIN_ATTEMPTS - qr_session.failed_attempts
        if remaining_attempts > 0:
            raise ValueError(f"Invalid PIN. {remaining_attempts} attempts remaining.")
        else:
            raise ValueError("Session locked due to too many failed attempts.")
    
    # PIN is valid - proceed with session creation
    user = db.query(ActiveUser).filter(
        ActiveUser.auth_key == qr_session.user_auth_key
    ).first()
    
    if not user:
        raise ValueError("User not found")
    
    # Create session token (JWT) valid for 30 minutes
    session_token = create_access_token(
        data={
            "user_id": user.id,
            "auth_key": user.auth_key,
            "service_id": qr_session.service_id
        },
        expires_delta=timedelta(minutes=settings.SESSION_EXPIRY_MINUTES)
    )
    
    # Mark QR session as verified
    qr_session.is_verified = True
    qr_session.verified_at = datetime.utcnow()
    
    # Update user's last login time
    user.last_login = datetime.utcnow()
    
    # Record this login in history
    session_expires = datetime.utcnow() + timedelta(minutes=settings.SESSION_EXPIRY_MINUTES)
    
    login_record = LoginHistory(
        user_id=user.id,
        service_id=qr_session.service_id,
        session_token=session_token,
        login_at=datetime.utcnow(),
        session_expires_at=session_expires
    )
    
    db.add(login_record)
    db.commit()
    
    logger.info(f"Successful login for user {user.id} via session {qr_session.token[:8]}...")
    
    return {
        "success": True,
        "session_token": session_token,
        "user_info": {
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email
        },
        "expires_in_seconds": settings.SESSION_EXPIRY_MINUTES * 60
    }
```

---

### Step 3: PIN Expiration

**Update QR Service to Set PIN Expiration**

**File:** `app/services/qr_service.py` (update)

```python
def process_qr_scan(qr_token: str, user_auth_key: str, db: Session) -> dict:
    """
    Process when mobile app scans a QR code.
    Now includes PIN expiration timestamp.
    """
    # ... existing validation code ...
    
    # Generate 6-digit PIN for verification
    from app.utils.pin_generator import generate_pin
    pin = generate_pin()
    
    # NEW: Set PIN expiration (2 minutes from now)
    pin_expires_at = datetime.utcnow() + timedelta(minutes=2)
    
    # Update QR session with user info and PIN
    qr_session.user_auth_key = user_auth_key
    qr_session.pin = pin
    qr_session.pin_expires_at = pin_expires_at  # NEW
    qr_session.is_used = True
    qr_session.scanned_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "success": True,
        "pin": pin,
        "message": "QR code scanned successfully. Enter this PIN on the service.",
        "expires_in": 120  # 2 minutes for PIN
    }
```

---

### Step 4: IP Address Logging

**4.1 Add IP Column to QRSession**

```python
# In migration file
op.add_column('qr_sessions',
    sa.Column('client_ip', sa.String(45), nullable=True)
)
op.add_column('qr_sessions',
    sa.Column('scanner_ip', sa.String(45), nullable=True)
)
op.add_column('qr_sessions',
    sa.Column('verifier_ip', sa.String(45), nullable=True)
)
```

**4.2 Update Routes to Capture IP**

**File:** `app/routes/auth.py` (update)

```python
from fastapi import APIRouter, Depends, HTTPException, status, Request

@router.post("/qr/generate", response_model=QRGenerateResponse)
def generate_qr_code(
    request: QRGenerateRequest,
    http_request: Request,  # NEW
    db: Session = Depends(get_db)
):
    """Generate QR code for service login - with IP logging."""
    # ... existing code ...
    
    try:
        qr_data = qr_service.generate_qr_session(
            service_id=request.service_id,
            service_api_key=request.service_api_key,
            client_ip=http_request.client.host,  # NEW
            db=db
        )
        # ... rest ...

@router.post("/qr/scan", response_model=QRScanResponse)
def scan_qr_code(
    request: QRScanRequest,
    http_request: Request,  # NEW
    db: Session = Depends(get_db)
):
    """Process QR code scan from mobile app - with IP logging."""
    # ... existing code ...
    
    try:
        result = qr_service.process_qr_scan(
            qr_token=request.qr_token,
            user_auth_key=request.user_auth_key,
            scanner_ip=http_request.client.host,  # NEW
            db=db
        )
        # ... rest ...

@router.post("/pin/verify", response_model=PINVerifyResponse)
def verify_pin(
    request: PINVerifyRequest,
    http_request: Request,  # NEW
    db: Session = Depends(get_db)
):
    """Verify PIN and create session - with IP logging."""
    # ... existing code ...
    
    try:
        result = pin_service.verify_pin_and_create_session(
            qr_token=request.qr_token,
            pin=request.pin,
            verifier_ip=http_request.client.host,  # NEW
            db=db
        )
        # ... rest ...
```

---

### Step 5: Enhanced Rate Limiting

**File:** `app/middleware/rate_limiter.py` (enhanced)

```python
from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)

class EnhancedRateLimiter:
    """
    Enhanced rate limiter with:
    - Per-IP tracking
    - Per-session tracking  
    - Progressive delays
    - Automatic cleanup
    """
    
    def __init__(
        self, 
        max_requests: int = 10, 
        window_seconds: int = 60,
        progressive_delay: bool = False
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.progressive_delay = progressive_delay
        self.requests = defaultdict(list)
        self.failures = defaultdict(int)
        self._lock = asyncio.Lock()
    
    async def check_rate_limit(self, request: Request):
        client_ip = request.client.host
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        async with self._lock:
            # Clean old requests
            self.requests[client_ip] = [
                t for t in self.requests[client_ip] 
                if t > window_start
            ]
            
            # Check rate limit
            if len(self.requests[client_ip]) >= self.max_requests:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "rate_limit_exceeded",
                        "message": f"Too many requests. Try again in {self.window_seconds} seconds.",
                        "retry_after": self.window_seconds
                    }
                )
            
            # Add progressive delay for repeated failures
            if self.progressive_delay and self.failures[client_ip] > 0:
                delay = min(30, 2 ** self.failures[client_ip])  # Max 30 seconds
                await asyncio.sleep(delay)
            
            self.requests[client_ip].append(now)
    
    def record_failure(self, client_ip: str):
        """Call this when a request fails (e.g., wrong PIN)."""
        self.failures[client_ip] += 1
        logger.info(f"Recorded failure for IP {client_ip}: {self.failures[client_ip]} total")
    
    def reset_failures(self, client_ip: str):
        """Call this on successful operation."""
        self.failures[client_ip] = 0

# Create rate limiters with appropriate limits
login_rate_limiter = EnhancedRateLimiter(
    max_requests=5, 
    window_seconds=60,
    progressive_delay=True
)

qr_rate_limiter = EnhancedRateLimiter(
    max_requests=20, 
    window_seconds=60
)

pin_rate_limiter = EnhancedRateLimiter(
    max_requests=3,  # Very strict for PIN verification
    window_seconds=60,
    progressive_delay=True
)
```

---

### Step 6: Security Audit Logging

**File:** `app/core/audit_logger.py` (new)

```python
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

class AuditEventType(Enum):
    QR_GENERATED = "qr_generated"
    QR_SCANNED = "qr_scanned"
    PIN_GENERATED = "pin_generated"
    PIN_VERIFIED = "pin_verified"
    PIN_FAILED = "pin_failed"
    SESSION_CREATED = "session_created"
    SESSION_VALIDATED = "session_validated"
    SESSION_EXPIRED = "session_expired"
    LOGOUT = "logout"
    LOCKOUT_TRIGGERED = "lockout_triggered"
    RATE_LIMIT_HIT = "rate_limit_hit"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"

class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger("security.audit")
        handler = logging.FileHandler("logs/security_audit.log")
        handler.setFormatter(logging.Formatter(
            '%(asctime)s | %(levelname)s | %(message)s'
        ))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log(
        self,
        event_type: AuditEventType,
        success: bool,
        ip_address: Optional[str] = None,
        user_id: Optional[int] = None,
        session_token: Optional[str] = None,
        service_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log a security audit event."""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": event_type.value,
            "success": success,
            "ip": ip_address,
            "user_id": user_id,
            "session": session_token[:8] + "..." if session_token else None,
            "service_id": service_id,
            "details": details or {}
        }
        
        log_line = " | ".join(f"{k}={v}" for k, v in entry.items() if v is not None)
        
        if success:
            self.logger.info(log_line)
        else:
            self.logger.warning(log_line)
    
    def log_suspicious(self, ip_address: str, reason: str, details: dict = None):
        """Log suspicious activity for security review."""
        self.logger.error(
            f"SUSPICIOUS | ip={ip_address} | reason={reason} | details={details}"
        )

# Global audit logger instance
audit = AuditLogger()
```

---

## 🧪 Security Testing Checklist

### Timing Attack Tests

- [ ] PIN comparison takes constant time regardless of match position
- [ ] Failed attempts have consistent response times
- [ ] No timing difference between valid/invalid tokens

### Brute Force Protection Tests

- [ ] Session locks after 3 failed PIN attempts
- [ ] Lockout lasts 15 minutes
- [ ] Lockout counter resets after expiry
- [ ] Error messages don't reveal valid PINs

### Rate Limiting Tests

- [ ] IP rate limits are enforced
- [ ] Progressive delays work correctly
- [ ] Rate limit errors include retry-after header

### PIN Expiration Tests

- [ ] PINs expire exactly 2 minutes after generation
- [ ] Expired PIN returns appropriate error
- [ ] User can request new QR after PIN expires

### Audit Logging Tests

- [ ] All security events are logged
- [ ] Logs contain required fields
- [ ] Suspicious activity is flagged
- [ ] Log files are properly rotated

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Timing attack vulnerability | 0 |
| PIN comparison time variance | < 1ms |
| Brute force attempts before lockout | 3 |
| Audit log coverage | 100% of security events |
| Failed attempt tracking accuracy | 100% |

---

## 🔗 Related Documents

- [00_MASTER_IMPLEMENTATION_PLAN.md](./00_MASTER_IMPLEMENTATION_PLAN.md)
- [03_DATABASE_SCHEMA_ALIGNMENT.md](./03_DATABASE_SCHEMA_ALIGNMENT.md)
- [99_IMPLEMENTATION_CHECKLIST.md](./99_IMPLEMENTATION_CHECKLIST.md)
