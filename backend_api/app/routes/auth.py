from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    QRGenerateRequest, QRGenerateResponse,
    QRScanRequest, QRScanResponse,
    PINVerifyRequest, PINVerifyResponse
)
from app.services import qr_service, pin_service, session_service
from app.core.system_status import is_system_open, get_system_status
from app.middleware.rate_limiter import qr_rate_limiter, login_rate_limiter
from app.core.audit_logger import audit, AuditEventType, detect_suspicious_patterns

router = APIRouter()

@router.post("/qr/generate", response_model=QRGenerateResponse, dependencies=[Depends(qr_rate_limiter.check_rate_limit)])
def generate_qr_code(
    payload: QRGenerateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Generate QR code for service login
    
    ServiceB.com calls this when user wants to login
    Returns QR code image and token
    """
    # Check if system is open
    if not is_system_open(db):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is currently closed"
        )
    
    try:
        qr_data = qr_service.generate_qr_session(
            service_id=payload.service_id,
            service_api_key=payload.service_api_key,
            db=db,
            client_ip=request.client.host
        )
        
        audit.log(
            AuditEventType.QR_GENERATED,
            success=True,
            service_id=payload.service_id,
            ip_address=request.client.host,
            details={"token": qr_data["token"]}
        )
        
        return QRGenerateResponse(
            qr_token=qr_data["token"],
            qr_image=qr_data["qr_image"],
            expires_in_seconds=qr_data["expires_in_seconds"]
        )
        
    except ValueError as e:
        audit.log(
            AuditEventType.QR_GENERATED,
            success=False,
            service_id=payload.service_id,
            ip_address=request.client.host,
            details={"error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/qr/scan", response_model=QRScanResponse, dependencies=[Depends(qr_rate_limiter.check_rate_limit)])
def scan_qr_code(
    payload: QRScanRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Process QR code scan from mobile app
    
    Mobile app calls this after scanning QR code
    Returns PIN that user must enter on ServiceB.com
    """
    # Check if system is open
    if not is_system_open(db):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is currently closed"
        )
    
    try:
        result = qr_service.process_qr_scan(
            qr_token=payload.qr_token,
            user_auth_key=payload.user_auth_key,
            db=db,
            scanner_ip=request.client.host,
            device_info=payload.device_info
        )
        
        audit.log(
            AuditEventType.QR_SCANNED,
            success=True,
            ip_address=request.client.host,
            details={
                "auth_key": payload.user_auth_key, 
                "device_info": payload.device_info
            }
        )
        
        return QRScanResponse(
            success=result["success"],
            pin=result["pin"],
            message=result["message"]
        )
        
    except ValueError as e:
        audit.log(
            AuditEventType.QR_SCANNED,
            success=False,
            ip_address=request.client.host,
            details={"error": str(e), "auth_key": payload.user_auth_key}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/pin/verify", response_model=PINVerifyResponse, dependencies=[Depends(login_rate_limiter.check_rate_limit)])
def verify_pin(
    payload: PINVerifyRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify PIN and create login session
    
    ServiceB.com calls this after user enters PIN
    Returns session token valid for 30 minutes
    """
    # Check if system is open
    if not is_system_open(db):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is currently closed"
        )
    
    try:
        result = pin_service.verify_pin_and_create_session(
            qr_token=payload.qr_token,
            pin=payload.pin,
            db=db,
            verifier_ip=request.client.host
        )
        
        user_info = result.get("user_info", {})
        audit.log(
            AuditEventType.PIN_VERIFIED,
            success=True,
            ip_address=request.client.host,
            user_id=user_info.get("user_id"),
            details={"qr_token": payload.qr_token}
        )
        
        return PINVerifyResponse(
            success=result["success"],
            session_token=result["session_token"],
            user_info=result["user_info"],
            expires_in_seconds=result["expires_in_seconds"]
        )
        
    except ValueError as e:
        audit.log(
            AuditEventType.PIN_VERIFIED,
            success=False,
            ip_address=request.client.host,
            details={"error": str(e), "qr_token": payload.qr_token}
        )
        
        # GAP-M03: Check for suspicious patterns on failure
        detect_suspicious_patterns(request.client.host, db)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/validate-session")
def validate_session(token: str, db: Session = Depends(get_db)):
    """
    Validate if a session token is still valid
    
    Services call this to check if user is still logged in
    """
    try:
        result = session_service.validate_session_token(token, db)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/logout")
def logout(token: str, request: Request, db: Session = Depends(get_db)):
    """
    Logout user session
    """
    try:
        success = session_service.logout_session(token, db)
        audit.log(
             AuditEventType.LOGOUT,
             success=True,
             ip_address=request.client.host
        )
        return {"success": success, "message": "Logged out successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )