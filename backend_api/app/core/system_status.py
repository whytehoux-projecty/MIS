"""
System Status Module
Provides system status checking with database-backed scheduling
Maintains backward compatibility with environment variables
"""
from datetime import datetime, time, timedelta
from app.config import settings
from typing import Optional, Dict, Any


# Legacy functions for backward compatibility (no DB required)
def is_system_open_legacy() -> bool:
    """Check if current time is within operating hours (legacy, env-based)"""
    now = datetime.now().time()
    opening = time(settings.OPENING_HOUR, settings.OPENING_MINUTE)
    closing = time(settings.CLOSING_HOUR, settings.CLOSING_MINUTE)
    
    return opening <= now < closing


def should_send_warning_legacy() -> bool:
    """Check if we're in warning period before closing (legacy)"""
    now = datetime.now()
    closing = datetime.combine(now.date(), time(settings.CLOSING_HOUR, settings.CLOSING_MINUTE))
    warning_time = closing - timedelta(minutes=settings.WARNING_MINUTES)
    
    return warning_time <= now < closing


def get_system_status_legacy() -> dict:
    """Get detailed system status (legacy, env-based)"""
    now = datetime.now()
    
    if is_system_open_legacy():
        if should_send_warning_legacy():
            closing = datetime.combine(now.date(), time(settings.CLOSING_HOUR, settings.CLOSING_MINUTE))
            minutes_left = int((closing - now).total_seconds() / 60)
            
            return {
                "status": "open",
                "warning": True,
                "message": f"System closing in {minutes_left} minutes. Please save your work.",
                "minutes_until_close": minutes_left
            }
        return {
            "status": "open",
            "warning": False,
            "message": "System is operating normally"
        }
    
    return {
        "status": "closed",
        "warning": False,
        "message": f"System is closed. Hours: {settings.OPENING_HOUR}:00 - {settings.CLOSING_HOUR}:00"
    }


# Convenience functions that try DB first, fall back to legacy
def is_system_open(db = None) -> bool:
    """
    Check if system is open
    Uses database if available, falls back to environment variables
    """
    if db is not None:
        try:
            from app.services.schedule_service import is_system_open as db_is_open
            return db_is_open(db)
        except Exception as e:
            print(f"Error checking DB schedule, using legacy: {e}")
    
    return is_system_open_legacy()


def get_system_status(db = None) -> Dict[str, Any]:
    """
    Get system status
    Uses database if available, falls back to environment variables
    """
    if db is not None:
        try:
            from app.services.schedule_service import get_system_status as db_get_status
            return db_get_status(db)
        except Exception as e:
            print(f"Error getting DB status, using legacy: {e}")
    
    return get_system_status_legacy()