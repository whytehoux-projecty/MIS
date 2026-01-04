from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.user import PendingUserResponse, UserResponse
from app.schemas.admin import ApprovalRequest, RejectionRequest, LoginHistoryResponse, AdminLogin
from app.services import registration_service, admin_service, notification_service
from app.models.active_user import ActiveUser
from app.core.security import create_access_token
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.core.websocket_manager import manager

router = APIRouter()

from app.middleware.rate_limiter import login_rate_limiter

@router.post("/login", dependencies=[Depends(login_rate_limiter.check_rate_limit)])
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Authenticate admin and return access token
    """
    admin = admin_service.authenticate_admin(
        username=credentials.username,
        password=credentials.password,
        db=db
    )
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": admin.username, "type": "admin", "id": admin.id}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "role": "super_admin" if admin.is_super_admin else "admin"
        }
    }

@router.get("/pending", response_model=List[PendingUserResponse])
def get_pending_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get all users awaiting approval
    Admin control center calls this to display pending registrations
    """
    try:
        pending_users = registration_service.get_pending_users(db, skip, limit)
        return pending_users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pending users: {str(e)}"
        )

@router.get("/pending/{user_id}", response_model=PendingUserResponse)
def get_pending_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get full details of a specific pending user
    """
    try:
        pending_user = registration_service.get_pending_user_by_id(db, user_id)
        if not pending_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending user not found"
            )
        
        # Manually fetch invitation code if exists
        invitation_code = None
        if pending_user.invitation_id:
            from app.models.invitation import Invitation
            invitation = db.query(Invitation).filter(Invitation.id == pending_user.invitation_id).first()
            if invitation:
                invitation_code = invitation.code
        
        # Convert to Pydantic model and attach code
        # We use from_orm (pydantic v1) or model_validate (v2) or just constructor
        # simpler: create a dict and update it
        response_data = PendingUserResponse.model_validate(pending_user)
        response_data.invitation_code = invitation_code
        
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pending user: {str(e)}"
        )

@router.post("/approve/{user_id}", response_model=UserResponse)
async def approve_user(
    user_id: int,
    approval: ApprovalRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Approve a pending user registration
    Moves user from pending_users to active_users
    """
    try:
        # Approve the user
        active_user = registration_service.approve_user(
            user_id=user_id,
            admin_notes=approval.admin_notes,
            db=db
        )
        
        # Send approval notification to user
        await notification_service.notify_user_approval(
            email=active_user.email,
            username=active_user.username
        )
        
        return active_user
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve user: {str(e)}"
        )

@router.post("/reject/{user_id}")
def reject_user(
    user_id: int,
    rejection: RejectionRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Reject a pending user registration
    Marks user as reviewed with rejection reason
    """
    try:
        success = registration_service.reject_user(
            user_id=user_id,
            reason=rejection.reason,
            db=db
        )
        
        return {
            "success": success,
            "message": f"User {user_id} has been rejected"
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

class InfoRequest(BaseModel):
    question: str

@router.post("/request-info/{user_id}")
async def request_info(
    user_id: int,
    request: InfoRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Request more information from a pending user
    Sends an email to the user with the question
    """
    try:
        # Update user status
        pending_user = registration_service.request_more_info(
            user_id=user_id,
            question=request.question,
            db=db
        )
        
        # Send email to user
        subject = "Action Required: Additional Information Needed for Registration"
        message = f"""
        <h2>Hello {pending_user.username},</h2>
        <p>We are reviewing your registration. The administrator has requested the following information:</p>
        <blockquote style="background-color: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
            {request.question}
        </blockquote>
        <p>Please reply to this email or contact support with the requested details.</p>
        """
        
        await notification_service.send_user_notification(
            email=pending_user.email,
            subject=subject,
            message=message
        )
        
        return {
            "success": True,
            "message": f"Inquiry sent to {pending_user.email}"
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send inquiry: {str(e)}"
        )

@router.get("/login-history")
def get_login_history(
    user_id: Optional[int] = None,
    service_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get login history for admin dashboard
    Shows who logged into which service and when
    """
    try:
        history = admin_service.get_login_history(
            db=db,
            user_id=user_id,
            service_id=service_id,
            skip=skip,
            limit=limit
        )
        
        return history
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve login history: {str(e)}"
        )

@router.get("/user-stats/{user_id}")
def get_user_statistics(
    user_id: int, 
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get statistics for a specific user
    Shows total logins, services used, etc.
    """
    try:
        stats = admin_service.get_user_statistics(user_id, db)
        return stats
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get all active users
    """
    users = db.query(ActiveUser).offset(skip).limit(limit).all()
    return users


# ============================================================================
# SYSTEM SCHEDULE MANAGEMENT ENDPOINTS
# ============================================================================

from app.services import schedule_service
from app.schemas.schedule import (
    OperatingHoursUpdate, 
    SystemToggleRequest, 
    ScheduleResponse,
    ScheduleAuditResponse
)


@router.put("/system/operating-hours", response_model=ScheduleResponse)
async def update_operating_hours(
    schedule_update: OperatingHoursUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Update system operating hours
    
    Requires admin authentication
    Only super admins can modify system schedule
    All changes are logged in audit trail
    """
    # Check if user is super admin
    if not current_admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can modify system operating hours"
        )
    
    try:
        updated_schedule = schedule_service.update_operating_hours(
            db=db,
            opening_hour=schedule_update.opening_hour,
            opening_minute=schedule_update.opening_minute,
            closing_hour=schedule_update.closing_hour,
            closing_minute=schedule_update.closing_minute,
            warning_minutes=schedule_update.warning_minutes,
            admin_id=current_admin.id,
            timezone=schedule_update.timezone
        )
        
        # Broadcast new status to all connected clients
        await manager.broadcast(schedule_service.get_system_status(db))
        
        return ScheduleResponse(**updated_schedule.to_dict())
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update operating hours: {str(e)}"
        )


@router.post("/system/toggle", response_model=ScheduleResponse)
async def toggle_system_status(
    toggle_request: SystemToggleRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Manually override system status
    
    Allows super admins to:
    - Force system 'open' regardless of scheduled hours
    - Force system 'closed' regardless of scheduled hours
    - Return to 'auto' (scheduled) operation
    
    Optional duration can be set for temporary overrides
    """
    # Check if user is super admin
    if not current_admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can manually toggle system status"
        )
    
    try:
        if toggle_request.status == 'auto':
            # Clear manual override
            updated_schedule = schedule_service.clear_manual_override(
                db=db,
                admin_id=current_admin.id
            )
        else:
            # Set manual override
            updated_schedule = schedule_service.set_manual_override(
                db=db,
                status=toggle_request.status,
                admin_id=current_admin.id,
                reason=toggle_request.reason,
                duration_minutes=toggle_request.duration_minutes
            )
        

        
        # Broadcast new status to all connected clients
        await manager.broadcast(schedule_service.get_system_status(db))
        
        return ScheduleResponse(**updated_schedule.to_dict())
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle system status: {str(e)}"
        )


@router.get("/system/schedule", response_model=ScheduleResponse)
def get_current_schedule(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get current system schedule configuration
    
    Returns complete schedule including any active manual overrides
    """
    try:
        schedule = schedule_service.get_current_schedule(db)
        return ScheduleResponse(**schedule.to_dict())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve schedule: {str(e)}"
        )


@router.get("/system/audit-log", response_model=List[ScheduleAuditResponse])
def get_schedule_audit_log(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get audit log of system schedule changes
    
    Shows history of all schedule modifications and manual overrides
    Requires admin authentication
    """
    try:
        logs = schedule_service.get_schedule_audit_log(
            db=db,
            limit=limit,
            skip=skip
        )
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve audit log: {str(e)}"
        )