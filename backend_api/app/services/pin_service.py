from app.models.login_history import LoginHistory
from app.models.qr_session import QRSession
from app.models.active_user import ActiveUser
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.config import settings
from app.core.security import create_access_token

def verify_pin_and_create_session(qr_token: str, pin: str, db: Session) -> dict:
    """
    Verify the PIN user entered and create login session
    ServiceB.com calls this after user types the PIN
    
    Returns:
        dict with session token and user info
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
    
    # Check if QR was scanned (has a PIN)
    if not qr_session.pin:
        raise ValueError("QR code not scanned yet. Please scan with mobile app first.")
    
    # Verify the PIN matches
    if qr_session.pin != pin:
        raise ValueError("Invalid PIN")
    
    # Get the user who scanned the QR
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