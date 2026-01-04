"""
System Schedule Service
Handles all operations related to system operating hours and manual overrides
"""
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta
from typing import Optional, Dict, Any
import json

from app.models.system_schedule import SystemSchedule, SystemScheduleAudit
from app.config import settings


def get_current_schedule(db: Session) -> SystemSchedule:
    """
    Get the current active system schedule
    Creates default schedule if none exists
    """
    schedule = db.query(SystemSchedule).order_by(SystemSchedule.id.desc()).first()
    
    if not schedule:
        # Create default schedule from environment variables
        schedule = SystemSchedule(
            opening_hour=settings.OPENING_HOUR,
            opening_minute=settings.OPENING_MINUTE,
            closing_hour=settings.CLOSING_HOUR,
            closing_minute=settings.CLOSING_MINUTE,
            warning_minutes=settings.WARNING_MINUTES,
            timezone="UTC"
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
    
    return schedule


def is_system_open(db: Session) -> bool:
    """
    Check if system is currently open
    Considers both scheduled hours and manual overrides
    """
    schedule = get_current_schedule(db)
    
    # Check if manual override is active
    if schedule.is_manually_overridden:
        # Check if override has expired
        if schedule.override_expires_at and datetime.utcnow() > schedule.override_expires_at:
            # Override expired, clear it
            clear_manual_override(db, schedule)
            # Fall through to scheduled check
        else:
            return schedule.manual_status == 'open'
    
    # Check scheduled hours
    now = datetime.utcnow().time()
    opening = time(schedule.opening_hour, schedule.opening_minute)
    closing = time(schedule.closing_hour, schedule.closing_minute)
    
    return opening <= now < closing


def should_send_warning(db: Session) -> bool:
    """Check if we're in warning period before closing"""
    schedule = get_current_schedule(db)
    
    # Don't send warnings if manually overridden
    if schedule.is_manually_overridden:
        return False
    
    now = datetime.utcnow()
    closing = datetime.combine(now.date(), time(schedule.closing_hour, schedule.closing_minute))
    warning_time = closing - timedelta(minutes=schedule.warning_minutes)
    
    return warning_time <= now < closing


def get_system_status(db: Session) -> Dict[str, Any]:
    """Get detailed system status including override information"""
    schedule = get_current_schedule(db)
    now = datetime.utcnow()
    
    status_info = {
        "schedule_id": schedule.id,
        "timezone": schedule.timezone,
        "currently_open": is_system_open(db)
    }
    
    # Check for manual override
    if schedule.is_manually_overridden:
        status_info.update({
            "status": schedule.manual_status,
            "warning": False,
            "message": f"System is manually {schedule.manual_status}",
            "is_manual_override": True,
            "override_reason": schedule.override_reason,
            "override_expires_at": schedule.override_expires_at.isoformat() if schedule.override_expires_at else None
        })
        return status_info
    
    # Normal scheduled operation
    status_info["is_manual_override"] = False
    
    if is_system_open(db):
        if should_send_warning(db):
            closing = datetime.combine(now.date(), time(schedule.closing_hour, schedule.closing_minute))
            minutes_left = int((closing - now).total_seconds() / 60)
            
            status_info.update({
                "status": "open",
                "warning": True,
                "message": f"System closing in {minutes_left} minutes. Please save your work.",
                "minutes_until_close": minutes_left
            })
        else:
            status_info.update({
                "status": "open",
                "warning": False,
                "message": "System is operating normally"
            })
    else:
        status_info.update({
            "status": "closed",
            "warning": False,
            "message": f"System is closed. Hours: {schedule.opening_hour:02d}:{schedule.opening_minute:02d} - {schedule.closing_hour:02d}:{schedule.closing_minute:02d} {schedule.timezone}"
        })
    
    return status_info


def update_operating_hours(
    db: Session,
    opening_hour: int,
    opening_minute: int,
    closing_hour: int,
    closing_minute: int,
    warning_minutes: int,
    admin_id: int,
    timezone: str = "UTC"
) -> SystemSchedule:
    """
    Update system operating hours
    Creates audit log entry
    """
    # Validate inputs
    if not (0 <= opening_hour <= 23 and 0 <= closing_hour <= 23):
        raise ValueError("Hours must be between 0 and 23")
    if not (0 <= opening_minute <= 59 and 0 <= closing_minute <= 59):
        raise ValueError("Minutes must be between 0 and 59")
    if warning_minutes < 0:
        raise ValueError("Warning minutes must be positive")
    
    # Check that opening is before closing
    opening_time = time(opening_hour, opening_minute)
    closing_time = time(closing_hour, closing_minute)
    if opening_time >= closing_time:
        raise ValueError("Opening time must be before closing time")
    
    # Get current schedule for audit
    current_schedule = get_current_schedule(db)
    old_value = current_schedule.to_dict()
    
    # Update schedule
    current_schedule.opening_hour = opening_hour
    current_schedule.opening_minute = opening_minute
    current_schedule.closing_hour = closing_hour
    current_schedule.closing_minute = closing_minute
    current_schedule.warning_minutes = warning_minutes
    current_schedule.timezone = timezone
    current_schedule.updated_by = admin_id
    current_schedule.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(current_schedule)
    
    # Create audit log
    audit = SystemScheduleAudit(
        admin_id=admin_id,
        action="update_hours",
        old_value=json.dumps(old_value),
        new_value=json.dumps(current_schedule.to_dict()),
        reason="Operating hours updated"
    )
    db.add(audit)
    db.commit()
    
    return current_schedule


def set_manual_override(
    db: Session,
    status: str,  # 'open' or 'closed'
    admin_id: int,
    reason: Optional[str] = None,
    duration_minutes: Optional[int] = None
) -> SystemSchedule:
    """
    Set manual override for system status
    """
    if status not in ['open', 'closed']:
        raise ValueError("Status must be 'open' or 'closed'")
    
    schedule = get_current_schedule(db)
    old_value = schedule.to_dict()
    
    # Set override
    schedule.is_manually_overridden = True
    schedule.manual_status = status
    schedule.override_reason = reason or f"Manual override to {status}"
    
    # Set expiration if duration provided
    if duration_minutes:
        schedule.override_expires_at = datetime.utcnow() + timedelta(minutes=duration_minutes)
    else:
        schedule.override_expires_at = None
    
    schedule.updated_by = admin_id
    schedule.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(schedule)
    
    # Create audit log
    audit = SystemScheduleAudit(
        admin_id=admin_id,
        action="manual_override",
        old_value=json.dumps(old_value),
        new_value=json.dumps(schedule.to_dict()),
        reason=reason or f"System manually set to {status}"
    )
    db.add(audit)
    db.commit()
    
    return schedule


def clear_manual_override(
    db: Session,
    schedule: Optional[SystemSchedule] = None,
    admin_id: Optional[int] = None
) -> SystemSchedule:
    """
    Clear manual override and return to scheduled operation
    """
    if not schedule:
        schedule = get_current_schedule(db)
    
    if not schedule.is_manually_overridden:
        return schedule  # Already in auto mode
    
    old_value = schedule.to_dict()
    
    # Clear override
    schedule.is_manually_overridden = False
    schedule.manual_status = None
    schedule.override_reason = None
    schedule.override_expires_at = None
    
    if admin_id:
        schedule.updated_by = admin_id
    schedule.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(schedule)
    
    # Create audit log if admin initiated
    if admin_id:
        audit = SystemScheduleAudit(
            admin_id=admin_id,
            action="auto_restore",
            old_value=json.dumps(old_value),
            new_value=json.dumps(schedule.to_dict()),
            reason="Returned to automatic scheduled operation"
        )
        db.add(audit)
        db.commit()
    
    return schedule


def get_schedule_audit_log(
    db: Session,
    limit: int = 50,
    skip: int = 0
) -> list:
    """
    Get audit log of schedule changes
    """
    logs = db.query(SystemScheduleAudit)\
        .order_by(SystemScheduleAudit.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return logs
