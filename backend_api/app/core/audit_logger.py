import logging
import logging.handlers
import json
import os
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
        
        # GAP-L01: Ensure logs directory exists
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        # Handler is set up in logging_config.py usually, 
        # but safely adding here if not configured
        if not self.logger.handlers:
            # GAP-L02: Use RotatingFileHandler for log rotation
            handler = logging.handlers.RotatingFileHandler(
                log_file,
                maxBytes=10*1024*1024,  # 10MB per file
                backupCount=30           # Keep 30 backup files
            )
            formatter = logging.Formatter(
                '%(asctime)s | %(levelname)s | %(message)s'
            )
            handler.setFormatter(formatter)
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
        """
        Log a security event in a structured format.
        Format: timestamp | LEVEL | event=... success=... ip=...
        """
        entry = {
            "event": event_type.value,
            "success": str(success).lower(),
            "ip": ip_address or "unknown",
            "user_id": str(user_id) if user_id else "nan",
            "service_id": str(service_id) if service_id else "nan",
            "details": json.dumps(details or {})
        }
        
        # Create key=value string
        log_line = " | ".join(f"{k}={v}" for k, v in entry.items())
        
        if success:
            self.logger.info(log_line)
        else:
            self.logger.warning(log_line)
    
    def log_suspicious(self, ip: str, reason: str, details: dict = None):
        """Log suspicious activity that requires attention."""
        detail_str = json.dumps(details or {})
        self.logger.error(f"SUSPICIOUS | ip={ip} | reason={reason} | details={detail_str}")

def detect_suspicious_patterns(ip: str, db, threshold_failures: int = 10, threshold_scans: int = 50) -> bool:
    """
    Detect and flag suspicious activity patterns (GAP-M03).
    
    Checks for:
    - High failure rate from same IP
    - Excessive scanning activity
    
    Args:
        ip: IP address to check
        db: Database session
        threshold_failures: Max failures in 1 hour before flagging
        threshold_scans: Max scans in 1 hour before flagging
    
    Returns:
        bool: True if suspicious activity was detected
    """
    from app.models.qr_session import QRSession
    from datetime import datetime, timedelta
    
    hour_ago = datetime.utcnow() - timedelta(hours=1)
    suspicious = False
    
    # Check for high failure rate from same IP
    failures = db.query(QRSession).filter(
        QRSession.client_ip == ip,
        QRSession.created_at >= hour_ago,
        QRSession.failed_attempts > 0
    ).count()
    
    if failures >= threshold_failures:
        audit.log_suspicious(ip, "high_failure_rate", {"failures": failures})
        suspicious = True
    
    # Check for unusual scan patterns
    scans = db.query(QRSession).filter(
        QRSession.scanner_ip == ip,
        QRSession.scanned_at >= hour_ago
    ).count()
    
    if scans >= threshold_scans:
        audit.log_suspicious(ip, "excessive_scanning", {"scans": scans})
        suspicious = True
    
    return suspicious

# Global instance
audit = AuditLogger()

