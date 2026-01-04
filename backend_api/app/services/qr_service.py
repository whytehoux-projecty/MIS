import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.qr_session import QRSession
from app.models.registered_service import RegisteredService
from app.models.active_user import ActiveUser
from app.utils.qr_generator import create_qr_image
from app.config import settings

def generate_qr_session(service_id: int, service_api_key: str, db: Session) -> dict:
    """
    Create a new QR code session for a service
    ServiceB.com calls this to get a QR code to display to user
    
    Returns:
        dict with token, qr_image, and expiry info
    """
    # Verify the service exists and API key is correct
    service = db.query(RegisteredService).filter(
        RegisteredService.id == service_id,
        RegisteredService.api_key == service_api_key,
        RegisteredService.is_active == True
    ).first()
    
    if not service:
        raise ValueError("Invalid service credentials")
    
    # Generate unique token for this QR code
    token = str(uuid.uuid4())
    
    # Calculate expiration (2 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.QR_CODE_EXPIRY_MINUTES)
    
    # Create QR session in database
    qr_session = QRSession(
        token=token,
        service_id=service_id,
        expires_at=expires_at,
        is_used=False,
        is_verified=False
    )
    
    db.add(qr_session)
    db.commit()
    db.refresh(qr_session)
    
    # Generate the actual QR code image
    qr_image = create_qr_image(token)
    
    return {
        "token": token,
        "qr_image": qr_image,
        "expires_in_seconds": settings.QR_CODE_EXPIRY_MINUTES * 60,
        "service_name": service.service_name
    }

def process_qr_scan(qr_token: str, user_auth_key: str, db: Session) -> dict:
    """
    Process when mobile app scans a QR code
    Links the QR session to the user and generates PIN
    
    Returns:
        dict with success status and PIN code
    """
    # Find the QR session
    qr_session = db.query(QRSession).filter(
        QRSession.token == qr_token
    ).first()
    
    if not qr_session:
        raise ValueError("QR code not found")
    
    # Check if QR code has expired
    if datetime.utcnow() > qr_session.expires_at:
        raise ValueError("QR code has expired. Please refresh and try again.")
    
    # Check if QR code was already scanned
    if qr_session.is_used:
        raise ValueError("QR code already scanned")
    
    # Verify the user exists and is active
    user = db.query(ActiveUser).filter(
        ActiveUser.auth_key == user_auth_key,
        ActiveUser.is_active == True
    ).first()
    
    if not user:
        raise ValueError("Invalid user credentials")
    
    # Generate 6-digit PIN for verification
    from app.utils.pin_generator import generate_pin
    pin = generate_pin()
    
    # Update QR session with user info and PIN
    qr_session.user_auth_key = user_auth_key
    qr_session.pin = pin
    qr_session.is_used = True
    qr_session.scanned_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "success": True,
        "pin": pin,
        "message": "QR code scanned successfully. Enter this PIN on the service."
    }