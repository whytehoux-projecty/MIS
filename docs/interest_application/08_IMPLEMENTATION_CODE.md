# 💻 Implementation Code - Ready to Use

> **Document:** 08_IMPLEMENTATION_CODE.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## Quick Reference

This document contains copy-paste ready code snippets for implementation.

---

## 1. Backend - New Invitation Code Generator

### File: `backend_api/app/services/invitation_service.py`

Replace the existing functions with:

```python
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.invitation import Invitation


def generate_invitation_code() -> str:
    """
    Generate 15-character alphanumeric code
    Format: lowercase letters + digits (e.g., 'a1b2c3d4e5f6g7h')
    """
    chars = string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(15))


def generate_pin() -> str:
    """Generate 6-digit PIN"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def generate_url_token() -> str:
    """Generate secure URL token (64 chars)"""
    return secrets.token_urlsafe(48)


def create_invitation(
    db: Session,
    created_by: str,
    intended_for_email: str,
    intended_for_name: str,
    expires_in_hours: int = 24,
    notes: Optional[str] = None
) -> Invitation:
    """Create a new invitation with all required fields"""
    
    code = generate_invitation_code()
    pin = generate_pin()
    url_token = generate_url_token()
    
    # Ensure unique code
    while db.query(Invitation).filter(Invitation.code == code).first():
        code = generate_invitation_code()
    
    # Ensure unique url_token
    while db.query(Invitation).filter(Invitation.url_token == url_token).first():
        url_token = generate_url_token()
    
    invitation = Invitation(
        code=code,
        pin=pin,
        url_token=url_token,
        created_by=created_by,
        intended_for_email=intended_for_email,
        intended_for_name=intended_for_name,
        notes=notes,
        expires_at=datetime.utcnow() + timedelta(hours=expires_in_hours),
        is_used=False,
        is_link_opened=False
    )
    
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    return invitation


def verify_invitation(db: Session, code: str, pin: str) -> dict:
    """Verify invitation code and PIN"""
    
    # Normalize code (lowercase)
    code = code.lower().strip()
    pin = pin.strip()
    
    invitation = db.query(Invitation).filter(
        Invitation.code == code
    ).first()
    
    if not invitation:
        return {"valid": False, "error": "Invalid invitation code"}
    
    if invitation.is_used:
        return {"valid": False, "error": "This invitation has already been used"}
    
    if datetime.utcnow() > invitation.expires_at:
        return {"valid": False, "error": "This invitation has expired"}
    
    if invitation.session_expires_at and datetime.utcnow() > invitation.session_expires_at:
        return {"valid": False, "error": "Your registration session has expired"}
    
    # Constant-time PIN comparison
    if not secrets.compare_digest(invitation.pin, pin):
        return {"valid": False, "error": "Invalid PIN"}
    
    return {
        "valid": True,
        "invitation_id": invitation.id,
        "intended_for": invitation.intended_for_name,
        "message": "Invitation verified successfully",
        "time_remaining": invitation.get_time_remaining()
    }


def get_by_url_token(db: Session, url_token: str) -> Optional[Invitation]:
    """Get invitation by URL token"""
    return db.query(Invitation).filter(
        Invitation.url_token == url_token
    ).first()
```

---

## 2. Backend - Interest Request Service

### File: `backend_api/app/services/interest_service.py`

```python
"""
Interest Service - Complete implementation
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List

from app.models.interest_request import (
    InterestRequest, InterestStatus, RequestSource
)
from app.services import invitation_service
from app.services.email_service import (
    send_invitation_email, send_rejection_email, send_info_request_email
)


async def create_interest_request(
    db: Session,
    data: dict,
    source: RequestSource = RequestSource.EXTERNAL_SPACE
) -> InterestRequest:
    """Create new interest request from external or admin"""
    
    email = data['primary_email'].lower().strip()
    
    # Check duplicate
    existing = db.query(InterestRequest).filter(
        InterestRequest.primary_email == email
    ).first()
    
    if existing:
        if existing.status == InterestStatus.REJECTED:
            raise ValueError("Previous request was rejected. Contact support.")
        elif existing.status == InterestStatus.INVITED:
            raise ValueError("Already invited. Check your email.")
        else:
            raise ValueError("Request already submitted. Please wait.")
    
    request = InterestRequest(
        given_name=data['given_name'].strip(),
        middle_name=data.get('middle_name', '').strip() or None,
        family_name=data['family_name'].strip(),
        alias=data.get('alias', '').strip() or None,
        gender=data['gender'],
        marital_status=data['marital_status'],
        primary_email=email,
        primary_phone=data['primary_phone'].strip(),
        additional_emails=data.get('additional_emails', []),
        additional_phones=data.get('additional_phones', []),
        has_referral=data.get('has_referral', False),
        referral_member_id=data.get('referral_member_id'),
        face_photo_id=data.get('face_photo_id'),
        government_id_type=data.get('government_id_type'),
        government_id_photo_id=data.get('government_id_photo_id'),
        source=source,
        status=InterestStatus.PENDING
    )
    
    db.add(request)
    db.commit()
    db.refresh(request)
    
    return request


async def create_admin_invite(
    db: Session,
    data: dict,
    admin_username: str
) -> dict:
    """Admin creates and immediately sends invitation"""
    
    # Create the interest request
    request = await create_interest_request(
        db, data, RequestSource.ADMIN_DIRECT
    )
    
    # Immediately approve and generate invitation
    request.status = InterestStatus.APPROVED
    request.reviewed_by = admin_username
    request.reviewed_at = datetime.utcnow()
    request.admin_notes = data.get('admin_notes')
    
    expires_hours = data.get('expires_in_hours', 24)
    
    invitation = invitation_service.create_invitation(
        db=db,
        created_by=admin_username,
        intended_for_email=request.primary_email,
        intended_for_name=request.display_name,
        expires_in_hours=expires_hours
    )
    
    request.invitation_id = invitation.id
    request.status = InterestStatus.INVITED
    db.commit()
    
    # Send email
    await send_invitation_email(
        email=request.primary_email,
        name=request.display_name,
        code=invitation.code,
        pin=invitation.pin,
        url_token=invitation.url_token,
        expires_at=invitation.expires_at
    )
    
    return {
        "success": True,
        "request_id": request.id,
        "invitation_code": invitation.code,
        "pin": invitation.pin,
        "expires_at": invitation.expires_at.isoformat()
    }


async def approve_request(
    db: Session,
    request_id: int,
    admin_username: str,
    admin_notes: str = None,
    expires_in_hours: int = 24
) -> dict:
    """Approve pending request and send invitation"""
    
    request = db.query(InterestRequest).filter(
        InterestRequest.id == request_id
    ).first()
    
    if not request:
        raise ValueError("Request not found")
    
    if request.status != InterestStatus.PENDING:
        raise ValueError(f"Request already {request.status.value}")
    
    request.approve(admin_username, admin_notes)
    
    invitation = invitation_service.create_invitation(
        db=db,
        created_by=admin_username,
        intended_for_email=request.primary_email,
        intended_for_name=request.display_name,
        expires_in_hours=expires_in_hours
    )
    
    request.mark_invited(invitation.id)
    db.commit()
    
    await send_invitation_email(
        email=request.primary_email,
        name=request.display_name,
        code=invitation.code,
        pin=invitation.pin,
        url_token=invitation.url_token,
        expires_at=invitation.expires_at
    )
    
    return {
        "success": True,
        "request_id": request_id,
        "invitation_code": invitation.code,
        "pin": invitation.pin,
        "expires_at": invitation.expires_at.isoformat()
    }


async def reject_request(
    db: Session,
    request_id: int,
    admin_username: str,
    reason: str
) -> bool:
    """Reject request with reason"""
    
    request = db.query(InterestRequest).filter(
        InterestRequest.id == request_id
    ).first()
    
    if not request:
        raise ValueError("Request not found")
    
    request.reject(admin_username, reason)
    db.commit()
    
    await send_rejection_email(
        email=request.primary_email,
        name=request.display_name,
        reason=reason
    )
    
    return True


async def request_more_info(
    db: Session,
    request_id: int,
    admin_username: str,
    message: str
) -> bool:
    """Request additional information"""
    
    request = db.query(InterestRequest).filter(
        InterestRequest.id == request_id
    ).first()
    
    if not request:
        raise ValueError("Request not found")
    
    request.request_info(admin_username, message)
    db.commit()
    
    await send_info_request_email(
        email=request.primary_email,
        name=request.display_name,
        message=message,
        request_id=request_id
    )
    
    return True


def get_pending(db: Session, skip: int = 0, limit: int = 50):
    """Get pending requests"""
    return db.query(InterestRequest).filter(
        InterestRequest.status == InterestStatus.PENDING
    ).order_by(InterestRequest.created_at.desc()).offset(skip).limit(limit).all()


def get_stats(db: Session) -> dict:
    """Get request statistics"""
    from sqlalchemy import func
    
    results = db.query(
        InterestRequest.status,
        func.count(InterestRequest.id)
    ).group_by(InterestRequest.status).all()
    
    stats = {s.value: 0 for s in InterestStatus}
    for status, count in results:
        stats[status.value] = count
    
    stats['total'] = sum(stats.values())
    return stats
```

---

## 3. Frontend - API Types Update

### Add to `registration_portal/src/types/index.ts`

```typescript
export interface InvitationVerifyRequest {
  invitation_code: string;  // 15 lowercase alphanumeric
  pin: string;              // 6 digits
}

export interface InvitationVerifyResponse {
  valid: boolean;
  invitation_id?: number;
  intended_for?: string;
  message: string;
  time_remaining?: {
    link_remaining_seconds: number;
    session_remaining_seconds: number;
    link_remaining_formatted: string;
    session_remaining_formatted: string;
  };
}
```

---

## 4. Frontend - Validation Regex Updates

### Update in ICVP.tsx

```typescript
// Old validation (incorrect)
const codeRegex = /^[A-Z0-9]{3,}-[A-Z0-9]{3,}$/;
const pinRegex = /^\d{4}$/;

// New validation (correct)
const codeRegex = /^[a-z0-9]{15}$/i;  // 15 alphanumeric
const pinRegex = /^\d{6}$/;            // 6 digits
```

---

## 5. Quick Test Checklist

```bash
# 1. Run migrations
cd backend_api
alembic upgrade head

# 2. Test invitation generation
python -c "
from app.services.invitation_service import generate_invitation_code, generate_pin
print(f'Code: {generate_invitation_code()}')  # Should be 15 chars
print(f'PIN: {generate_pin()}')                # Should be 6 digits
"

# 3. Start backend
uvicorn app.main:app --reload

# 4. Test API endpoints
curl -X POST http://localhost:8000/api/interest/submit \
  -H "Content-Type: application/json" \
  -d '{
    "given_name": "Test",
    "family_name": "User",
    "gender": "male",
    "marital_status": "single_no_relationship",
    "primary_email": "test@example.com",
    "primary_phone": "+2348012345678"
  }'
```
