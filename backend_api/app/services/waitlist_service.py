"""
Waitlist Service

Handles waitlist/interest request operations including:
- Submitting interest requests
- Admin approval/rejection
- Sending invitation codes to approved users
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.waitlist import WaitlistRequest, WaitlistStatus
from app.services import invitation_service, notification_service


async def submit_interest(
    db: Session,
    full_name: str,
    email: str,
    phone: Optional[str] = None,
    company: Optional[str] = None,
    role: Optional[str] = None
) -> WaitlistRequest:
    """
    Submit a new interest/waitlist request
    
    Args:
        db: Database session
        full_name: User's full name
        email: User's email address
        phone: Optional phone number
        company: Optional company name
        role: Optional job role/title
    
    Returns:
        Created WaitlistRequest object
    
    Raises:
        ValueError: If email already exists in waitlist or is already registered
    """
    # Check if email already exists in waitlist
    existing = db.query(WaitlistRequest).filter(
        WaitlistRequest.email == email.lower().strip()
    ).first()
    
    if existing:
        if existing.status == WaitlistStatus.REJECTED:
            raise ValueError("Your previous request was rejected. Please contact support.")
        elif existing.status == WaitlistStatus.INVITED:
            raise ValueError("You have already been invited. Please check your email for your invitation code.")
        else:
            raise ValueError("You have already submitted an interest request. Please wait for our response.")
    
    # Create new waitlist request
    waitlist_request = WaitlistRequest(
        full_name=full_name.strip(),
        email=email.lower().strip(),
        phone=phone.strip() if phone else None,
        company=company.strip() if company else None,
        role=role.strip() if role else None,
        status=WaitlistStatus.PENDING
    )
    
    db.add(waitlist_request)
    db.commit()
    db.refresh(waitlist_request)
    
    # Notify admin about new request
    await notification_service.send_admin_notification(
        subject="New Waitlist Request",
        message=f"""
A new user has submitted an interest request:

Name: {full_name}
Email: {email}
Phone: {phone or 'Not provided'}
Company: {company or 'Not provided'}
Role: {role or 'Not provided'}

Please log in to the admin panel to review and approve/reject this request.
        """
    )
    
    return waitlist_request


def get_pending_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[WaitlistRequest]:
    """Get all pending waitlist requests"""
    return db.query(WaitlistRequest).filter(
        WaitlistRequest.status == WaitlistStatus.PENDING
    ).order_by(
        WaitlistRequest.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_all_requests(
    db: Session,
    status: Optional[WaitlistStatus] = None,
    skip: int = 0,
    limit: int = 100
) -> List[WaitlistRequest]:
    """Get all waitlist requests, optionally filtered by status"""
    query = db.query(WaitlistRequest)
    
    if status:
        query = query.filter(WaitlistRequest.status == status)
    
    return query.order_by(
        WaitlistRequest.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_request_by_id(db: Session, request_id: int) -> Optional[WaitlistRequest]:
    """Get a specific waitlist request by ID"""
    return db.query(WaitlistRequest).filter(
        WaitlistRequest.id == request_id
    ).first()


def get_request_by_email(db: Session, email: str) -> Optional[WaitlistRequest]:
    """Get a waitlist request by email"""
    return db.query(WaitlistRequest).filter(
        WaitlistRequest.email == email.lower().strip()
    ).first()


async def approve_request(
    db: Session,
    request_id: int,
    admin_username: str,
    admin_notes: Optional[str] = None,
    expires_in_hours: int = 72
) -> dict:
    """
    Approve a waitlist request and send invitation
    
    This function:
    1. Marks the request as approved
    2. Creates an invitation code
    3. Sends the invitation to the user via email/SMS
    
    Args:
        db: Database session
        request_id: ID of the waitlist request
        admin_username: Username of approving admin
        admin_notes: Optional notes from admin
        expires_in_hours: Hours until invitation expires
    
    Returns:
        dict with invitation details
    
    Raises:
        ValueError: If request not found or already processed
    """
    waitlist_request = get_request_by_id(db, request_id)
    
    if not waitlist_request:
        raise ValueError("Waitlist request not found")
    
    if waitlist_request.status != WaitlistStatus.PENDING:
        raise ValueError(f"Request has already been {waitlist_request.status.value}")
    
    # Approve the request
    waitlist_request.approve(admin_username, admin_notes)
    
    # Create invitation
    invitation = invitation_service.create_invitation(
        db=db,
        created_by=admin_username,
        intended_for=waitlist_request.email,
        notes=f"Auto-generated for waitlist request #{request_id}",
        expires_in_hours=expires_in_hours
    )
    
    # Link invitation to request
    waitlist_request.mark_invited(str(invitation.id))
    
    db.commit()
    
    # Send invitation email to user
    await send_invitation_notification(
        email=waitlist_request.email,
        full_name=waitlist_request.full_name,
        phone=waitlist_request.phone,
        invitation_code=invitation.code,
        pin=invitation.pin,
        expires_at=invitation.expires_at
    )
    
    return {
        "success": True,
        "request_id": request_id,
        "invitation_code": invitation.code,
        "pin": invitation.pin,
        "expires_at": invitation.expires_at.isoformat() if invitation.expires_at else None,
        "message": f"Invitation sent to {waitlist_request.email}"
    }


async def reject_request(
    db: Session,
    request_id: int,
    admin_username: str,
    reason: str
) -> bool:
    """
    Reject a waitlist request
    
    Args:
        db: Database session
        request_id: ID of the waitlist request
        admin_username: Username of rejecting admin
        reason: Reason for rejection
    
    Returns:
        True if successful
    
    Raises:
        ValueError: If request not found or already processed
    """
    waitlist_request = get_request_by_id(db, request_id)
    
    if not waitlist_request:
        raise ValueError("Waitlist request not found")
    
    if waitlist_request.status != WaitlistStatus.PENDING:
        raise ValueError(f"Request has already been {waitlist_request.status.value}")
    
    # Reject the request
    waitlist_request.reject(admin_username, reason)
    db.commit()
    
    # Optionally notify user of rejection
    await send_rejection_notification(
        email=waitlist_request.email,
        full_name=waitlist_request.full_name,
        reason=reason
    )
    
    return True


async def send_invitation_notification(
    email: str,
    full_name: str,
    phone: Optional[str],
    invitation_code: str,
    pin: str,
    expires_at: Optional[datetime]
) -> bool:
    """
    Send invitation code to user via email (and SMS if phone provided)
    """
    from app.config import settings
    
    # Format expiration time
    expires_str = expires_at.strftime("%B %d, %Y at %I:%M %p UTC") if expires_at else "72 hours from now"
    
    # Registration portal URL
    registration_url = getattr(settings, 'REGISTRATION_PORTAL_URL', 'http://localhost:5173')
    
    subject = "Your Invitation to Register - SPACE"
    message = f"""
Hello {full_name},

Great news! Your request to join SPACE has been approved.

Here are your registration credentials:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVITATION CODE: {invitation_code}
PIN: {pin}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click the link below to complete your registration:
{registration_url}/invitation

⚠️ IMPORTANT: This invitation expires on {expires_str}

If you did not request this invitation, please ignore this email.

Welcome to SPACE!

Best regards,
The SPACE Team
    """
    
    # Send email
    success = await notification_service.send_user_notification(email, subject, message)
    
    # TODO: Implement SMS notification if phone provided
    # if phone:
    #     send_sms_notification(phone, f"Your SPACE invitation: Code: {invitation_code}, PIN: {pin}")
    
    return success


async def send_rejection_notification(
    email: str,
    full_name: str,
    reason: str
) -> bool:
    """
    Notify user that their request was rejected
    """
    subject = "Update on Your SPACE Registration Request"
    message = f"""
Hello {full_name},

Thank you for your interest in joining SPACE.

After careful review, we regret to inform you that we are unable to approve your registration request at this time.

Reason: {reason}

If you believe this decision was made in error or would like to provide additional information, please contact our support team.

Thank you for your understanding.

Best regards,
The SPACE Team
    """
    
    return await notification_service.send_user_notification(email, subject, message)


def get_waitlist_stats(db: Session) -> dict:
    """Get waitlist statistics for admin dashboard"""
    total = db.query(WaitlistRequest).count()
    pending = db.query(WaitlistRequest).filter(
        WaitlistRequest.status == WaitlistStatus.PENDING
    ).count()
    approved = db.query(WaitlistRequest).filter(
        WaitlistRequest.status == WaitlistStatus.APPROVED
    ).count()
    invited = db.query(WaitlistRequest).filter(
        WaitlistRequest.status == WaitlistStatus.INVITED
    ).count()
    rejected = db.query(WaitlistRequest).filter(
        WaitlistRequest.status == WaitlistStatus.REJECTED
    ).count()
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "invited": invited,
        "rejected": rejected
    }
