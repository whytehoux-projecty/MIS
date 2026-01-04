from sqlalchemy import Column, String, Boolean
from app.models.base import BaseModel

class RegisteredService(BaseModel):
    __tablename__ = "registered_services"
    
    service_name = Column(String, unique=True, nullable=False)
    service_url = Column(String, nullable=False)
    api_key = Column(String, unique=True, nullable=False)
    
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)