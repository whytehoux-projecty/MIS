from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class SystemSchedule(Base):
    """
    System operating schedule configuration
    Stores operating hours and manual override settings
    """
    __tablename__ = "system_schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    opening_hour = Column(Integer, nullable=False, default=9)
    opening_minute = Column(Integer, nullable=False, default=0)
    closing_hour = Column(Integer, nullable=False, default=17)
    closing_minute = Column(Integer, nullable=False, default=0)
    warning_minutes = Column(Integer, nullable=False, default=15)
    timezone = Column(String, nullable=False, default="UTC")
    
    # Manual override settings
    is_manually_overridden = Column(Boolean, default=False)
    manual_status = Column(String, nullable=True)  # 'open' or 'closed'
    override_reason = Column(String, nullable=True)
    override_expires_at = Column(DateTime, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("admins.id"), nullable=True)
    
    # Relationship to admin who last updated
    updated_by_admin = relationship("Admin", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<SystemSchedule(id={self.id}, hours={self.opening_hour}:00-{self.closing_hour}:00, override={self.is_manually_overridden})>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "opening_time": f"{self.opening_hour:02d}:{self.opening_minute:02d}",
            "closing_time": f"{self.closing_hour:02d}:{self.closing_minute:02d}",
            "warning_minutes_before_close": self.warning_minutes,
            "timezone": self.timezone,
            "is_manually_overridden": self.is_manually_overridden,
            "manual_status": self.manual_status,
            "override_reason": self.override_reason,
            "override_expires_at": self.override_expires_at.isoformat() if self.override_expires_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "updated_by": self.updated_by
        }


class SystemScheduleAudit(Base):
    """
    Audit log for system schedule changes
    Tracks all modifications for compliance and debugging
    """
    __tablename__ = "system_schedule_audit"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    action = Column(String, nullable=False)  # 'update_hours', 'manual_override', 'auto_restore'
    old_value = Column(String, nullable=True)  # JSON string
    new_value = Column(String, nullable=True)  # JSON string
    reason = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship to admin
    admin = relationship("Admin", foreign_keys=[admin_id])
    
    def __repr__(self):
        return f"<SystemScheduleAudit(id={self.id}, action={self.action}, admin_id={self.admin_id})>"
