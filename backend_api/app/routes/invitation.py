"""
Invitation Routes for Registration Portal

These endpoints handle invitation verification and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.services import invitation_service
from app.core.system_status import is_system_open
from app.middleware.rate_limiter import RateLimiter

router = APIRouter()

# Rate limiter for invitation verification (5 attempts per minute)
invitation_rate_limiter = RateLimiter(max_requests=5, window_seconds=60)


# ============================================================================
# Schemas
# ============================================================================

class InvitationVerifyRequest(BaseModel):
    """Request schema for invitation verification"""
    invitation_code: str
    pin: str


class InvitationVerifyResponse(BaseModel):
    """Response schema for invitation verification"""
    valid: bool
    invitation_id: Optional[int] = None
    intended_for: Optional[str] = None
    message: str
    expires_at: Optional[str] = None


class InvitationCreateRequest(BaseModel):
    """Request schema for creating an invitation (admin only)"""
    intended_for: Optional[str] = None
    notes: Optional[str] = None
    expires_in_hours: int = 72
    custom_code: Optional[str] = None
    custom_pin: Optional[str] = None


class InvitationResponse(BaseModel):
    """Response schema for invitation"""
    id: int
    code: str
    pin: str
    intended_for: Optional[str] = None
    notes: Optional[str] = None
    is_used: bool
    used_by: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# Public Routes
# ============================================================================

@router.post(
    "/verify",
    response_model=InvitationVerifyResponse,
    dependencies=[Depends(invitation_rate_limiter.check_rate_limit)]
)
def verify_invitation(
    request: InvitationVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verify an invitation code and PIN
    
    This is called from the registration portal's invitation page.
    Successful verification allows the user to proceed with registration.
    """
    # Check if system is open
    if not is_system_open(db):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Registration is currently closed. Please try during operating hours."
        )
    
    # Verify the invitation
    result = invitation_service.verify_invitation(
        db=db,
        code=request.invitation_code.strip().upper(),
        pin=request.pin.strip()
    )
    
    if not result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Invalid invitation")
        )
    
    return InvitationVerifyResponse(
        valid=True,
        invitation_id=result.get("invitation_id"),
        intended_for=result.get("intended_for"),
        message=result.get("message", "Invitation verified successfully"),
        expires_at=result.get("expires_at")
    )


# ============================================================================
# Admin Routes (require authentication)
# ============================================================================

@router.post(
    "/create",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_invitation(
    request: InvitationCreateRequest,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
    # admin: Admin = Depends(get_current_admin)
):
    """
    Create a new invitation code (Admin only)
    
    Creates an invitation with a unique code and 4-digit PIN
    that can be sent to potential members.
    """
    try:
        invitation = invitation_service.create_invitation(
            db=db,
            created_by="admin",  # TODO: Use admin.username from auth
            intended_for=request.intended_for,
            notes=request.notes,
            expires_in_hours=request.expires_in_hours,
            custom_code=request.custom_code,
            custom_pin=request.custom_pin
        )
        
        return invitation
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/list", response_model=list[InvitationResponse])
def list_invitations(
    skip: int = 0,
    limit: int = 50,
    include_used: bool = False,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
):
    """
    List all invitations (Admin only)
    
    Returns all invitations, optionally including used ones.
    """
    if include_used:
        invitations = invitation_service.get_all_invitations(db, skip=skip, limit=limit)
    else:
        invitations = invitation_service.get_pending_invitations(db, skip=skip, limit=limit)
    
    return invitations


@router.delete("/{invitation_id}")
def delete_invitation(
    invitation_id: int,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
):
    """
    Delete an invitation (Admin only)
    """
    success = invitation_service.delete_invitation(db, invitation_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    return {"message": "Invitation deleted successfully"}
