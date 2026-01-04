"""
Schemas for system schedule management
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class OperatingHoursUpdate(BaseModel):
    """Schema for updating operating hours"""
    opening_hour: int = Field(..., ge=0, le=23, description="Opening hour (0-23)")
    opening_minute: int = Field(..., ge=0, le=59, description="Opening minute (0-59)")
    closing_hour: int = Field(..., ge=0, le=23, description="Closing hour (0-23)")
    closing_minute: int = Field(..., ge=0, le=59, description="Closing minute (0-59)")
    warning_minutes: int = Field(15, ge=0, description="Warning minutes before close")
    timezone: str = Field("UTC", description="Timezone for schedule")
    
    @validator('closing_hour')
    def validate_closing_after_opening(cls, v, values):
        """Ensure closing time is after opening time"""
        if 'opening_hour' in values and 'opening_minute' in values:
            opening_minutes = values['opening_hour'] * 60 + values['opening_minute']
            closing_minutes = v * 60 + values.get('closing_minute', 0)
            if closing_minutes <= opening_minutes:
                raise ValueError('Closing time must be after opening time')
        return v


class SystemToggleRequest(BaseModel):
    """Schema for manual system toggle"""
    status: str = Field(..., description="Target status: 'open', 'closed', or 'auto'")
    reason: Optional[str] = Field(None, description="Reason for override")
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duration in minutes (optional)")
    
    @validator('status')
    def validate_status(cls, v):
        """Ensure status is valid"""
        if v not in ['open', 'closed', 'auto']:
            raise ValueError("Status must be 'open', 'closed', or 'auto'")
        return v


class ScheduleResponse(BaseModel):
    """Schema for schedule response"""
    id: int
    opening_time: str
    closing_time: str
    warning_minutes_before_close: int
    timezone: str
    is_manually_overridden: bool
    manual_status: Optional[str]
    override_reason: Optional[str]
    override_expires_at: Optional[str]
    updated_at: Optional[str]
    updated_by: Optional[int]
    
    class Config:
        from_attributes = True


class ScheduleAuditResponse(BaseModel):
    """Schema for schedule audit log entry"""
    id: int
    admin_id: int
    action: str
    old_value: Optional[str]
    new_value: Optional[str]
    reason: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True
