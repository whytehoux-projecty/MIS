from app.models.admin import Admin
from app.models.login_history import LoginHistory
from app.models.active_user import ActiveUser
from sqlalchemy.orm import Session
from typing import Optional
from app.core.security import verify_password

def authenticate_admin(username: str, password: str, db: Session) -> Optional[Admin]:
    """
    Verify admin credentials
    Used for admin login to control center
    """
    admin = db.query(Admin).filter(
        Admin.username == username,
        Admin.is_active == True
    ).first()
    
    if not admin:
        return None
    
    if not verify_password(password, admin.hashed_password):
        return None
    
    return admin

def get_login_history(
    db: Session,
    user_id: Optional[int] = None,
    service_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Get login history for admin dashboard
    Can filter by user or service
    """
    query = db.query(LoginHistory)
    
    if user_id:
        query = query.filter(LoginHistory.user_id == user_id)
    
    if service_id:
        query = query.filter(LoginHistory.service_id == service_id)
    
    return query.order_by(LoginHistory.login_at.desc()).offset(skip).limit(limit).all()

def get_user_statistics(user_id: int, db: Session) -> dict:
    """
    Get statistics for a specific user
    Shows total logins, services used, etc.
    """
    user = db.query(ActiveUser).filter(ActiveUser.id == user_id).first()
    
    if not user:
        raise ValueError("User not found")
    
    # Count total logins
    total_logins = db.query(LoginHistory).filter(
        LoginHistory.user_id == user_id
    ).count()
    
    # Get unique services used
    services_used = db.query(LoginHistory.service_id).filter(
        LoginHistory.user_id == user_id
    ).distinct().count()
    
    return {
        "user_id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "total_logins": total_logins,
        "services_used": services_used,
        "last_login": user.last_login,
        "account_created": user.approved_at
    }