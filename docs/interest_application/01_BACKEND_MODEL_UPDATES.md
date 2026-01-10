# 📦 Backend Model Updates

> **Document:** 01_BACKEND_MODEL_UPDATES.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## 1. InterestRequest Model (Replaces WaitlistRequest)

### File: `backend_api/app/models/interest_request.py`

```python
"""
Interest Request Model - Stores membership interest/invitation requests
"""

from sqlalchemy import Column, Integer, String, Boolean, Enum, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


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
```

---

## 2. Updated Invitation Model

### File: `backend_api/app/models/invitation.py`

```python
"""
Enhanced Invitation Model with:
- 15-character alphanumeric code
- 6-digit PIN
- Dual timer system (24hr validity + 5hr session)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    
    # CREDENTIALS
    code = Column(String(15), unique=True, nullable=False, index=True)  # 15 chars
    pin = Column(String(6), nullable=False)  # 6 digits
    url_token = Column(String(100), unique=True, nullable=False, index=True)
    
    # METADATA
    created_by = Column(String(100), nullable=True)
    intended_for_email = Column(String(255), nullable=True)
    intended_for_name = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    
    # TIMERS
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)  # 24hr from creation
    link_opened_at = Column(DateTime, nullable=True)
    session_expires_at = Column(DateTime, nullable=True)  # 5hr from first open
    
    # STATUS
    is_used = Column(Boolean, default=False)
    used_by = Column(String(200), nullable=True)
    used_at = Column(DateTime, nullable=True)
    is_link_opened = Column(Boolean, default=False)
    
    # RELATIONSHIP
    interest_request = relationship("InterestRequest", back_populates="invitation", uselist=False)
    
    def is_valid(self) -> bool:
        if self.is_used:
            return False
        now = datetime.utcnow()
        if self.expires_at and now > self.expires_at:
            return False
        if self.session_expires_at and now > self.session_expires_at:
            return False
        return True
    
    def start_session(self):
        if not self.is_link_opened:
            self.is_link_opened = True
            self.link_opened_at = datetime.utcnow()
            self.session_expires_at = datetime.utcnow() + timedelta(hours=5)
    
    def mark_as_used(self, email: str):
        self.is_used = True
        self.used_by = email
        self.used_at = datetime.utcnow()
```

---

## 3. Key Changes Summary

| Field | Old Value | New Value |
|-------|-----------|-----------|
| code length | 6 chars | 15 chars |
| pin length | 4 digits | 6 digits |
| Names | single full_name | given, middle, family, alias |
| Emails | single | primary + additional array |
| Phones | single | primary + additional array |
| Timers | single expiry | 24hr validity + 5hr session |
| ID Documents | none | face photo + government ID |
| Referral | none | referral_member_id |
