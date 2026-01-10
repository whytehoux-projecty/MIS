from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.interest_request import Gender, MaritalStatus, InterestStatus, RequestSource

class InterestRequestBase(BaseModel):
    given_name: str
    middle_name: Optional[str] = None
    family_name: str
    alias: Optional[str] = None
    gender: Gender
    marital_status: MaritalStatus
    primary_email: EmailStr
    primary_phone: str
    additional_emails: List[EmailStr] = []
    additional_phones: List[str] = []
    has_referral: bool = False
    referral_member_id: Optional[str] = None
    face_photo_id: Optional[str] = None
    government_id_type: Optional[str] = None
    government_id_photo_id: Optional[str] = None

class InterestRequestCreate(InterestRequestBase):
    pass

class AdminInviteCreate(InterestRequestBase):
    admin_notes: Optional[str] = None
    expires_in_hours: int = 24

class InterestRequestResponse(InterestRequestBase):
    id: int
    source: RequestSource
    status: InterestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Files URLs
    face_photo_url: Optional[str] = None
    government_id_photo_url: Optional[str] = None
    
    # Admin review info - arguably restricted, but admin might need it
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    info_request_message: Optional[str] = None
    info_response: Optional[str] = None
    
    invitation_id: Optional[int] = None

    class Config:
        from_attributes = True

class ApproveRequestBody(BaseModel):
    admin_notes: Optional[str] = None
    expires_in_hours: int = 24

class RejectRequestBody(BaseModel):
    reason: str

class RequestInfoBody(BaseModel):
    message: str

class InfoResponseBody(BaseModel):
    message: str
    attachments: List[str] = [] # Optional IDs of new files?
