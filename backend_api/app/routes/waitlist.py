"""
Waitlist Routes for Registration Portal

These endpoints handle waitlist/interest requests:
- Public: Submit interest request
- Admin: Review, approve, reject requests
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.services import waitlist_service
from app.models.waitlist import WaitlistStatus
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.middleware.rate_limiter import RateLimiter

router = APIRouter()

# Rate limiter for interest submissions (3 per hour per IP)
interest_rate_limiter = RateLimiter(max_requests=3, window_seconds=3600)


# ============================================================================
# Schemas
# ============================================================================

class InterestSubmitRequest(BaseModel):
    """Request schema for submitting interest"""
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "company": "Acme Corp",
                "role": "Software Engineer"
            }
        }


class InterestSubmitResponse(BaseModel):
    """Response schema for interest submission"""
    success: bool
    message: str
    request_id: Optional[int] = None


class WaitlistRequestResponse(BaseModel):
    """Response schema for waitlist request"""
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    invitation_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApproveRequestBody(BaseModel):
    """Request body for approving a waitlist request"""
    admin_notes: Optional[str] = None
    expires_in_hours: int = 72


class RejectRequestBody(BaseModel):
    """Request body for rejecting a waitlist request"""
    reason: str


class ApprovalResponse(BaseModel):
    """Response for approval action"""
    success: bool
    request_id: int
    invitation_code: str
    pin: str
    expires_at: Optional[str] = None
    message: str


class WaitlistStatsResponse(BaseModel):
    """Response for waitlist statistics"""
    total: int
    pending: int
    approved: int
    invited: int
    rejected: int


# ============================================================================
# Public Routes
# ============================================================================

@router.post(
    "/submit",
    response_model=InterestSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(interest_rate_limiter.check_rate_limit)]
)
async def submit_interest(
    request: InterestSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Submit an interest/waitlist request
    
    This is called from the registration portal's InterestPage.
    Users provide their contact information to request an invitation to register.
    """
    try:
        waitlist_request = await waitlist_service.submit_interest(
            db=db,
            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            company=request.company,
            role=request.role
        )
        
        return InterestSubmitResponse(
            success=True,
            message="Thank you for your interest! We will review your request and send you an invitation code via email if approved.",
            request_id=waitlist_request.id
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/status")
def check_request_status(
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """
    Check the status of a waitlist request by email
    """
    request = waitlist_service.get_request_by_email(db, email)
    
    if not request:
        return {
            "found": False,
            "message": "No request found with this email address"
        }
    
    return {
        "found": True,
        "status": request.status.value,
        "submitted_at": request.created_at.isoformat(),
        "message": _get_status_message(request.status)
    }


def _get_status_message(status: WaitlistStatus) -> str:
    """Get user-friendly message for status"""
    messages = {
        WaitlistStatus.PENDING: "Your request is being reviewed. You will receive an email once a decision is made.",
        WaitlistStatus.APPROVED: "Your request has been approved! Check your email for the invitation code.",
        WaitlistStatus.INVITED: "An invitation has been sent to your email. Please check your inbox.",
        WaitlistStatus.REJECTED: "Unfortunately, your request was not approved. Please contact support for more information."
    }
    return messages.get(status, "Unknown status")


# ============================================================================
# Admin Routes
# ============================================================================

@router.get(
    "/pending",
    response_model=List[WaitlistRequestResponse]
)
def get_pending_requests(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get all pending waitlist requests (Admin only)
    """
    requests = waitlist_service.get_pending_requests(db, skip=skip, limit=limit)
    return requests


@router.get(
    "/all",
    response_model=List[WaitlistRequestResponse]
)
def get_all_requests(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get all waitlist requests with optional status filter (Admin only)
    """
    status_enum = None
    if status:
        try:
            status_enum = WaitlistStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {[s.value for s in WaitlistStatus]}"
            )
    
    requests = waitlist_service.get_all_requests(db, status=status_enum, skip=skip, limit=limit)
    return requests


@router.get(
    "/stats",
    response_model=WaitlistStatsResponse
)
def get_waitlist_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get waitlist statistics (Admin only)
    """
    return waitlist_service.get_waitlist_stats(db)


@router.get(
    "/{request_id}",
    response_model=WaitlistRequestResponse
)
def get_request_details(
    request_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get details of a specific waitlist request (Admin only)
    """
    request = waitlist_service.get_request_by_id(db, request_id)
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waitlist request not found"
        )
    
    return request


@router.post(
    "/{request_id}/approve",
    response_model=ApprovalResponse
)
async def approve_request(
    request_id: int,
    body: ApproveRequestBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Approve a waitlist request and send invitation (Admin only)
    
    This will:
    1. Mark the request as approved
    2. Generate an invitation code and PIN
    3. Send the invitation to the user via email
    """
    try:
        result = await waitlist_service.approve_request(
            db=db,
            request_id=request_id,
            admin_username=current_admin.username,
            admin_notes=body.admin_notes,
            expires_in_hours=body.expires_in_hours
        )
        
        return ApprovalResponse(**result)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{request_id}/reject")
async def reject_request(
    request_id: int,
    body: RejectRequestBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Reject a waitlist request (Admin only)
    """
    try:
        success = await waitlist_service.reject_request(
            db=db,
            request_id=request_id,
            admin_username=current_admin.username,
            reason=body.reason
        )
        
        return {
            "success": success,
            "message": f"Request {request_id} has been rejected"
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
