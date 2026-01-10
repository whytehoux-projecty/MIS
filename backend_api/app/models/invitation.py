"""
Enhanced Invitation Model with:
- 15-character alphanumeric code
- 6-digit PIN
- Dual timer system (24hr validity + 5hr session)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    
    # CREDENTIALS
    code = Column(String(15), unique=True, nullable=False, index=True)  # 15 chars
    pin = Column(String(6), nullable=False)  # 6 digits
    url_token = Column(String(100), unique=True, nullable=False, index=True)
    
    # METADATA
    created_by = Column(String(100), nullable=True)
    intended_for_email = Column(String(255), nullable=True)
    intended_for_name = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    
    # TIMERS
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)  # 24hr from creation
    link_opened_at = Column(DateTime, nullable=True)
    session_expires_at = Column(DateTime, nullable=True)  # 5hr from first open
    
    # STATUS
    is_used = Column(Boolean, default=False)
    used_by = Column(String(200), nullable=True)
    used_at = Column(DateTime, nullable=True)
    is_link_opened = Column(Boolean, default=False)
    
    # RELATIONSHIP
    interest_request = relationship("InterestRequest", back_populates="invitation", uselist=False)
    
    def is_valid(self) -> bool:
        if self.is_used:
            return False
        now = datetime.utcnow()
        if self.expires_at and now > self.expires_at:
            return False
        if self.session_expires_at and now > self.session_expires_at:
            return False
        return True
    
    def is_link_still_valid(self) -> bool:
        """Check if link itself is valid (within 24h) regardless of session"""
        now = datetime.utcnow()
        if self.expires_at and now > self.expires_at:
            return False
        return True

    def is_session_active(self) -> bool:
        """Check if 5-hour session is active"""
        now = datetime.utcnow()
        if self.is_link_opened and self.session_expires_at:
            return now <= self.session_expires_at
        return False
    
    def start_session(self):
        if not self.is_link_opened:
            self.is_link_opened = True
            self.link_opened_at = datetime.utcnow()
            self.session_expires_at = datetime.utcnow() + timedelta(hours=5)
    
    def mark_as_used(self, email: str):
        self.is_used = True
        self.used_by = email
        self.used_at = datetime.utcnow()

    def get_time_remaining(self) -> dict:
        now = datetime.utcnow()
        link_rem = (self.expires_at - now).total_seconds() if self.expires_at else 0
        
        session_rem = 0
        if self.session_expires_at:
            session_rem = (self.session_expires_at - now).total_seconds()
        elif self.is_link_opened:
            session_rem = 0 # Expired or something
        else:
            session_rem = 5 * 3600 # Full 5 hours
            
        return {
            "link_remaining_seconds": max(0, int(link_rem)),
            "session_remaining_seconds": max(0, int(session_rem)),
            "link_remaining_formatted": self._format_seconds(max(0, int(link_rem))),
            "session_remaining_formatted": self._format_seconds(max(0, int(session_rem)))
        }

    def _format_seconds(self, seconds: int) -> str:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
