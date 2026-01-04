"""
Invitation Service for Registration Portal

Handles invitation code creation, verification, and management.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
import secrets
import string

from app.models.invitation import Invitation


def generate_invitation_code() -> str:
    """Generate a unique invitation code like INV-ABC123"""
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(6))
    return f"INV-{random_part}"


def generate_pin() -> str:
    """Generate a random 4-digit PIN"""
    return ''.join(secrets.choice(string.digits) for _ in range(4))


def create_invitation(
    db: Session,
    created_by: Optional[str] = None,
    intended_for: Optional[str] = None,
    notes: Optional[str] = None,
    expires_in_hours: int = 72,
    custom_code: Optional[str] = None,
    custom_pin: Optional[str] = None
) -> Invitation:
    """
    Create a new invitation code
    
    Args:
        db: Database session
        created_by: Admin username who created the invitation
        intended_for: Name/email of intended recipient
        notes: Additional notes
        expires_in_hours: Hours until expiry (default 72)
        custom_code: Optional custom invitation code
        custom_pin: Optional custom PIN
    
    Returns:
        Created Invitation object
    """
    # Generate or use custom code
    code = custom_code or generate_invitation_code()
    
    # Ensure code is unique
    existing = db.query(Invitation).filter(Invitation.code == code).first()
    if existing:
        # Generate new code if custom one exists
        code = generate_invitation_code()
    
    # Generate or use custom PIN
    pin = custom_pin or generate_pin()
    
    # Calculate expiry
    expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours) if expires_in_hours > 0 else None
    
    invitation = Invitation(
        code=code.upper(),
        pin=pin,
        created_by=created_by,
        intended_for=intended_for,
        notes=notes,
        expires_at=expires_at
    )
    
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    return invitation


def verify_invitation(
    db: Session,
    code: str,
    pin: str
) -> dict:
    """
    Verify an invitation code and PIN
    
    Args:
        db: Database session
        code: Invitation code to verify
        pin: PIN to verify
    
    Returns:
        dict with validation result
    """
    # Find invitation
    invitation = db.query(Invitation).filter(
        Invitation.code == code.upper()
    ).first()
    
    if not invitation:
        return {
            "valid": False,
            "error": "Invalid invitation code"
        }
    
    # Check if already used
    if invitation.is_used:
        return {
            "valid": False,
            "error": "This invitation has already been used"
        }
    
    # Check expiry
    if invitation.expires_at and datetime.utcnow() > invitation.expires_at:
        return {
            "valid": False,
            "error": "This invitation has expired"
        }
    
    # Check PIN
    if invitation.pin != pin:
        return {
            "valid": False,
            "error": "Invalid PIN"
        }
    
    # Valid!
    return {
        "valid": True,
        "invitation_id": invitation.id,
        "intended_for": invitation.intended_for,
        "message": "Invitation verified successfully",
        "expires_at": invitation.expires_at.isoformat() if invitation.expires_at else None
    }


def mark_invitation_used(
    db: Session,
    invitation_id: int,
    used_by_email: str
) -> bool:
    """
    Mark an invitation as used
    
    Args:
        db: Database session
        invitation_id: ID of the invitation
        used_by_email: Email of the user who used it
    
    Returns:
        True if successful
    """
    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id
    ).first()
    
    if not invitation:
        return False
    
    invitation.mark_as_used(used_by_email)
    db.commit()
    
    return True


def get_invitation_by_id(db: Session, invitation_id: int) -> Optional[Invitation]:
    """Get an invitation by its ID"""
    return db.query(Invitation).filter(Invitation.id == invitation_id).first()


def get_pending_invitations(db: Session, skip: int = 0, limit: int = 100) -> List[Invitation]:
    """Get all unused, non-expired invitations"""
    return db.query(Invitation).filter(
        Invitation.is_used == False
    ).offset(skip).limit(limit).all()


def get_all_invitations(db: Session, skip: int = 0, limit: int = 100) -> List[Invitation]:
    """Get all invitations (for admin view)"""
    return db.query(Invitation).order_by(
        Invitation.created_at.desc()
    ).offset(skip).limit(limit).all()


def delete_invitation(db: Session, invitation_id: int) -> bool:
    """Delete an invitation"""
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not invitation:
        return False
    
    db.delete(invitation)
    db.commit()
    return True
