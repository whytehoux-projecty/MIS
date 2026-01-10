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
    
    if invitation.expires_at and datetime.utcnow() > invitation.expires_at:
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
