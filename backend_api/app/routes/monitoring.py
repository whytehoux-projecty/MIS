"""
Monitoring Routes (GAP-H01, GAP-H02)

Provides health check and metrics endpoints for system monitoring.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.qr_session import QRSession
from app.models.login_history import LoginHistory
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Basic health check endpoint.
    
    Returns:
        dict: Health status with timestamp
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "MIS Authentication API",
        "version": "1.0.0"
    }

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """
    Get authentication metrics for monitoring dashboards.
    
    Returns:
        dict: Various metrics about system activity
    """
    now = datetime.utcnow()
    hour_ago = now - timedelta(hours=1)
    day_ago = now - timedelta(days=1)
    
    # QR Sessions metrics
    qr_sessions_last_hour = db.query(QRSession).filter(
        QRSession.created_at >= hour_ago
    ).count()
    
    qr_sessions_24h = db.query(QRSession).filter(
        QRSession.created_at >= day_ago
    ).count()
    
    # Successful logins
    successful_logins_24h = db.query(LoginHistory).filter(
        LoginHistory.login_at >= day_ago
    ).count()
    
    # Failed attempts
    failed_attempts_last_hour = db.query(QRSession).filter(
        QRSession.created_at >= hour_ago,
        QRSession.failed_attempts > 0
    ).count()
    
    # Currently locked sessions
    locked_sessions = db.query(QRSession).filter(
        QRSession.lockout_until > now
    ).count()
    
    # Pending sessions (waiting for scan/verification)
    pending_sessions = db.query(QRSession).filter(
        QRSession.status == "pending",
        QRSession.expires_at > now
    ).count()
    
    return {
        "timestamp": now.isoformat(),
        "qr_sessions": {
            "last_hour": qr_sessions_last_hour,
            "last_24h": qr_sessions_24h
        },
        "logins": {
            "successful_24h": successful_logins_24h
        },
        "security": {
            "failed_attempts_last_hour": failed_attempts_last_hour,
            "locked_sessions": locked_sessions
        },
        "pending_sessions": pending_sessions
    }

@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness probe - checks if service is ready to handle requests.
    Includes database connectivity check.
    
    Returns:
        dict: Readiness status
    """
    try:
        # Simple query to verify DB connectivity
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "ready": db_status == "connected",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }
