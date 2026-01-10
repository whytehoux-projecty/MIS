import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.qr_session import QRSession
from app.models.registered_service import RegisteredService
from app.models.active_user import ActiveUser
from app.utils.qr_generator import create_qr_image
from app.config import settings
from app.utils.session_code import generate_session_code, generate_obfuscation_map, apply_obfuscation, validate_scanned_pattern
import logging

logger = logging.getLogger(__name__)

# Constants
PIN_EXPIRY_MINUTES = 2

def generate_qr_session(
    service_id: int, 
    service_api_key: str, 
    db: Session, 
    client_ip: str = None
) -> dict:
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
    
    # Generate unique token for this QR code (internal reference)
    token = str(uuid.uuid4())
    
    # Generate Obfuscated Session Code (Phase 2.2)
    session_code = generate_session_code()
    obfuscation_map = generate_obfuscation_map()
    qr_pattern = apply_obfuscation(session_code, obfuscation_map)
    
    # Calculate expiration
    expires_at = datetime.utcnow() + timedelta(minutes=settings.QR_CODE_EXPIRY_MINUTES)
    
    # Create QR session in database
    qr_session = QRSession(
        token=token,
        session_code=session_code,
        qr_code_pattern=qr_pattern,
        obfuscation_map=obfuscation_map,
        status="pending",
        service_id=service_id,
        expires_at=expires_at,
        is_used=False,
        is_verified=False,
        client_ip=client_ip
    )
    
    db.add(qr_session)
    db.commit()
    db.refresh(qr_session)
    
    # Generate the actual QR code image using the OBFUSCATED PATTERN
    qr_image = create_qr_image(qr_pattern)
    
    return {
        "token": token,
        "qr_image": qr_image,
        "expires_in_seconds": settings.QR_CODE_EXPIRY_MINUTES * 60,
        "service_name": service.service_name
    }

def process_qr_scan(
    qr_token: str, 
    user_auth_key: str, 
    db: Session,
    scanner_ip: str = None,
    device_info: dict = None
) -> dict:
    """
    Process when mobile app scans a QR code
    Links the QR session to the user and generates PIN
    
    Returns:
        dict with success status and PIN code
    """
    # 1. Try to find session by matching the scanned pattern (obfuscated code)
    qr_session = db.query(QRSession).filter(
        QRSession.qr_code_pattern == qr_token
    ).first()
    
    # 2. Fallback: Identify by UUID token (backward compatibility/legacy)
    if not qr_session:
        qr_session = db.query(QRSession).filter(
            QRSession.token == qr_token
        ).first()
    
    if not qr_session:
        raise ValueError("QR code not found")
    
    # 3. Validate scanned pattern against stored session code (GAP-H03)
    if qr_session.session_code and qr_session.obfuscation_map:
        if not validate_scanned_pattern(qr_token, qr_session.session_code, qr_session.obfuscation_map):
            raise ValueError("Invalid QR code pattern")
    
    # Check if QR code has expired
    if datetime.utcnow() > qr_session.expires_at:
        qr_session.status = "expired"
        db.commit()
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
    
    # NEW: Set PIN expiration (2 minutes from now)
    pin_expires_at = datetime.utcnow() + timedelta(minutes=PIN_EXPIRY_MINUTES)
    
    # Update QR session with user info and PIN
    qr_session.user_auth_key = user_auth_key
    qr_session.pin = pin
    qr_session.pin_expires_at = pin_expires_at
    qr_session.is_used = True
    qr_session.status = "pin_generated"
    qr_session.scanned_at = datetime.utcnow()
    qr_session.scanner_ip = scanner_ip
    qr_session.device_info = device_info
    
    db.commit()
    
    return {
        "success": True,
        "pin": pin,
        "message": "QR code scanned successfully. Enter this PIN on the service.",
        "expires_in": PIN_EXPIRY_MINUTES * 60
    }