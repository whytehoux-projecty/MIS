from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from app.models.base import BaseModel

class QRSession(BaseModel):
    __tablename__ = "qr_sessions"
    
    token = Column(String, unique=True, index=True, nullable=False)
    service_id = Column(Integer, ForeignKey("registered_services.id"), nullable=False)
    
    # When mobile app scans, these get filled
    user_auth_key = Column(String, nullable=True)
    pin = Column(String, nullable=True)
    
    # NEW: Obfuscation & Status
    session_code = Column(String(20), nullable=True)
    qr_code_pattern = Column(String(20), nullable=True)
    obfuscation_map = Column(JSON, nullable=True)
    status = Column(String(20), default="pending", nullable=False)

    # Status tracking (Legacy booleans kept for compatibility)
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

    # NEW: IP address tracking for audit
    client_ip = Column(String(45), nullable=True)    # IP that requested QR
    scanner_ip = Column(String(45), nullable=True)   # IP of mobile scanner
    verifier_ip = Column(String(45), nullable=True)  # IP that submitted PIN
    
    # NEW: Device fingerprinting (GAP-C01)
    device_info = Column(JSON, nullable=True)        # Mobile device metadata

    # Constants
    MAX_ATTEMPTS = 3
    LOCKOUT_DURATION_MINUTES = 15