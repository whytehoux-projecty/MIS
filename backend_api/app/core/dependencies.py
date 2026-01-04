"""
Authentication and Authorization Dependencies

These dependencies can be used in route functions to:
1. Get the current authenticated user
2. Get the current authenticated admin
3. Require specific permissions

Usage:
    @router.get("/protected")
    def protected_route(user: ActiveUser = Depends(get_current_user)):
        return {"message": f"Hello, {user.username}"}
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.core.security import decode_access_token
from app.models.active_user import ActiveUser
from app.models.admin import Admin

# Security scheme for token extraction
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[ActiveUser]:
    """
    Get current user if authenticated, return None if not.
    
    Use this when authentication is optional.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        return None
    
    user_id = payload.get("user_id")
    if not user_id:
        return None
    
    user = db.query(ActiveUser).filter(
        ActiveUser.id == user_id,
        ActiveUser.is_active == True
    ).first()
    
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> ActiveUser:
    """
    Get current authenticated user from JWT token.
    
    Raises HTTPException if not authenticated.
    Use this to protect user-facing endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(ActiveUser).filter(
        ActiveUser.id == user_id,
        ActiveUser.is_active == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Get current authenticated admin from JWT token.
    
    Raises HTTPException if not authenticated as admin.
    Use this to protect admin-only endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check token type
    if payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    admin_id = payload.get("id")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    admin = db.query(Admin).filter(
        Admin.id == admin_id,
        Admin.is_active == True
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found or inactive"
        )
    
    return admin


def require_super_admin(admin: Admin = Depends(get_current_admin)) -> Admin:
    """
    Require super admin privileges.
    
    Use as a dependency to restrict endpoints to super admins only.
    
    Usage:
        @router.delete("/dangerous")
        def dangerous_action(admin: Admin = Depends(require_super_admin)):
            ...
    """
    if not admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return admin
