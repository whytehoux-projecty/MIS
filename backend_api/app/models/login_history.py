from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from app.models.base import BaseModel

class LoginHistory(BaseModel):
    __tablename__ = "login_history"
    
    user_id = Column(Integer, ForeignKey("active_users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("registered_services.id"), nullable=False)
    
    session_token = Column(String, index=True, nullable=False)
    login_at = Column(DateTime, nullable=False)
    logout_at = Column(DateTime, nullable=True)
    session_expires_at = Column(DateTime, nullable=False)
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)