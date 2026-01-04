import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.qr_session import QRSession
from app.models.login_history import LoginHistory

def cleanup_expired_data():
    """
    Cleanup task to remove old data and keep database size manageable.
    Should be run via cron job (e.g., daily).
    """
    db = SessionLocal()
    now = datetime.utcnow()
    
    print(f"🧹 Starting cleanup at {now}")
    
    try:
        # 1. Delete expired QR sessions
        # Delete sessions that expired more than 1 hour ago
        # We keep them briefly for debugging/logs if needed
        qr_expiry_threshold = now - timedelta(hours=1)
        
        deleted_qr = db.query(QRSession).filter(
            QRSession.expires_at < qr_expiry_threshold
        ).delete()
        
        print(f"   - Deleted {deleted_qr} expired QR sessions")
        
        # 2. Delete old login history
        # Keep history for 90 days for audit purposes
        history_expiry_threshold = now - timedelta(days=90)
        
        deleted_history = db.query(LoginHistory).filter(
            LoginHistory.login_at < history_expiry_threshold
        ).delete()
        
        print(f"   - Deleted {deleted_history} old login history records (> 90 days)")
        
        db.commit()
        print("✅ Cleanup completed successfully")
        
    except Exception as e:
        print(f"❌ Cleanup failed: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_expired_data()
