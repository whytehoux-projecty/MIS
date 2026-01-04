from pydantic import BaseModel
from typing import Optional

class SystemStatusResponse(BaseModel):
    """Current system status"""
    status: str  # "open", "closed"
    warning: bool
    message: str
    minutes_until_close: Optional[int] = None

class MaintenanceWarning(BaseModel):
    """Warning about upcoming maintenance/shutdown"""
    warning_active: bool
    message: str
    minutes_remaining: int

class OperatingHours(BaseModel):
    """System operating hours configuration"""
    opening_time: str
    closing_time: str
    warning_minutes_before_close: int
    timezone: str
    currently_open: bool