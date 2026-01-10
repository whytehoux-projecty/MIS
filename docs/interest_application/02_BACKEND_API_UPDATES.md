# 🔌 Backend API Updates

> **Document:** 02_BACKEND_API_UPDATES.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## 1. Interest Request Routes

### File: `backend_api/app/routes/interest_request.py`

```python
"""
Interest Request Routes - Handles external and admin interest submissions
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.services import interest_service, notification_service
from app.models.interest_request import InterestStatus, RequestSource
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.middleware.rate_limiter import RateLimiter

router = APIRouter()
interest_rate_limiter = RateLimiter(max_requests=3, window_seconds=3600)


# ═══════════════════════════════════════════════════════════════════
# PUBLIC ROUTES (For SPACE Website)
# ═══════════════════════════════════════════════════════════════════

@router.post("/submit", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(interest_rate_limiter.check_rate_limit)])
async def submit_interest(request: InterestRequestCreate, db: Session = Depends(get_db)):
    """Submit interest request from SPACE website"""
    try:
        result = await interest_service.create_interest_request(
            db=db,
            data=request,
            source=RequestSource.EXTERNAL_SPACE
        )
        return {
            "success": True,
            "message": "Your interest has been submitted. You will receive an email once reviewed.",
            "request_id": result.id,
            "status": "pending"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status")
def check_status(email: str, db: Session = Depends(get_db)):
    """Check interest request status by email"""
    request = interest_service.get_by_email(db, email)
    if not request:
        return {"found": False, "message": "No request found"}
    return {
        "found": True,
        "status": request.status.value,
        "submitted_at": request.created_at.isoformat()
    }


@router.post("/{request_id}/respond-info")
async def respond_to_info_request(
    request_id: int,
    body: InfoResponseBody,
    db: Session = Depends(get_db)
):
    """Applicant responds to info request"""
    result = await interest_service.submit_info_response(db, request_id, body)
    return {"success": True, "message": "Response submitted"}


# ═══════════════════════════════════════════════════════════════════
# ADMIN ROUTES
# ═══════════════════════════════════════════════════════════════════

@router.get("/pending", response_model=List[InterestRequestResponse])
def get_pending(skip: int = 0, limit: int = 50, db: Session = Depends(get_db),
                admin: Admin = Depends(get_current_admin)):
    """Get pending interest requests"""
    return interest_service.get_pending(db, skip, limit)


@router.get("/all")
def get_all(status: Optional[str] = None, skip: int = 0, limit: int = 50,
            db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    """Get all requests with optional status filter"""
    return interest_service.get_all(db, status, skip, limit)


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    """Get interest request statistics"""
    return interest_service.get_stats(db)


@router.get("/{request_id}")
def get_details(request_id: int, db: Session = Depends(get_db),
                admin: Admin = Depends(get_current_admin)):
    """Get request details"""
    request = interest_service.get_by_id(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


@router.post("/{request_id}/approve")
async def approve(request_id: int, body: ApproveRequestBody, db: Session = Depends(get_db),
                  admin: Admin = Depends(get_current_admin)):
    """Approve request and send invitation"""
    result = await interest_service.approve_request(
        db, request_id, admin.username, body.admin_notes, body.expires_in_hours
    )
    return result


@router.post("/{request_id}/reject")
async def reject(request_id: int, body: RejectRequestBody, db: Session = Depends(get_db),
                 admin: Admin = Depends(get_current_admin)):
    """Reject request"""
    await interest_service.reject_request(db, request_id, admin.username, body.reason)
    return {"success": True, "message": "Request rejected"}


@router.post("/{request_id}/request-info")
async def request_info(request_id: int, body: RequestInfoBody, db: Session = Depends(get_db),
                       admin: Admin = Depends(get_current_admin)):
    """Request additional information from applicant"""
    await interest_service.request_more_info(db, request_id, admin.username, body.message)
    return {"success": True, "message": "Info request sent"}


@router.post("/admin-invite", status_code=status.HTTP_201_CREATED)
async def admin_create_invite(request: AdminInviteCreate, db: Session = Depends(get_db),
                              admin: Admin = Depends(get_current_admin)):
    """Admin directly creates and sends invitation (skips pending)"""
    result = await interest_service.create_admin_invite(
        db=db, data=request, admin_username=admin.username
    )
    return result
```

---

## 2. Updated Invitation Routes

### File: `backend_api/app/routes/invitation.py` (Updates)

```python
# Add to existing routes:

@router.post("/open-link")
def open_registration_link(url_token: str, db: Session = Depends(get_db)):
    """
    Called when applicant clicks registration link.
    Starts the 5-hour session timer.
    """
    invitation = invitation_service.get_by_url_token(db, url_token)
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid link")
    
    if not invitation.is_valid():
        raise HTTPException(status_code=410, detail="Link expired")
    
    # Start session timer
    invitation.start_session()
    db.commit()
    
    return {
        "valid": True,
        "session_started": True,
        "time_remaining": invitation.get_time_remaining()
    }
```

---

## 3. New Service: Interest Service

### File: `backend_api/app/services/interest_service.py`

```python
"""
Interest Service - Handles interest request business logic
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List

from app.models.interest_request import InterestRequest, InterestStatus, RequestSource
from app.services import invitation_service, notification_service


async def create_interest_request(db: Session, data, source: RequestSource) -> InterestRequest:
    """Create new interest request"""
    # Check for duplicate email
    existing = db.query(InterestRequest).filter(
        InterestRequest.primary_email == data.primary_email.lower()
    ).first()
    
    if existing:
        if existing.status == InterestStatus.REJECTED:
            raise ValueError("Your previous request was rejected.")
        raise ValueError("You have already submitted a request.")
    
    request = InterestRequest(
        given_name=data.given_name,
        middle_name=data.middle_name,
        family_name=data.family_name,
        alias=data.alias,
        gender=data.gender,
        marital_status=data.marital_status,
        primary_email=data.primary_email.lower(),
        primary_phone=data.primary_phone,
        additional_emails=data.additional_emails or [],
        additional_phones=data.additional_phones or [],
        has_referral=data.has_referral,
        referral_member_id=data.referral_member_id,
        face_photo_id=data.face_photo_id,
        government_id_type=data.government_id_type,
        government_id_photo_id=data.government_id_photo_id,
        source=source,
        status=InterestStatus.PENDING
    )
    
    db.add(request)
    db.commit()
    db.refresh(request)
    
    # Notify admin
    await notification_service.send_admin_notification(
        subject="New Interest Request",
        message=f"New request from {request.full_name} ({request.primary_email})"
    )
    
    return request


async def approve_request(db: Session, request_id: int, admin: str, 
                         notes: str, expires_hours: int) -> dict:
    """Approve and generate invitation"""
    request = get_by_id(db, request_id)
    if not request:
        raise ValueError("Request not found")
    if request.status != InterestStatus.PENDING:
        raise ValueError(f"Request already {request.status.value}")
    
    request.approve(admin, notes)
    
    # Create invitation
    invitation = invitation_service.create_invitation(
        db=db,
        created_by=admin,
        intended_for_email=request.primary_email,
        intended_for_name=request.display_name,
        expires_in_hours=expires_hours
    )
    
    request.mark_invited(invitation.id)
    db.commit()
    
    # Send invitation email
    await notification_service.send_invitation_email(
        email=request.primary_email,
        name=request.display_name,
        code=invitation.code,
        pin=invitation.pin,
        url_token=invitation.url_token,
        expires_at=invitation.expires_at
    )
    
    return {
        "success": True,
        "invitation_code": invitation.code,
        "pin": invitation.pin,
        "expires_at": invitation.expires_at.isoformat()
    }


async def request_more_info(db: Session, request_id: int, admin: str, message: str):
    """Request additional info from applicant"""
    request = get_by_id(db, request_id)
    if not request:
        raise ValueError("Request not found")
    
    request.request_info(admin, message)
    db.commit()
    
    await notification_service.send_info_request_email(
        email=request.primary_email,
        name=request.display_name,
        message=message
    )


def get_by_id(db: Session, request_id: int) -> Optional[InterestRequest]:
    return db.query(InterestRequest).filter(InterestRequest.id == request_id).first()


def get_by_email(db: Session, email: str) -> Optional[InterestRequest]:
    return db.query(InterestRequest).filter(
        InterestRequest.primary_email == email.lower()
    ).first()


def get_pending(db: Session, skip: int = 0, limit: int = 50) -> List[InterestRequest]:
    return db.query(InterestRequest).filter(
        InterestRequest.status == InterestStatus.PENDING
    ).offset(skip).limit(limit).all()


def get_stats(db: Session) -> dict:
    total = db.query(InterestRequest).count()
    pending = db.query(InterestRequest).filter(
        InterestRequest.status == InterestStatus.PENDING).count()
    invited = db.query(InterestRequest).filter(
        InterestRequest.status == InterestStatus.INVITED).count()
    rejected = db.query(InterestRequest).filter(
        InterestRequest.status == InterestStatus.REJECTED).count()
    info_requested = db.query(InterestRequest).filter(
        InterestRequest.status == InterestStatus.INFO_REQUESTED).count()
    
    return {
        "total": total,
        "pending": pending,
        "invited": invited,
        "rejected": rejected,
        "info_requested": info_requested
    }
```

---

## 4. Updated Invitation Service

### Add to `invitation_service.py`

```python
import secrets
import string
from datetime import datetime, timedelta


def generate_invitation_code() -> str:
    """Generate 15-character alphanumeric code (lowercase + digits)"""
    chars = string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(15))


def generate_pin() -> str:
    """Generate 6-digit PIN"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def generate_url_token() -> str:
    """Generate secure URL token"""
    return secrets.token_urlsafe(48)


def create_invitation(db, created_by, intended_for_email, intended_for_name, 
                     expires_in_hours=24):
    """Create invitation with new format"""
    code = generate_invitation_code()
    pin = generate_pin()
    url_token = generate_url_token()
    
    invitation = Invitation(
        code=code,
        pin=pin,
        url_token=url_token,
        created_by=created_by,
        intended_for_email=intended_for_email,
        intended_for_name=intended_for_name,
        expires_at=datetime.utcnow() + timedelta(hours=expires_in_hours)
    )
    
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    return invitation
```

---

## 5. Main Router Registration

### Update `backend_api/app/main.py`

```python
from app.routes import interest_request

# Add route
app.include_router(
    interest_request.router,
    prefix="/api/interest",
    tags=["Interest Requests"]
)
```
