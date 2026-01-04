from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from app.models.base import BaseModel

class QRSession(BaseModel):
    __tablename__ = "qr_sessions"
    
    token = Column(String, unique=True, index=True, nullable=False)
    service_id = Column(Integer, ForeignKey("registered_services.id"), nullable=False)
    
    # When mobile app scans, these get filled
    user_auth_key = Column(String, nullable=True)
    pin = Column(String, nullable=True)
    
    # Status tracking
    is_used = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    scanned_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)