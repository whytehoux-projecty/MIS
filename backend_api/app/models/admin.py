from sqlalchemy import Column, String, Boolean
from app.models.base import BaseModel

class Admin(BaseModel):
    __tablename__ = "admins"
    
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    
    is_super_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)