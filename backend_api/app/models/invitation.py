"""
Invitation Model for Registration Portal

Invitations are created by admins and sent to potential members.
Each invitation has a unique code and 4-digit PIN.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime, timedelta
from app.database import Base


class Invitation(Base):
    """
    Invitation codes for registration portal
    
    Admins create invitations with:
    - Unique code (e.g., INV-ABC123)
    - 4-digit PIN
    - Optional expiry date
    - Optional notes about who the invitation is for
    """
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    pin = Column(String(4), nullable=False)  # Stored as plain text (4 digits)
    
    # Metadata
    created_by = Column(String(100), nullable=True)  # Admin who created
    intended_for = Column(String(200), nullable=True)  # Who the invitation is for
    notes = Column(Text, nullable=True)
    
    # Status
    is_used = Column(Boolean, default=False)
    used_by = Column(String(200), nullable=True)  # Email of user who used it
    used_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    def is_valid(self) -> bool:
        """Check if invitation is still valid"""
        if self.is_used:
            return False
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False
        return True
    
    def mark_as_used(self, email: str):
        """Mark invitation as used"""
        self.is_used = True
        self.used_by = email
        self.used_at = datetime.utcnow()
