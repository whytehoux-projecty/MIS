from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class InvitationCreateRequest(BaseModel):
    intended_for_email: str
    intended_for_name: str
    expires_in_hours: int = 24
    notes: Optional[str] = None

class InvitationVerifyRequest(BaseModel):
    invitation_code: str
    pin: str

class TimeRemaining(BaseModel):
    link_remaining_seconds: int
    session_remaining_seconds: int
    link_remaining_formatted: str
    session_remaining_formatted: str

class InvitationVerifyResponse(BaseModel):
    valid: bool
    invitation_id: Optional[int] = None
    intended_for: Optional[str] = None
    message: str
    time_remaining: Optional[TimeRemaining] = None

class OpenLinkRequest(BaseModel):
    url_token: str

class OpenLinkResponse(BaseModel):
    valid: bool
    session_started: bool
    invitation_code: str
    invitation_id: Optional[int] = None
    time_remaining: TimeRemaining
