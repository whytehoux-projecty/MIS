from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import manager
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import schedule_service
from app.schemas.system import SystemStatusResponse
from datetime import datetime

router = APIRouter()

@router.get("/status", response_model=SystemStatusResponse)
def get_status(db: Session = Depends(get_db)):
    """
    Get current system status
    
    Shows if system is open, closed, or closing soon
    Includes manual override information if applicable
    All apps should call this periodically to show warnings
    """
    status = schedule_service.get_system_status(db)
    return SystemStatusResponse(**status)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/operating-hours")
def get_operating_hours(db: Session = Depends(get_db)):
    """
    Get configured operating hours and current schedule
    """
    schedule = schedule_service.get_current_schedule(db)
    
    return {
        "opening_time": f"{schedule.opening_hour:02d}:{schedule.opening_minute:02d}",
        "closing_time": f"{schedule.closing_hour:02d}:{schedule.closing_minute:02d}",
        "warning_minutes_before_close": schedule.warning_minutes,
        "timezone": schedule.timezone,
        "currently_open": schedule_service.is_system_open(db),
        "is_manually_overridden": schedule.is_manually_overridden,
        "manual_status": schedule.manual_status,
        "override_reason": schedule.override_reason,
        "override_expires_at": schedule.override_expires_at.isoformat() if schedule.override_expires_at else None
    }

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Simple health check endpoint
    Returns 200 if API is running
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "system_open": schedule_service.is_system_open(db)
    }