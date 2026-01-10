"""
Interest Request Model - Stores membership interest/invitation requests
"""

from sqlalchemy import Column, Integer, String, Boolean, Enum, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum
from datetime import datetime


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class MaritalStatus(str, enum.Enum):
    MARRIED = "married"
    SINGLE_NO_RELATIONSHIP = "single_no_relationship"
    SINGLE_IN_RELATIONSHIP = "single_in_relationship"


class InterestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    INVITED = "invited"
    REGISTRATION_STARTED = "registration_started"
    REGISTRATION_COMPLETE = "registration_complete"
    ACTIVATED = "activated"
    REJECTED = "rejected"
    INFO_REQUESTED = "info_requested"
    EXPIRED = "expired"


class RequestSource(str, enum.Enum):
    EXTERNAL_SPACE = "external_space"
    ADMIN_DIRECT = "admin_direct"


class InterestRequest(BaseModel):
    __tablename__ = "interest_requests"
    
    # NAMES
    given_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    family_name = Column(String(100), nullable=False)
    alias = Column(String(100), nullable=True)
    
    # DEMOGRAPHICS
    gender = Column(Enum(Gender), nullable=False)
    marital_status = Column(Enum(MaritalStatus), nullable=False)
    
    # CONTACT - Primary (required)
    primary_email = Column(String(255), unique=True, index=True, nullable=False)
    primary_phone = Column(String(30), nullable=False)
    # Additional contacts as JSON arrays
    additional_emails = Column(JSON, default=list)
    additional_phones = Column(JSON, default=list)
    
    # REFERRAL
    has_referral = Column(Boolean, default=False)
    referral_member_id = Column(String(50), nullable=True)
    
    # DOCUMENTS
    face_photo_id = Column(String(100), nullable=True)
    face_photo_url = Column(String(500), nullable=True)
    government_id_type = Column(String(50), nullable=True)
    government_id_photo_id = Column(String(100), nullable=True)
    government_id_photo_url = Column(String(500), nullable=True)
    
    # METADATA
    source = Column(Enum(RequestSource), default=RequestSource.EXTERNAL_SPACE)
    status = Column(Enum(InterestStatus), default=InterestStatus.PENDING)
    
    # ADMIN REVIEW
    reviewed_by = Column(String(50), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    info_request_message = Column(Text, nullable=True)
    info_response = Column(Text, nullable=True)
    
    # INVITATION LINK
    invitation_id = Column(Integer, ForeignKey('invitations.id'), nullable=True)
    invitation = relationship("Invitation", back_populates="interest_request")
    
    @property
    def full_name(self) -> str:
        parts = [self.given_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.family_name)
        return " ".join(parts)
    
    @property
    def display_name(self) -> str:
        return self.alias or self.given_name
    
    def approve(self, admin_username: str, notes: str = None):
        self.status = InterestStatus.APPROVED
        self.reviewed_by = admin_username
        self.reviewed_at = datetime.utcnow()
        if notes:
            self.admin_notes = notes

    def mark_invited(self, invitation_id: int):
        self.status = InterestStatus.INVITED
        self.invitation_id = invitation_id

    def reject(self, admin_username: str, reason: str):
        self.status = InterestStatus.REJECTED
        self.reviewed_by = admin_username
        self.reviewed_at = datetime.utcnow()
        self.rejection_reason = reason

    def request_info(self, admin_username: str, message: str):
        self.status = InterestStatus.INFO_REQUESTED
        self.reviewed_by = admin_username
        self.reviewed_at = datetime.utcnow()
        self.info_request_message = message
