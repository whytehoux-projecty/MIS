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
        middle_name=data.get('middle_name', '').strip() if data.get('middle_name') else None,
        family_name=data['family_name'].strip(),
        alias=data.get('alias', '').strip() if data.get('alias') else None,
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

def get_by_email(db: Session, email: str) -> Optional[InterestRequest]:
    return db.query(InterestRequest).filter(
        InterestRequest.primary_email == email.lower()
    ).first()

def get_by_id(db: Session, request_id: int) -> Optional[InterestRequest]:
    return db.query(InterestRequest).filter(InterestRequest.id == request_id).first()

def get_all(db: Session, status: Optional[str] = None, skip: int = 0, limit: int = 50):
    query = db.query(InterestRequest)
    if status:
        query = query.filter(InterestRequest.status == status)
    return query.order_by(InterestRequest.created_at.desc()).offset(skip).limit(limit).all()

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
