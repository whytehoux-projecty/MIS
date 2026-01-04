from sqlalchemy import Column, String, Boolean, DateTime
from app.models.base import BaseModel

class ActiveUser(BaseModel):
    __tablename__ = "active_users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    # Unique identifier for authentication across services
    auth_key = Column(String, unique=True, index=True, nullable=False)
    
    # Status tracking
    is_active = Column(Boolean, default=True)
    approved_at = Column(DateTime)
    last_login = Column(DateTime, nullable=True)