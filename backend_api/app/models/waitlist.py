"""
Waitlist Request Model

Stores interest/waitlist requests from users who want to be invited to register.
"""

from sqlalchemy import Column, String, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class WaitlistStatus(str, enum.Enum):
    """Status of a waitlist request"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    INVITED = "invited"  # Invitation sent


class WaitlistRequest(BaseModel):
    """
    Model for users requesting to join the platform.
    
    This is the first step in the registration flow:
    1. User submits interest on InterestPage
    2. Admin reviews and approves/rejects
    3. If approved, system creates invitation and sends it to user
    4. User uses invitation to complete registration
    """
    __tablename__ = "waitlist_requests"
    
    # Contact information
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Professional information
    company = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)
    
    # Request status
    status = Column(
        Enum(WaitlistStatus),
        default=WaitlistStatus.PENDING,
        nullable=False
    )
    
    # Admin review
    reviewed_by = Column(String(50), nullable=True)
    admin_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Link to invitation (if approved and invitation created)
    invitation_id = Column(String(50), nullable=True)
    
    def __repr__(self):
        return f"<WaitlistRequest {self.email} ({self.status})>"
    
    def approve(self, admin_username: str, notes: str = None):
        """Mark the request as approved"""
        self.status = WaitlistStatus.APPROVED
        self.reviewed_by = admin_username
        if notes:
            self.admin_notes = notes
    
    def reject(self, admin_username: str, reason: str):
        """Mark the request as rejected"""
        self.status = WaitlistStatus.REJECTED
        self.reviewed_by = admin_username
        self.rejection_reason = reason
    
    def mark_invited(self, invitation_id: str):
        """Mark that invitation has been sent"""
        self.status = WaitlistStatus.INVITED
        self.invitation_id = invitation_id
