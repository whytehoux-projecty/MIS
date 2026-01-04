from app.models.login_history import LoginHistory
from app.models.active_user import ActiveUser
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.security import decode_access_token

def validate_session_token(token: str, db: Session) -> dict:
    """
    Verify if a session token is still valid
    Services call this to check if user is still logged in
    """
    
    # Decode the JWT token
    payload = decode_access_token(token)
    
    if not payload:
        raise ValueError("Invalid token")
    
    # Check if session exists in login history
    login_record = db.query(LoginHistory).filter(
        LoginHistory.session_token == token
    ).first()
    
    if not login_record:
        raise ValueError("Session not found")
    
    # Check if session has expired
    if datetime.utcnow() > login_record.session_expires_at:
        raise ValueError("Session has expired")
    
    # Check if user is still active
    user = db.query(ActiveUser).filter(
        ActiveUser.id == payload["user_id"],
        ActiveUser.is_active == True
    ).first()
    
    if not user:
        raise ValueError("User account is inactive")
    
    return {
        "valid": True,
        "user_id": user.id,
        "username": user.username,
        "expires_at": login_record.session_expires_at
    }

def logout_session(token: str, db: Session) -> bool:
    """
    Logout a user session
    Marks the logout time in login_history
    """
    login_record = db.query(LoginHistory).filter(
        LoginHistory.session_token == token
    ).first()
    
    if not login_record:
        raise ValueError("Session not found")
    
    login_record.logout_at = datetime.utcnow()
    db.commit()
    
    return True