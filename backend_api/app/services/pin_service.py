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
    # If pin_expires_at is set, use it
    if qr_session.pin_expires_at:
        if datetime.utcnow() > qr_session.pin_expires_at:
            raise ValueError("PIN has expired. Please scan QR code again.")
    
    # Fallback to checking creation/scan time if explicit expiry not set (though it should be)
    elif qr_session.scanned_at:
        expiry = qr_session.scanned_at + timedelta(minutes=PIN_EXPIRY_MINUTES)
        if datetime.utcnow() > expiry:
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

def verify_pin_and_create_session(
    qr_token: str, 
    pin: str, 
    db: Session, 
    verifier_ip: str = None
) -> dict:
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
    
    # Update verifier IP if provided
    if verifier_ip:
        qr_session.verifier_ip = verifier_ip
    
    # SECURE: Constant-time PIN verification
    if not verify_pin_securely(qr_session.pin, pin):
        track_failed_attempt(qr_session, db)
        
        remaining_attempts = max(0, MAX_PIN_ATTEMPTS - qr_session.failed_attempts)
        if remaining_attempts > 0:
            raise ValueError(f"Invalid PIN. {remaining_attempts} attempts remaining.")
        else:
            raise ValueError(f"Session locked due to too many failed attempts. Try again in {LOCKOUT_DURATION_MINUTES} minutes.")
    
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
    qr_session.status = "completed"
    
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