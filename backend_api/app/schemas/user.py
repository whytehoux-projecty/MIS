from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    phone: Optional[str] = None
    
    # Extended fields
    date_of_birth: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    biography: Optional[str] = None
    reference_details: Optional[str] = None
    invitation_id: Optional[int] = None
    photo_ids: Optional[List[str]] = None
    audio_oath_id: Optional[str] = None
    policies_accepted: Optional[Dict[str, bool]] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    auth_key: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PendingUserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    phone: Optional[str]
    is_reviewed: bool
    created_at: datetime
    
    # Extended response fields
    occupation: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    biography: Optional[str] = None
    reference_details: Optional[str] = None
    invitation_id: Optional[int] = None
    invitation_code: Optional[str] = None
    photo_ids: Optional[str] = None
    audio_oath_id: Optional[str] = None
    policies_accepted: Optional[str] = None
    admin_notes: Optional[str] = None
    
    class Config:
        from_attributes = True