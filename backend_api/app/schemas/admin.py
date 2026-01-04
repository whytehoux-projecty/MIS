from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApprovalRequest(BaseModel):
    """Data needed to approve a user"""
    admin_notes: Optional[str] = None

class RejectionRequest(BaseModel):
    """Data needed to reject a user"""
    reason: str

class AdminLogin(BaseModel):
    """Admin login credentials"""
    username: str
    password: str

class AdminResponse(BaseModel):
    """Admin user information"""
    id: int
    username: str
    full_name: str
    email: str
    is_super_admin: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginHistoryResponse(BaseModel):
    """Single login history record"""
    id: int
    user_id: int
    service_id: int
    login_at: datetime
    logout_at: Optional[datetime]
    session_expires_at: datetime
    
    class Config:
        from_attributes = True