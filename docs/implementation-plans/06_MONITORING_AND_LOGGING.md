# 📊 Monitoring and Logging Plan

> **Document ID:** PLAN-06  
> **Priority:** 🟢 Medium  
> **Phase:** 3-4  
> **Estimated Effort:** 1-2 days  
> **Dependencies:** Security hardening (PLAN-02)

---

## 📋 Overview

Implement comprehensive logging and monitoring for security events, as recommended in `login_logic_flow.md`.

### Requirements from Documentation

- ✅ Log all authentication attempts
- ✅ Monitor for suspicious patterns
- ✅ Track failed attempt rates
- ⚠️ Implement alerting (not yet done)

---

## 🎯 Objectives

1. Create structured security audit logs
2. Implement suspicious activity detection
3. Add monitoring endpoints
4. Set up log rotation and retention

---

## 🛠️ Implementation

### Step 1: Create Audit Logger

**File:** `app/core/audit_logger.py`

```python
import logging
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any

class AuditEventType(Enum):
    QR_GENERATED = "qr_generated"
    QR_SCANNED = "qr_scanned"
    PIN_VERIFIED = "pin_verified"
    PIN_FAILED = "pin_failed"
    SESSION_CREATED = "session_created"
    LOGOUT = "logout"
    LOCKOUT = "lockout"
    RATE_LIMIT = "rate_limit"
    SUSPICIOUS = "suspicious"

class AuditLogger:
    def __init__(self, log_file: str = "logs/security_audit.log"):
        self.logger = logging.getLogger("security.audit")
        self.logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler(log_file)
        handler.setFormatter(logging.Formatter(
            '%(asctime)s | %(levelname)s | %(message)s'
        ))
        self.logger.addHandler(handler)
    
    def log(
        self,
        event_type: AuditEventType,
        success: bool,
        ip_address: str = None,
        user_id: int = None,
        service_id: int = None,
        details: Dict[str, Any] = None
    ):
        entry = {
            "event": event_type.value,
            "success": success,
            "ip": ip_address,
            "user_id": user_id,
            "service_id": service_id,
            "details": details or {}
        }
        log_line = " | ".join(f"{k}={v}" for k, v in entry.items() if v is not None)
        
        if success:
            self.logger.info(log_line)
        else:
            self.logger.warning(log_line)
    
    def log_suspicious(self, ip: str, reason: str, details: dict = None):
        self.logger.error(f"SUSPICIOUS | ip={ip} | reason={reason} | details={details}")

audit = AuditLogger()
```

### Step 2: Add Monitoring Endpoints

**File:** `app/routes/monitoring.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.qr_session import QRSession
from app.models.login_history import LoginHistory
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """Get authentication metrics for monitoring."""
    now = datetime.utcnow()
    hour_ago = now - timedelta(hours=1)
    day_ago = now - timedelta(days=1)
    
    return {
        "qr_sessions_last_hour": db.query(QRSession).filter(
            QRSession.created_at >= hour_ago
        ).count(),
        "successful_logins_24h": db.query(LoginHistory).filter(
            LoginHistory.login_at >= day_ago
        ).count(),
        "failed_attempts_last_hour": db.query(QRSession).filter(
            QRSession.created_at >= hour_ago,
            QRSession.failed_attempts > 0
        ).count(),
        "locked_sessions": db.query(QRSession).filter(
            QRSession.lockout_until > now
        ).count()
    }

@router.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

### Step 3: Log Rotation Configuration

**File:** `app/core/logging_config.py`

```python
import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    # Security audit log (rotated)
    audit_handler = RotatingFileHandler(
        "logs/security_audit.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=30  # Keep 30 days
    )
    
    # Application log
    app_handler = RotatingFileHandler(
        "logs/application.log",
        maxBytes=10*1024*1024,
        backupCount=7
    )
    
    logging.getLogger("security.audit").addHandler(audit_handler)
    logging.getLogger("app").addHandler(app_handler)
```

### Step 4: Suspicious Activity Detection

```python
# In audit_logger.py

def detect_suspicious_patterns(ip: str, event_type: str, db) -> bool:
    """Detect and flag suspicious activity patterns."""
    from app.models.qr_session import QRSession
    from datetime import datetime, timedelta
    
    hour_ago = datetime.utcnow() - timedelta(hours=1)
    
    # Check for high failure rate from same IP
    failures = db.query(QRSession).filter(
        QRSession.client_ip == ip,
        QRSession.created_at >= hour_ago,
        QRSession.failed_attempts > 0
    ).count()
    
    if failures >= 10:
        audit.log_suspicious(ip, "high_failure_rate", {"failures": failures})
        return True
    
    # Check for unusual scan patterns
    scans = db.query(QRSession).filter(
        QRSession.scanner_ip == ip,
        QRSession.scanned_at >= hour_ago
    ).count()
    
    if scans >= 50:
        audit.log_suspicious(ip, "excessive_scanning", {"scans": scans})
        return True
    
    return False
```

---

## 📁 Log File Structure

```
logs/
├── security_audit.log      # Security events (rotated daily)
├── security_audit.log.1    # Yesterday's security log
├── application.log         # General application logs
└── error.log              # Error logs
```

### Log Entry Format

```
2026-01-10 14:30:45 | INFO | event=qr_generated | success=true | ip=192.168.1.1 | service_id=1
2026-01-10 14:31:22 | WARNING | event=pin_failed | success=false | ip=192.168.1.2 | user_id=5
2026-01-10 14:32:00 | ERROR | SUSPICIOUS | ip=192.168.1.3 | reason=high_failure_rate | details={'failures': 15}
```

---

## 🧪 Testing

- [ ] Audit logs are created correctly
- [ ] Log rotation works at size limit
- [ ] Monitoring endpoints return correct data
- [ ] Suspicious patterns are detected

---

## 🔗 Related Documents

- [00_MASTER_IMPLEMENTATION_PLAN.md](./00_MASTER_IMPLEMENTATION_PLAN.md)
- [02_BACKEND_SECURITY_HARDENING.md](./02_BACKEND_SECURITY_HARDENING.md)
