"""
Invitation Routes for Registration Portal
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.services import invitation_service
from app.core.system_status import is_system_open
from app.middleware.rate_limiter import RateLimiter
from app.schemas.invitation import (
    InvitationVerifyRequest, InvitationVerifyResponse, 
    OpenLinkRequest, OpenLinkResponse
)

router = APIRouter()
invitation_rate_limiter = RateLimiter(max_requests=5, window_seconds=60)

@router.post("/verify", response_model=InvitationVerifyResponse, dependencies=[Depends(invitation_rate_limiter.check_rate_limit)])
def verify_invitation(request: InvitationVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify an invitation code and PIN.
    Called from registration portal.
    """
    if not is_system_open(db):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Registration is currently closed. Please try during operating hours."
        )

    result = invitation_service.verify_invitation(
        db=db,
        code=request.invitation_code,
        pin=request.pin
    )
    
    if not result["valid"]:
        # Return generic valid=False response rather than 400 error, to handle UI flow
        return InvitationVerifyResponse(
            valid=False,
            message=result.get("error", "Invalid credentials")
        )
    
    return InvitationVerifyResponse(
        valid=True,
        invitation_id=result.get("invitation_id"),
        intended_for=result.get("intended_for"),
        message=result.get("message", "Success"),
        time_remaining=result.get("time_remaining")
    )


@router.post("/open-link", response_model=OpenLinkResponse)
def open_registration_link(
    request: OpenLinkRequest, 
    db: Session = Depends(get_db)
):
    """
    Handle encrypted URL opening.
    Validates token and starts 5-hour session timer.
    """
    # Note: Logic moved to route here or can be in service. 
    # 06 had logic in route handler example. I will stick to that or move to service?
    # 08 impl code has get_by_url_token in service.
    # I'll implement the logic here using service helpers.
    
    invitation = invitation_service.get_by_url_token(db, request.url_token)
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid link")
    
    if invitation.is_used:
        raise HTTPException(status_code=410, detail="Link already used")
    
    if not invitation.is_link_still_valid():
         raise HTTPException(status_code=410, detail="Link expired")

    # Check if session already active/expired
    if invitation.is_link_opened:
        if not invitation.is_session_active():
             raise HTTPException(status_code=410, detail="Session expired")
        # If open and active, just return success (re-entry)
    else:
        # Start session
        invitation.start_session()
        db.commit()
    
    return OpenLinkResponse(
        valid=True,
        session_started=True,
        invitation_code=invitation.code,
        invitation_id=invitation.id,
        time_remaining=invitation.get_time_remaining() # Helper added in service
    )
