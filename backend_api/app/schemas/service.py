from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ServiceRegister(BaseModel):
    """Data needed to register a new service"""
    service_name: str
    service_url: HttpUrl
    description: Optional[str] = None

class ServiceResponse(BaseModel):
    """Service information response"""
    id: int
    service_name: str
    service_url: str
    api_key: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ServiceInfo(BaseModel):
    """Basic service info (without API key)"""
    id: int
    service_name: str
    service_url: str
    description: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True